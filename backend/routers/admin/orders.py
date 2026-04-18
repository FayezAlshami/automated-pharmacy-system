"""
routers/admin/orders.py — إدارة الطلبات
GET   /api/admin/orders/bootstrap        — جلب كل الطلبات مع تفاصيلها
PATCH /api/admin/orders/{id}/status      — تحديث حالة طلب
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List

from database import get_db
from utils.auth import get_current_admin
from utils.helpers import format_order_record_for_admin, format_order_detail_for_admin
from schemas.order import AdminOrderBootstrapResponse, UpdateOrderStatusRequest

router = APIRouter()

# الحالات المقبولة للطلبات
VALID_STATUSES = {"pending", "success", "rejected", "review"}


@router.get("/orders/bootstrap", response_model=AdminOrderBootstrapResponse)
def get_orders_bootstrap(_: str = Depends(get_current_admin)):
    """
    جلب كل الطلبات مع تفاصيل عناصرها دفعة واحدة.
    يُستخدم لتحميل صفحة الطلبات في لوحة المدير.
    """
    db = get_db()
    try:
        orders = db.execute(
            "SELECT * FROM orders ORDER BY created_at DESC"
        ).fetchall()

        order_details = db.execute(
            "SELECT * FROM details_order"
        ).fetchall()

        return AdminOrderBootstrapResponse(
            orders=[format_order_record_for_admin(r) for r in orders],
            orderDetails=[format_order_detail_for_admin(r) for r in order_details],
        )
    finally:
        db.close()


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: str,
    payload: UpdateOrderStatusRequest,
    _: str = Depends(get_current_admin),
):
    """
    تحديث حالة طلب معين.
    الحالات المقبولة: pending, success, rejected, review
    """
    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"حالة غير صالحة. الحالات المقبولة: {', '.join(VALID_STATUSES)}"
        )

    db = get_db()
    try:
        order = db.execute(
            "SELECT order_id FROM orders WHERE order_id = ?", (order_id,)
        ).fetchone()
        if not order:
            raise HTTPException(status_code=404, detail="الطلب غير موجود")

        db.execute(
            "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?",
            (payload.status, order_id)
        )
        db.commit()

        return {"success": True, "orderId": order_id, "newStatus": payload.status}
    finally:
        db.close()
