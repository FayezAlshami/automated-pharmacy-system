"""
schemas/doctor.py — نماذج Pydantic الخاصة بالطبيب
تُستخدم للتحقق من صحة البيانات الواردة والصادرة لـ doctor-portal-app
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# طلبات المصادقة
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class LoginRequest(BaseModel):
    """بيانات تسجيل دخول الطبيب"""
    email: str
    password: str


class SignupRequest(BaseModel):
    """بيانات تسجيل طبيب جديد"""
    email: str
    password: str
    fullName: str = Field(min_length=2)
    specialty: str = ""
    clinicName: str = ""
    licenseNumber: str = ""
    phone: str = ""


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# استجابات الطبيب
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class DoctorAccountResponse(BaseModel):
    """بيانات حساب الطبيب كما يتوقعها الفرونت"""
    id: str
    fullName: str
    email: str
    password: str = "*"
    specialty: str = ""
    clinicName: str = ""
    licenseNumber: str = ""
    phone: str = ""
    role: str = "doctor"
    status: str = "active"
    joinedAt: str = ""


class LoginResponse(BaseModel):
    """استجابة تسجيل الدخول الناجح"""
    success: bool = True
    account: DoctorAccountResponse
