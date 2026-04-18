"""
routers/admin/dashboard.py — إحصائيات لوحة تحكم المدير
GET /api/admin/dashboard/stats — ملخص الإحصائيات الكلية
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from database import get_db
from utils.auth import get_current_admin

router = APIRouter()


class DashboardStatsResponse(BaseModel):
    totalDrugs: int = 0
    totalOrders: int = 0
    pendingOrders: int = 0
    lowStock: int = 0
    successfulOrders: int = 0
    failedOrders: int = 0


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(_: str = Depends(get_current_admin)):
    """
    جلب الإحصائيات الكاملة للوحة التحكم:
    - إجمالي الأدوية والطلبات
    - الطلبات المعلقة / الناجحة / المرفوضة
    - الأدوية منخفضة المخزون (أقل من 10 وحدات)
    """
    db = get_db()
    try:
        total_drugs = db.execute("SELECT COUNT(*) FROM drugs").fetchone()[0]

        total_orders = db.execute("SELECT COUNT(*) FROM orders").fetchone()[0]

        pending_orders = db.execute(
            "SELECT COUNT(*) FROM orders WHERE status = 'pending'"
        ).fetchone()[0]

        successful_orders = db.execute(
            "SELECT COUNT(*) FROM orders WHERE status = 'success'"
        ).fetchone()[0]

        failed_orders = db.execute(
            "SELECT COUNT(*) FROM orders WHERE status = 'rejected'"
        ).fetchone()[0]

        # الأدوية التي مخزونها أقل من 10 وحدات (ولم ينفد بالكامل)
        low_stock = db.execute(
            "SELECT COUNT(*) FROM drugs WHERE amount > 0 AND amount < 10"
        ).fetchone()[0]

        return DashboardStatsResponse(
            totalDrugs=total_drugs,
            totalOrders=total_orders,
            pendingOrders=pending_orders,
            lowStock=low_stock,
            successfulOrders=successful_orders,
            failedOrders=failed_orders,
        )
    finally:
        db.close()
