"""
routers/admin/inventory.py — إدارة المخزون
GET /api/admin/inventory/bootstrap — جلب كل بيانات المخزون دفعة واحدة
"""

from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from database import get_db
from utils.auth import get_current_admin
from utils.helpers import (
    format_drug_record_for_admin,
    format_category_record_for_admin,
    format_company_record_for_admin,
)

router = APIRouter()


class InventoryBootstrapResponse(BaseModel):
    categories: List[dict] = []
    companies: List[dict] = []
    drugs: List[dict] = []


@router.get("/inventory/bootstrap", response_model=InventoryBootstrapResponse)
def get_inventory_bootstrap(_: str = Depends(get_current_admin)):
    """
    جلب بيانات المخزون الكاملة للمدير دفعة واحدة:
    - كل التصنيفات
    - كل الشركات
    - كل الأدوية
    """
    db = get_db()
    try:
        categories = db.execute(
            "SELECT * FROM drug_category ORDER BY category_id"
        ).fetchall()

        companies = db.execute(
            "SELECT * FROM company_drug ORDER BY company_id"
        ).fetchall()

        drugs = db.execute(
            "SELECT * FROM drugs ORDER BY drug_id"
        ).fetchall()

        return InventoryBootstrapResponse(
            categories=[format_category_record_for_admin(r) for r in categories],
            companies=[format_company_record_for_admin(r) for r in companies],
            drugs=[format_drug_record_for_admin(r) for r in drugs],
        )
    finally:
        db.close()
