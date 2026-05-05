"""
websocket_hub.py — مدير اتصالات WebSocket المركزي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
يُدير اتصالين رئيسيين:
  1. ESP32 Controller  →  /ws/esp32
  2. Tablet Frontend   →  /ws/tablet/{operation_id}

تدفق الرسائل:
  Tablet --[start_dispense]--> Hub --> ESP32
  ESP32 --[dispense_progress]--> Hub --> Tablet
  ESP32 --[dispense_result]---> Hub --> Tablet + DB update
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import json
import re
import logging
from typing import Dict, Optional, Tuple

from fastapi import WebSocket
from starlette.websockets import WebSocketState

from database import get_db

logger = logging.getLogger(__name__)


def evaluate_order_eligibility_for_qr_operation(
    *,
    order_id: Optional[int] = None,
    operation_id: Optional[str] = None,
) -> Tuple[bool, str, int]:
    """
    تحقق من صلاحية الطلب لمسار qr_operation (إدخال يدوي / كاميرا ESP32).

    يُعيد:
        (accepted, message_code, order_id للرد JSON)
        order_id = -1 إذا لم يُعرف رقم الطلب من قاعدة البيانات (مثلاً طلب غير موجود بـ operation_id).
    """
    db = get_db()
    try:
        row = None
        response_oid = -1

        op = (operation_id or "").strip() if operation_id is not None else ""

        if op:
            row = db.execute(
                "SELECT order_id, status, is_pay FROM orders WHERE operation_id = ?",
                (op,),
            ).fetchone()
        elif order_id is not None:
            try:
                oid = int(order_id)
            except (TypeError, ValueError):
                return False, "invalid_order_id", -1
            if oid <= 0:
                return False, "invalid_order_id", -1
            response_oid = oid
            row = db.execute(
                "SELECT order_id, status, is_pay FROM orders WHERE order_id = ?",
                (oid,),
            ).fetchone()
        else:
            return False, "missing_order_reference", -1

        if row is None:
            return False, "order_not_found", response_oid if response_oid > 0 else -1

        response_oid = int(row["order_id"])
        status = (row["status"] or "").strip()
        is_pay = int(row["is_pay"] or 0)

        if status == "success":
            return False, "order_already_dispensed", response_oid
        if status in ("failed", "rejected", "cancelled"):
            return False, "order_not_available", response_oid
        if is_pay != 1:
            return False, "order_not_paid", response_oid

        # توافق مع تدفق التابلت: رفض إن وُجد دواء غير متوفر
        details = db.execute(
            """SELECT d.amount FROM details_order od
               JOIN drugs d ON d.drug_id = od.drug_id
               WHERE od.order_id = ?""",
            (response_oid,),
        ).fetchall()
        if details and any(int(d["amount"] or 0) == 0 for d in details):
            return False, "out_of_stock", response_oid

        return True, "operation_available", response_oid
    finally:
        db.close()

# ═══════════════════════════════════════════════════════════════
# نتائج ESP32 المعرّفة في ESPCode.cpp
# ═══════════════════════════════════════════════════════════════
RESULT_SUCCESS       = 210
RESULT_TIMEOUT       = 211
RESULT_BUSY          = 216
RESULT_SERVER_ERROR  = 218
RESULT_CONVEYOR_FAIL = 219


def _machine_col_to_cabinet(machine_column: str) -> int:
    """
    تحويل machine_column (مثل 'A1', 'C3', 'L6') إلى cabinet_id يقبله ESP32.

    منطق التحويل:
    - الأعمدة الإلكترونية المعتمدة للاختبار: A1→1, A2→2, A3→3, A4→4
    - نستخرج الرقم من نهاية السلسلة النصية.
    - نضع القيمة بين 1 و4 (الـ ESP32 يملك 4 كبائن).
    - مثال:  A1→1,  B2→2,  C3→3,  D4→4,  E5→1,  K3→3
    """
    normalized = str(machine_column or "").strip().upper()
    direct_map = {
        "A1": 1,
        "A2": 2,
        "A3": 3,
        "A4": 4,
    }
    if normalized in direct_map:
        return direct_map[normalized]

    match = re.search(r"(\d+)$", normalized)
    if not match:
        return 1
    num = int(match.group(1))
    # clamp to 1-4 using modulo, ensuring 4 maps to 4 (not 0)
    return ((num - 1) % 4) + 1


class ConnectionManager:
    """
    مدير الاتصالات المركزي.
    نسخة واحدة (singleton) مشتركة بين جميع الـ routes.
    """

    def __init__(self) -> None:
        self._esp32: Optional[WebSocket] = None
        self._tablets: Dict[str, WebSocket] = {}

    @staticmethod
    def _is_socket_alive(ws: Optional[WebSocket]) -> bool:
        if ws is None:
            return False
        return (
            ws.client_state != WebSocketState.DISCONNECTED
            and ws.application_state != WebSocketState.DISCONNECTED
        )

    # ─── ESP32 ───────────────────────────────────────────────────

    async def connect_esp32(self, ws: WebSocket) -> None:
        await ws.accept()
        previous = self._esp32
        self._esp32 = ws
        logger.info(
            "[WS-Hub] ESP32 connected socket_id=%s replaced_previous=%s",
            id(ws),
            previous is not None and previous is not ws,
        )

    def disconnect_esp32(self, ws: Optional[WebSocket] = None) -> None:
        if ws is not None and self._esp32 is not ws:
            logger.info(
                "[WS-Hub] Ignored stale ESP32 disconnect socket_id=%s active_socket_id=%s",
                id(ws),
                id(self._esp32) if self._esp32 else None,
            )
            return
        self._esp32 = None
        logger.info(
            "[WS-Hub] ESP32 disconnected socket_id=%s",
            id(ws) if ws is not None else None,
        )

    @property
    def esp32_connected(self) -> bool:
        return self._is_socket_alive(self._esp32)

    async def send_to_esp32(self, message: dict) -> bool:
        """يُرسل رسالة JSON إلى ESP32. يُعيد False إذا لم يكن متصلاً."""
        ws = self._esp32
        if not self._is_socket_alive(ws):
            logger.warning(
                "[WS-Hub] Tried to send to ESP32 but no active socket is registered"
            )
            return False
        try:
            await ws.send_text(json.dumps(message, ensure_ascii=False))
            return True
        except Exception as exc:
            logger.error("[WS-Hub] Failed to send to ESP32: %s", exc)
            self.disconnect_esp32(ws)
            return False

    # ─── Tablet ──────────────────────────────────────────────────

    async def connect_tablet(self, operation_id: str, ws: WebSocket) -> None:
        await ws.accept()
        self._tablets[operation_id] = ws
        logger.info("[WS-Hub] Tablet connected for operation_id=%s", operation_id)

    def disconnect_tablet(self, operation_id: str) -> None:
        self._tablets.pop(operation_id, None)
        logger.info("[WS-Hub] Tablet disconnected for operation_id=%s", operation_id)

    async def send_to_tablet(self, operation_id: str, message: dict) -> bool:
        """يُرسل رسالة JSON إلى الـ Tablet المرتبط بـ operation_id."""
        ws = self._tablets.get(operation_id)
        if not ws:
            logger.warning(
                "[WS-Hub] No tablet connection for operation_id=%s", operation_id
            )
            return False
        try:
            await ws.send_text(json.dumps(message, ensure_ascii=False))
            return True
        except Exception as exc:
            logger.error("[WS-Hub] Failed to send to tablet %s: %s", operation_id, exc)
            self._tablets.pop(operation_id, None)
            return False

    # ─── Dispense Command Builder ─────────────────────────────────

    def build_dispense_command(self, operation_id: str) -> Optional[dict]:
        """
        يبني رسالة dispense_command للـ ESP32 بناءً على بيانات الطلب في الداتابيس.

        البنية المُنتجة:
        {
            "type": "dispense_command",
            "job_id": <order_id>,
            "items": [
                {"cabinet_id": 1, "count": 2},
                ...
            ]
        }

        يُعيد None إذا لم يُوجد طلب مطابق.
        """
        db = get_db()
        try:
            order = db.execute(
                "SELECT order_id FROM orders WHERE operation_id = ?",
                (operation_id,),
            ).fetchone()

            if not order:
                logger.error(
                    "[WS-Hub] build_dispense_command: order not found for %s", operation_id
                )
                return None

            order_id = order["order_id"]

            details = db.execute(
                """SELECT d.machine_column, do.number_of_drug
                   FROM details_order do
                   JOIN drugs d ON d.drug_id = do.drug_id
                   WHERE do.order_id = ?""",
                (order_id,),
            ).fetchall()

            items = []
            for row in details:
                cabinet_id = _machine_col_to_cabinet(row["machine_column"])
                count = int(row["number_of_drug"] or 1)
                if count <= 0:
                    logger.warning(
                        "[WS-Hub] Skipping invalid count=%s for operation_id=%s machine_column=%s",
                        row["number_of_drug"],
                        operation_id,
                        row["machine_column"],
                    )
                    continue
                # دمج العناصر التي لها نفس cabinet_id (جمع العدد)
                existing = next((i for i in items if i["cabinet_id"] == cabinet_id), None)
                if existing:
                    existing["count"] += count
                else:
                    items.append({"cabinet_id": cabinet_id, "count": count})

            if not items:
                logger.error(
                    "[WS-Hub] build_dispense_command: no dispense items for %s",
                    operation_id,
                )
                return None

            return {
                "type": "dispense_command",
                "job_id": order_id,
                "items": items[:4],  # ESP32 has MAX_ITEMS = 4
            }
        finally:
            db.close()

    # ─── DB Update After Dispense Result ─────────────────────────

    def mark_order_status(self, operation_id: str, status: str) -> None:
        """يُحدّث حالة الطلب في الداتابيس بعد استلام dispense_result."""
        normalized_status = status
        if status in ("failed", "cancelled"):
            normalized_status = "rejected"
        elif status not in ("pending", "success", "rejected", "review"):
            normalized_status = "rejected"

        db = get_db()
        try:
            db.execute(
                """UPDATE orders
                   SET status = ?, updated_at = CURRENT_TIMESTAMP
                   WHERE operation_id = ?""",
                (normalized_status, operation_id),
            )
            db.commit()
            logger.info(
                "[WS-Hub] Order status updated to '%s' for operation_id=%s",
                normalized_status, operation_id,
            )
        except Exception as exc:
            logger.error("[WS-Hub] Failed to update order status: %s", exc)
        finally:
            db.close()

    def get_operation_id_for_job(self, job_id: int) -> Optional[str]:
        """يُعيد operation_id المرتبط بـ job_id (= order_id في داتابيسنا)."""
        db = get_db()
        try:
            row = db.execute(
                "SELECT operation_id FROM orders WHERE order_id = ?",
                (job_id,),
            ).fetchone()
            return row["operation_id"] if row else None
        finally:
            db.close()


# ─── Singleton ───────────────────────────────────────────────────────
manager = ConnectionManager()
