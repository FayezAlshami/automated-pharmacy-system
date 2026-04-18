"""
utils/auth.py — أدوات المصادقة والتشفير
- تشفير كلمات المرور باستخدام bcrypt
- إنشاء والتحقق من JWT tokens للمدير
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# إعدادات JWT
# في بيئة الإنتاج يجب تخزين SECRET_KEY في متغير بيئة آمن
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECRET_KEY = "pharmacy-lol-secret-2026-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# مخطط HTTP Bearer للـ admin routes
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """تشفير كلمة المرور باستخدام bcrypt مباشرةً"""
    # تقليم كلمة المرور إلى 72 بايت (حد bcrypt)
    pw_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """التحقق من تطابق كلمة المرور المدخلة مع المشفرة"""
    try:
        pw_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict) -> str:
    """إنشاء JWT token للمدير مع وقت انتهاء"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """فك تشفير JWT token والتحقق من صحته"""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> str:
    """
    Dependency للـ admin routes المحمية.
    يتحقق من وجود وصحة JWT token في header الطلب.
    يُرجع user_id المخزّن في الـ token.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="مطلوب تسجيل الدخول كمدير",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(credentials.credentials)
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token غير صالح")
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token منتهي الصلاحية أو غير صالح",
            headers={"WWW-Authenticate": "Bearer"},
        )
