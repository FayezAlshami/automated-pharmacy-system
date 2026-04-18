"""
schemas/order.py — نماذج Pydantic للطلبات
تُستخدم لـ doctor portal وadmin portal
"""

from pydantic import BaseModel
from typing import Optional, List


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Doctor Portal Orders
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class OrderItemRequest(BaseModel):
    """عنصر واحد في طلب الطبيب"""
    drugId: str
    quantity: int = 1
    unitPrice: float = 0.0


class CreateOrderRequest(BaseModel):
    """إنشاء طلب جديد من الطبيب"""
    doctorId: str
    items: List[OrderItemRequest]
    totalPrice: float = 0.0


class OrderItemResponse(BaseModel):
    """تفصيلة طلب في الاستجابة"""
    drugId: str
    drugName: str = ""
    quantity: int
    unitPrice: float
    subtotal: float


class RecentOrderResponse(BaseModel):
    """طلب حديث للطبيب"""
    id: str
    doctorId: Optional[str] = None
    status: str
    totalPrice: float
    isPaid: bool
    createdAt: str
    updatedAt: str
    items: List[OrderItemResponse] = []


class CheckoutResponse(BaseModel):
    """استجابة بعد إتمام Checkout — تحتوي بيانات QR Code"""
    orderId: int
    operationId: str
    totalPrice: float
    itemCount: int
    createdAt: str


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Admin Portal Orders
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AdminOrderRecord(BaseModel):
    """سجل طلب في لوحة المدير"""
    order_id: str
    doctor_id: Optional[str] = None
    status: str
    total_price: float
    is_pay: bool
    created_at: str
    updated_at: str


class AdminOrderDetailRecord(BaseModel):
    """تفصيلة طلب في لوحة المدير"""
    order_detail_id: str
    order_id: str
    drug_id: str
    number_of_drug: int
    price_of_one_drug: float


class AdminOrderBootstrapResponse(BaseModel):
    """bootstrap data للطلبات في لوحة المدير"""
    orders: List[AdminOrderRecord] = []
    orderDetails: List[AdminOrderDetailRecord] = []


class UpdateOrderStatusRequest(BaseModel):
    """تحديث حالة طلب"""
    status: str
