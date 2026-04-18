"""
routers/admin/users.py — إدارة الأطباء
GET /api/admin/users/doctors — جلب كل الأطباء (role='doctor')
"""

from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from database import get_db
from utils.auth import get_current_admin
from utils.helpers import format_doctor_record_for_admin

router = APIRouter()


class DoctorListResponse(BaseModel):
    doctors: List[dict] = []


@router.get("/users/doctors", response_model=DoctorListResponse)
def get_doctors(_: str = Depends(get_current_admin)):
    """
    جلب كل الأطباء المسجلين (role='doctor').
    يُستخدم في صفحة إدارة المستخدمين بلوحة المدير.
    """
    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM doctors WHERE role = 'doctor' ORDER BY created_at DESC"
        ).fetchall()

        return DoctorListResponse(
            doctors=[format_doctor_record_for_admin(r) for r in rows]
        )
    finally:
        db.close()
