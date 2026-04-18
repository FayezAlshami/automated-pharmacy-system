"""
routers/admin/patients.py — إدارة مرضى الشركات
GET /api/admin/patients — جلب كل المرضى المسجلين
"""

from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from database import get_db
from utils.auth import get_current_admin
from utils.helpers import format_patient_record_for_admin

router = APIRouter()


class PatientsListResponse(BaseModel):
    patients: List[dict] = []


@router.get("/patients", response_model=PatientsListResponse)
def get_patients(_: str = Depends(get_current_admin)):
    """
    جلب كل مرضى الشركات المسجلين في النظام.
    يُستخدم في صفحة إدارة المرضى بلوحة المدير.
    """
    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM company_patients ORDER BY created_at DESC"
        ).fetchall()

        return PatientsListResponse(
            patients=[format_patient_record_for_admin(r) for r in rows]
        )
    finally:
        db.close()
