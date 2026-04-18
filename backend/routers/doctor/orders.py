"""
routers/doctor/orders.py — طلبات الطبيب
GET  /api/doctor/orders/recent       — آخر طلبات الطبيب
POST /api/doctor/orders              — إنشاء طلب جديد
POST /api/doctor/orders/checkout     — إتمام طلب مع توليد operation_id لـ QR
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query

from database import get_db
from schemas.order import (
    RecentOrderResponse, CreateOrderRequest, OrderItemResponse,
    CheckoutResponse,
)
from utils.helpers import (
    format_recent_order, format_order_item, parse_doctor_id, fmt_drug_id
)

router = APIRouter()

DRUG_QUERY = """
    SELECT d.drug_id, d.dname, d.price, dc.slug AS category_slug
    FROM drugs d
    JOIN drug_category dc ON d.category_id = dc.category_id
    WHERE d.drug_id = ?
"""


def _get_order_items(db, order_id: int) -> list:
    """جلب عناصر الطلب مع بيانات الدواء"""
    details = db.execute(
        """SELECT od.order_detail_id, od.order_id, od.drug_id,
                  od.number_of_drug, od.price_of_one_drug
           FROM details_order od
           WHERE od.order_id = ?""",
        (order_id,)
    ).fetchall()

    items = []
    for detail in details:
        drug = db.execute(DRUG_QUERY, (detail["drug_id"],)).fetchone()
        items.append(format_order_item(detail, drug))

    return items


@router.get("/orders/recent", response_model=List[RecentOrderResponse])
def get_recent_orders(doctorId: str = Query(...)):
    """
    جلب آخر طلبات الطبيب.
    يقبل doctorId بصيغة 'doc-01'.
    """
    db = get_db()
    try:
        # تحليل معرف الطبيب
        numeric_id = parse_doctor_id(doctorId) if doctorId.startswith("doc-") else int(doctorId)
        if numeric_id <= 0:
            raise HTTPException(status_code=400, detail="معرف الطبيب غير صالح")

        # جلب آخر 20 طلب للطبيب
        orders = db.execute(
            """SELECT * FROM orders
               WHERE doctor_id = ?
               ORDER BY created_at DESC
               LIMIT 20""",
            (numeric_id,)
        ).fetchall()

        result = []
        for order in orders:
            items = _get_order_items(db, order["order_id"])
            result.append(RecentOrderResponse(**format_recent_order(order, items)))

        return result
    except ValueError:
        raise HTTPException(status_code=400, detail="معرف الطبيب غير صالح")
    finally:
        db.close()


@router.post("/orders", response_model=RecentOrderResponse, status_code=201)
def create_order(payload: CreateOrderRequest):
    """
    إنشاء طلب جديد من الطبيب.
    يُدخل الطلب وعناصره في الداتابيس.
    """
    db = get_db()
    try:
        # تحليل معرف الطبيب
        numeric_doctor_id = (
            parse_doctor_id(payload.doctorId)
            if payload.doctorId.startswith("doc-")
            else int(payload.doctorId)
        )
        if numeric_doctor_id <= 0:
            raise HTTPException(status_code=400, detail="معرف الطبيب غير صالح")

        # التحقق من وجود الطبيب
        doctor = db.execute(
            "SELECT doctor_id FROM doctors WHERE doctor_id = ?", (numeric_doctor_id,)
        ).fetchone()
        if not doctor:
            raise HTTPException(status_code=404, detail="الطبيب غير موجود")

        # إدخال الطلب الرئيسي
        cursor = db.execute(
            """INSERT INTO orders (doctor_id, status, total_price, is_pay,
                                   created_at, updated_at)
               VALUES (?, 'pending', ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
            (numeric_doctor_id, payload.totalPrice)
        )
        order_id = cursor.lastrowid

        # إدخال عناصر الطلب
        items_response = []
        for item in payload.items:
            # تحليل drug_id من صيغة 'slug-drug-N'
            if "-drug-" in item.drugId:
                numeric_drug_id = int(item.drugId.split("-drug-")[-1])
            else:
                numeric_drug_id = int(item.drugId)

            db.execute(
                """INSERT INTO details_order
                   (order_id, drug_id, number_of_drug, price_of_one_drug)
                   VALUES (?, ?, ?, ?)""",
                (order_id, numeric_drug_id, item.quantity, item.unitPrice)
            )

            # جلب اسم الدواء للاستجابة
            drug = db.execute(DRUG_QUERY, (numeric_drug_id,)).fetchone()
            items_response.append(OrderItemResponse(
                drugId=item.drugId,
                drugName=drug["dname"] if drug else "—",
                quantity=item.quantity,
                unitPrice=item.unitPrice,
                subtotal=item.quantity * item.unitPrice,
            ))

        db.commit()

        # جلب الطلب المنشأ وإرجاعه
        new_order = db.execute(
            "SELECT * FROM orders WHERE order_id = ?", (order_id,)
        ).fetchone()

        return RecentOrderResponse(**format_recent_order(new_order, [i.model_dump() for i in items_response]))
    except ValueError:
        raise HTTPException(status_code=400, detail="معرف الدواء غير صالح")
    finally:
        db.close()


def _generate_operation_id(order_id: int) -> str:
    """توليد operation_id فريد بصيغة OP-XXXXX"""
    return f"OP-{order_id + 22000}"


@router.post("/orders/checkout", response_model=CheckoutResponse, status_code=201)
def checkout(payload: CreateOrderRequest):
    """
    إتمام طلب من الطبيب — يُنشئ الطلب ويولّد operation_id لرمز QR.
    يُستخدم operation_id عند مسح الرمز بكاميرا ESP32 لبدء الصرف الآلي.
    """
    db = get_db()
    try:
        numeric_doctor_id = (
            parse_doctor_id(payload.doctorId)
            if payload.doctorId.startswith("doc-")
            else int(payload.doctorId)
        )
        if numeric_doctor_id <= 0:
            raise HTTPException(status_code=400, detail="معرف الطبيب غير صالح")

        doctor = db.execute(
            "SELECT doctor_id FROM doctors WHERE doctor_id = ?", (numeric_doctor_id,)
        ).fetchone()
        if not doctor:
            raise HTTPException(status_code=404, detail="الطبيب غير موجود")

        cursor = db.execute(
            """INSERT INTO orders (doctor_id, status, total_price, is_pay,
                                   created_at, updated_at)
               VALUES (?, 'pending', ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
            (numeric_doctor_id, payload.totalPrice)
        )
        order_id = cursor.lastrowid

        operation_id = _generate_operation_id(order_id)
        db.execute(
            "UPDATE orders SET operation_id = ? WHERE order_id = ?",
            (operation_id, order_id)
        )

        for item in payload.items:
            if "-drug-" in item.drugId:
                numeric_drug_id = int(item.drugId.split("-drug-")[-1])
            else:
                numeric_drug_id = int(item.drugId)

            db.execute(
                """INSERT INTO details_order
                   (order_id, drug_id, number_of_drug, price_of_one_drug)
                   VALUES (?, ?, ?, ?)""",
                (order_id, numeric_drug_id, item.quantity, item.unitPrice)
            )

        db.commit()

        new_order = db.execute(
            "SELECT * FROM orders WHERE order_id = ?", (order_id,)
        ).fetchone()

        return CheckoutResponse(
            orderId=order_id,
            operationId=operation_id,
            totalPrice=float(new_order["total_price"]),
            itemCount=len(payload.items),
            createdAt=new_order["created_at"],
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="معرف الدواء غير صالح")
    finally:
        db.close()
