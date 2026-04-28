"""
main.py — نقطة دخول FastAPI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تشغيل الباك اند:
    cd backend
    uvicorn main:app --reload --port 8000

الـ API prefix الموحد: /api
CORS مفعّل لجميع منافذ localhost المستخدمة في التطوير

WebSocket endpoints:
  ws://<host>/ws/esp32              ← اتصال ESP32
  ws://<host>/ws/tablet/{op_id}    ← اتصال الجهاز اللوحي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import json
import logging
import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from websocket_hub import (
    RESULT_SERVER_ERROR,
    RESULT_SUCCESS,
    evaluate_order_eligibility_for_qr_operation,
    manager,
)

logger = logging.getLogger(__name__)


def _build_allowed_origins() -> list[str]:
    defaults = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:4173",
        "http://localhost:4174",
        "http://localhost:4175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "https://localhost:5173",
        "https://localhost:5174",
        "https://localhost:5175",
        "https://127.0.0.1:5173",
        "https://127.0.0.1:5174",
        "https://127.0.0.1:5175",
    ]

    extra_origins: list[str] = []
    for env_name in ("FRONTEND_ORIGINS", "CORS_ALLOW_ORIGINS"):
        raw_value = os.getenv(env_name, "")
        if not raw_value:
            continue
        extra_origins.extend(
            origin.strip() for origin in raw_value.split(",") if origin.strip()
        )

    deduped: list[str] = []
    seen: set[str] = set()
    for origin in [*defaults, *extra_origins]:
        if origin in seen:
            continue
        seen.add(origin)
        deduped.append(origin)
    return deduped


def _tablet_dispense_error_message(message_code: str) -> str:
    messages = {
        "missing_order_reference": "تعذر تحديد العملية المطلوبة لبدء الصرف.",
        "invalid_order_id": "مرجع العملية غير صالح.",
        "order_not_found": "العملية غير موجودة في النظام.",
        "order_already_dispensed": "تم صرف هذه العملية مسبقاً.",
        "order_not_available": "العملية غير متاحة للصرف حالياً.",
        "order_not_paid": "لا يمكن بدء الصرف قبل إتمام الدفع.",
        "out_of_stock": "لا يمكن بدء الصرف لأن أحد الأدوية غير متوفر حالياً.",
        "operation_available": "العملية متاحة للصرف.",
        "server_error": "حدث خطأ في التحقق من العملية. يرجى مراجعة الصيدلي.",
    }
    return messages.get(
        message_code,
        "تعذر بدء عملية الصرف. يرجى مراجعة الصيدلي.",
    )

# استيراد routers الطبيب
from routers.doctor import auth as doctor_auth
from routers.doctor import catalog as doctor_catalog
from routers.doctor import orders as doctor_orders

# استيراد router الجهاز اللوحي للمريض
from routers.tablet import flow as tablet_flow

# استيراد routers المدير
from routers.admin import auth as admin_auth
from routers.admin import dashboard as admin_dashboard
from routers.admin import inventory as admin_inventory
from routers.admin import orders as admin_orders
from routers.admin import users as admin_users
from routers.admin import patients as admin_patients
from routers.admin import doctor_requests as admin_doctor_requests

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# إنشاء تطبيق FastAPI
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app = FastAPI(
    title="نظام الصيدلية المؤتمتة — API موحد",
    description="خادم FastAPI يخدم doctor-portal-app و patient-tablet-app و admin-pharmacist-app",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# إعدادات CORS
# السماح للفرونت من أي منفذ localhost بالتواصل مع الباك اند
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# تسجيل routers — Doctor Portal
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.include_router(doctor_auth.router,    prefix="/api/doctor", tags=["Doctor — Auth"])
app.include_router(doctor_catalog.router, prefix="/api/doctor", tags=["Doctor — Catalog"])
app.include_router(doctor_orders.router,  prefix="/api/doctor", tags=["Doctor — Orders"])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# تسجيل routers — Patient Tablet
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.include_router(tablet_flow.router, prefix="/api/tablet", tags=["Patient Tablet"])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# تسجيل routers — Admin Portal
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.include_router(admin_auth.router,            prefix="/api/admin", tags=["Admin — Auth"])
app.include_router(admin_dashboard.router,       prefix="/api/admin", tags=["Admin — Dashboard"])
app.include_router(admin_inventory.router,       prefix="/api/admin", tags=["Admin — Inventory"])
app.include_router(admin_orders.router,          prefix="/api/admin", tags=["Admin — Orders"])
app.include_router(admin_users.router,           prefix="/api/admin", tags=["Admin — Users"])
app.include_router(admin_patients.router,        prefix="/api/admin", tags=["Admin — Patients"])
app.include_router(admin_doctor_requests.router, prefix="/api/admin", tags=["Admin — Doctor Requests"])


@app.get("/api/health", tags=["Health"])
def health_check():
    """فحص حالة الباك اند"""
    return {"status": "ok", "message": "الصيدلية المؤتمتة — الباك اند يعمل"}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# WebSocket — ESP32 Controller
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.websocket("/ws/esp32")
async def ws_esp32(websocket: WebSocket):
    """
    نقطة اتصال ESP32.
    يُسجَّل الجهاز عند الاتصال ويبدأ استقبال الرسائل.

    الرسائل الواردة من ESP32:
      device_hello       → تأكيد الاتصال (لا يوجد رد)
      qr_operation       → ESP32 يطلب أمر صرف بناءً على QR
      device_status      → إشعار انشغال الجهاز
      dispense_progress  → تحديث مرحلة الصرف → يُعاد توجيهه للـ Tablet
      dispense_result    → النتيجة النهائية → يُعاد توجيهه + تحديث DB
    """
    await manager.connect_esp32(websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                logger.warning("[WS-ESP32] Invalid JSON received: %s", raw[:120])
                continue

            msg_type = msg.get("type", "")
            logger.info("[WS-ESP32] Received type=%s", msg_type)

            if msg_type == "device_hello":
                logger.info("[WS-ESP32] device=%s connected", msg.get("device"))

            elif msg_type == "qr_operation":
                # ─────────────────────────────────────────────────────────
                # ESP32: إما order_id رقمي أو operation_id نصي (مثل OP-22035)
                # الرد دائماً: qr_operation_response
                # ─────────────────────────────────────────────────────────
                raw_oid = msg.get("order_id")
                op_id = msg.get("operation_id")
                if isinstance(op_id, str):
                    op_id = op_id.strip() or None

                parsed_order_id = None
                if raw_oid is not None:
                    try:
                        parsed_order_id = int(raw_oid)
                    except (TypeError, ValueError):
                        parsed_order_id = None

                logger.info(
                    "[WS-ESP32] qr_operation order_id=%s operation_id=%s",
                    parsed_order_id,
                    op_id,
                )

                try:
                    accepted, resp_message, resp_order_id = (
                        evaluate_order_eligibility_for_qr_operation(
                            order_id=parsed_order_id,
                            operation_id=op_id,
                        )
                    )
                except Exception as exc:
                    logger.error("[WS-ESP32] qr_operation check failed: %s", exc)
                    accepted = False
                    resp_message = "server_error"
                    resp_order_id = parsed_order_id if parsed_order_id else -1

                response = {
                    "type": "qr_operation_response",
                    "order_id": resp_order_id,
                    "accepted": accepted,
                    "message": resp_message,
                }
                try:
                    await websocket.send_text(json.dumps(response, ensure_ascii=False))
                    logger.info(
                        "[WS-ESP32] qr_operation_response sent: order_id=%s accepted=%s message=%s",
                        resp_order_id,
                        accepted,
                        resp_message,
                    )
                except Exception as exc:
                    logger.error("[WS-ESP32] Failed to send qr_operation_response: %s", exc)

            elif msg_type == "device_status":
                # الجهاز مشغول
                result_code = msg.get("result_code")
                logger.warning("[WS-ESP32] device_status result_code=%s msg=%s", result_code, msg.get("message"))

            elif msg_type in ("dispense_progress", "dispense_result"):
                # نعيد توجيه الرسالة إلى الـ Tablet المرتبط بهذا job_id
                raw_job_id = msg.get("job_id")
                if raw_job_id is None:
                    continue
                try:
                    job_id = int(raw_job_id)
                except (TypeError, ValueError):
                    logger.warning("[WS-ESP32] Invalid job_id in %s: %r", msg_type, raw_job_id)
                    continue

                operation_id = manager.get_operation_id_for_job(job_id)
                if not operation_id:
                    logger.warning("[WS-ESP32] No operation_id found for job_id=%s", job_id)
                    continue

                await manager.send_to_tablet(operation_id, msg)

                if msg_type == "dispense_result":
                    raw_result_code = msg.get("result_code", 0)
                    try:
                        result_code = int(raw_result_code)
                    except (TypeError, ValueError):
                        logger.warning(
                            "[WS-ESP32] Invalid result_code in dispense_result: %r",
                            raw_result_code,
                        )
                        result_code = RESULT_SERVER_ERROR
                    if result_code == RESULT_SUCCESS:
                        manager.mark_order_status(operation_id, "success")
                    else:
                        manager.mark_order_status(operation_id, "rejected")

            else:
                logger.warning("[WS-ESP32] Unknown message type: %s", msg_type)

    except WebSocketDisconnect:
        manager.disconnect_esp32()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# WebSocket — Tablet Frontend
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.websocket("/ws/tablet/{operation_id}")
async def ws_tablet(websocket: WebSocket, operation_id: str):
    """
    نقطة اتصال الجهاز اللوحي مرتبطة بـ operation_id.

    الرسائل الواردة من الـ Tablet:
      start_dispense → يبني dispense_command ويرسله للـ ESP32
    """
    await manager.connect_tablet(operation_id, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                logger.warning("[WS-Tablet] Invalid JSON: %s", raw[:120])
                continue

            msg_type = msg.get("type", "")
            logger.info("[WS-Tablet] op=%s type=%s", operation_id, msg_type)

            if msg_type == "start_dispense":
                try:
                    accepted, eligibility_message, order_id = (
                        evaluate_order_eligibility_for_qr_operation(
                            operation_id=operation_id,
                        )
                    )
                except Exception as exc:
                    logger.error(
                        "[WS-Tablet] eligibility check failed for op=%s: %s",
                        operation_id,
                        exc,
                    )
                    await manager.send_to_tablet(operation_id, {
                        "type": "dispense_result",
                        "job_id": -1,
                        "result_code": RESULT_SERVER_ERROR,
                        "message": _tablet_dispense_error_message("server_error"),
                    })
                    continue

                if not accepted:
                    await manager.send_to_tablet(operation_id, {
                        "type": "dispense_result",
                        "job_id": order_id if order_id and order_id > 0 else -1,
                        "result_code": RESULT_SERVER_ERROR,
                        "message": _tablet_dispense_error_message(eligibility_message),
                    })
                    continue

                if not manager.esp32_connected:
                    await manager.send_to_tablet(operation_id, {
                        "type": "dispense_result",
                        "job_id": -1,
                        "result_code": RESULT_SERVER_ERROR,
                        "message": "الجهاز غير متصل حالياً. يرجى التواصل مع الصيدلي.",
                    })
                    continue

                command = manager.build_dispense_command(operation_id)
                if not command:
                    await manager.send_to_tablet(operation_id, {
                        "type": "dispense_result",
                        "job_id": -1,
                        "result_code": RESULT_SERVER_ERROR,
                        "message": "تعذر بناء أمر الصرف. يرجى مراجعة الصيدلي.",
                    })
                    continue

                sent = await manager.send_to_esp32(command)
                if not sent:
                    await manager.send_to_tablet(operation_id, {
                        "type": "dispense_result",
                        "job_id": command.get("job_id", -1),
                        "result_code": RESULT_SERVER_ERROR,
                        "message": "تعذر الاتصال بالجهاز. يرجى مراجعة الصيدلي.",
                    })

            else:
                logger.warning("[WS-Tablet] Unknown message type: %s", msg_type)

    except WebSocketDisconnect:
        manager.disconnect_tablet(operation_id)
