"""
routers/doctor/auth.py — مصادقة الطبيب
POST /api/doctor/auth/login    — تسجيل الدخول
POST /api/doctor/auth/register — تسجيل حساب جديد (status='pending')
GET  /api/doctor/profile/{id}  — جلب بيانات الطبيب
"""

import sqlite3

from fastapi import APIRouter, HTTPException
from database import get_db
from schemas.doctor import LoginRequest, SignupRequest, DoctorAccountResponse
from utils.auth import hash_password, verify_password
from utils.helpers import format_doctor_account, parse_doctor_id

router = APIRouter()


@router.post("/auth/login", response_model=DoctorAccountResponse)
def doctor_login(payload: LoginRequest):
    """
    تسجيل دخول الطبيب.
    يتحقق من البريد الإلكتروني وكلمة المرور وحالة الحساب.
    يُرجع DoctorAccount مباشرةً (بدون wrapper) كما يتوقع الفرونت.
    """
    db = get_db()
    try:
        row = db.execute(
            "SELECT * FROM doctors WHERE email = ?",
            (payload.email.strip().lower(),)
        ).fetchone()

        # التحقق من وجود الحساب وصحة كلمة المرور
        if not row or not verify_password(payload.password, row["password"]):
            raise HTTPException(status_code=401, detail="بريد إلكتروني أو كلمة مرور غير صحيحة")

        # التحقق من حالة الحساب — المرفوض فقط يُمنع الدخول
        # الحسابات «قيد المراجعة» تُسمح لها بالدخول؛ الواجهة تعرض تنبيهاً حتى الموافقة
        account_status = row["status"] if "status" in row.keys() else "active"
        if account_status == "rejected":
            raise HTTPException(status_code=403, detail="تم رفض حسابك. يرجى التواصل مع الإدارة.")

        return DoctorAccountResponse(**format_doctor_account(row))
    finally:
        db.close()


@router.post("/auth/register", response_model=DoctorAccountResponse, status_code=201)
def doctor_register(payload: SignupRequest):
    """
    تسجيل طبيب جديد.
    يُحفظ الحساب بحالة 'pending' حتى يوافق عليه المدير.
    """
    db = get_db()
    try:
        email = payload.email.strip().lower()
        phone = payload.phone.strip()
        full_name = payload.fullName.strip()
        specialty = payload.specialty.strip()
        clinic_name = payload.clinicName.strip()
        license_number = payload.licenseNumber.strip()

        if not phone:
            raise HTTPException(status_code=400, detail="رقم الهاتف مطلوب")

        # التحقق المبكر من التعارضات المفروضة في قاعدة البيانات
        existing = db.execute(
            "SELECT email, phone FROM doctors WHERE email = ? OR phone = ?",
            (email, phone),
        ).fetchall()
        for row in existing:
            if row["email"] == email:
                raise HTTPException(status_code=409, detail="البريد الإلكتروني مستخدم مسبقاً")
            if row["phone"] == phone:
                raise HTTPException(status_code=409, detail="رقم الهاتف مستخدم مسبقاً")

        # تشفير كلمة المرور وإدخال السجل
        hashed = hash_password(payload.password)
        try:
            cursor = db.execute(
                """INSERT INTO doctors
                   (fname, email, password, phone, role, specialty, clinic_name,
                    license_number, status, created_at, updated_at)
                   VALUES (?, ?, ?, ?, 'doctor', ?, ?, ?, 'pending',
                           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)""",
                (
                    full_name,
                    email,
                    hashed,
                    phone,
                    specialty,
                    clinic_name,
                    license_number,
                )
            )
            db.commit()
        except sqlite3.IntegrityError as exc:
            db.rollback()
            error_text = str(exc)
            if "doctors.email" in error_text:
                raise HTTPException(status_code=409, detail="البريد الإلكتروني مستخدم مسبقاً")
            if "doctors.phone" in error_text:
                raise HTTPException(status_code=409, detail="رقم الهاتف مستخدم مسبقاً")
            raise HTTPException(status_code=500, detail="تعذر إنشاء الحساب حالياً") from exc

        new_id = cursor.lastrowid

        # جلب السجل المدخل وإرجاعه
        row = db.execute(
            "SELECT * FROM doctors WHERE doctor_id = ?", (new_id,)
        ).fetchone()

        return DoctorAccountResponse(**format_doctor_account(row))
    finally:
        db.close()


@router.get("/profile/{doctor_id}", response_model=DoctorAccountResponse)
def get_doctor_profile(doctor_id: str):
    """
    جلب بيانات الطبيب بمعرّفه.
    يقبل الصيغة 'doc-01' أو الرقم الصحيح.
    """
    db = get_db()
    try:
        # تحليل المعرف — يقبل 'doc-01' أو '1'
        numeric_id = parse_doctor_id(doctor_id) if doctor_id.startswith("doc-") else int(doctor_id)
        if numeric_id <= 0:
            raise HTTPException(status_code=400, detail="معرف الطبيب غير صالح")

        row = db.execute(
            "SELECT * FROM doctors WHERE doctor_id = ?", (numeric_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="الطبيب غير موجود")

        return DoctorAccountResponse(**format_doctor_account(row))
    except ValueError:
        raise HTTPException(status_code=400, detail="معرف الطبيب غير صالح")
    finally:
        db.close()
