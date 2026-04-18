"""
routers/admin/auth.py — مصادقة المدير / الصيدلاني
POST /api/admin/auth/login           — تسجيل الدخول وإرجاع JWT
GET  /api/admin/auth/users/{user_id} — جلب بيانات المستخدم (للـ session restore)
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from database import get_db
from utils.auth import verify_password, create_access_token, get_current_admin
from utils.helpers import map_admin_role, fmt_doctor_id

router = APIRouter()


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    password: Optional[str] = None


class AdminLoginResponse(BaseModel):
    """
    استجابة مسطحة — user fields في الجذر + accessToken + token.
    الفرونت يفكك { accessToken, token, ...rest } ويقرأ rest.id, rest.name, ...
    """
    id: str
    name: str
    email: str
    role: str
    accessToken: str
    token: str


@router.post("/auth/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest):
    """
    تسجيل دخول المدير أو الصيدلاني.
    يتحقق من البريد وكلمة المرور، ويُرجع JWT token.
    الصلاحية: role IN ('admin', 'assistant')
    الاستجابة مسطحة (flat) لتتوافق مع mapLoginResponse في الفرونت.
    """
    db = get_db()
    try:
        # البحث عن المستخدم بدور مدير أو مساعد
        row = db.execute(
            "SELECT * FROM doctors WHERE email = ? AND role IN ('admin', 'assistant')",
            (payload.email.strip().lower(),)
        ).fetchone()

        if not row or not verify_password(payload.password, row["password"]):
            raise HTTPException(
                status_code=401,
                detail="بيانات تسجيل الدخول غير صحيحة أو ليس لديك صلاحية الوصول."
            )

        # إنشاء JWT token
        user_id = fmt_doctor_id(row["doctor_id"])
        token = create_access_token({"sub": user_id, "role": row["role"]})

        return AdminLoginResponse(
            id=user_id,
            name=row["fname"] or "",
            email=row["email"] or "",
            role=map_admin_role(row["role"] or "admin"),
            accessToken=token,
            token=token,
        )
    finally:
        db.close()


@router.get("/auth/users/{user_id}", response_model=AdminUserResponse)
def get_admin_user(
    user_id: str,
    _: str = Depends(get_current_admin),
):
    """
    جلب بيانات المستخدم الحالي لاستعادة الجلسة بعد إعادة التحميل.
    """
    db = get_db()
    try:
        # تحليل المعرف — يقبل 'doc-01' أو رقم
        try:
            numeric_id = int(user_id.replace("doc-", ""))
        except ValueError:
            raise HTTPException(status_code=400, detail="معرف المستخدم غير صالح")

        row = db.execute(
            "SELECT * FROM doctors WHERE doctor_id = ? AND role IN ('admin', 'assistant')",
            (numeric_id,)
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="المستخدم غير موجود")

        return AdminUserResponse(
            id=fmt_doctor_id(row["doctor_id"]),
            name=row["fname"] or "",
            email=row["email"] or "",
            role=map_admin_role(row["role"] or "admin"),
        )
    finally:
        db.close()
