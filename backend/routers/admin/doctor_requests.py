"""
routers/admin/doctor_requests.py — طلبات تسجيل الأطباء
GET   /api/admin/doctor-signup-requests         — جلب طلبات التسجيل المعلقة
PATCH /api/admin/doctor-requests/{id}/approve   — قبول الطلب (status='active')
PATCH /api/admin/doctor-requests/{id}/reject    — رفض الطلب (status='rejected')
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from database import get_db
from utils.auth import get_current_admin
from utils.helpers import format_signup_request_for_admin

router = APIRouter()


class DoctorRequestsResponse(BaseModel):
    requests: List[dict] = []


@router.get("/doctor-signup-requests", response_model=DoctorRequestsResponse)
def get_signup_requests(_: str = Depends(get_current_admin)):
    """
    جلب كل طلبات تسجيل الأطباء (الحالات: pending, active, rejected).
    يُستخدم في صفحة مراجعة طلبات التسجيل بلوحة المدير.
    """
    db = get_db()
    try:
        rows = db.execute(
            """SELECT * FROM doctors
               WHERE role = 'doctor'
               ORDER BY created_at DESC"""
        ).fetchall()

        return DoctorRequestsResponse(
            requests=[format_signup_request_for_admin(r) for r in rows]
        )
    finally:
        db.close()


@router.patch("/doctor-requests/{doctor_id}/approve")
def approve_doctor_request(
    doctor_id: str,
    _: str = Depends(get_current_admin),
):
    """قبول طلب تسجيل طبيب — يُحدّث status إلى 'active'"""
    db = get_db()
    try:
        doctor = db.execute(
            "SELECT doctor_id, status FROM doctors WHERE doctor_id = ?", (doctor_id,)
        ).fetchone()
        if not doctor:
            raise HTTPException(status_code=404, detail="الطبيب غير موجود")

        db.execute(
            "UPDATE doctors SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE doctor_id = ?",
            (doctor_id,)
        )
        db.commit()

        return {"success": True, "doctorId": doctor_id, "newStatus": "approved"}
    finally:
        db.close()


@router.patch("/doctor-requests/{doctor_id}/reject")
def reject_doctor_request(
    doctor_id: str,
    _: str = Depends(get_current_admin),
):
    """رفض طلب تسجيل طبيب — يُحدّث status إلى 'rejected'"""
    db = get_db()
    try:
        doctor = db.execute(
            "SELECT doctor_id FROM doctors WHERE doctor_id = ?", (doctor_id,)
        ).fetchone()
        if not doctor:
            raise HTTPException(status_code=404, detail="الطبيب غير موجود")

        db.execute(
            "UPDATE doctors SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE doctor_id = ?",
            (doctor_id,)
        )
        db.commit()

        return {"success": True, "doctorId": doctor_id, "newStatus": "rejected"}
    finally:
        db.close()
