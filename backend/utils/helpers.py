"""
utils/helpers.py — دوال التحويل بين أعمدة الداتابيس وصيغة الـ API
كل دالة تأخذ صف من الداتابيس (sqlite3.Row أو dict) وتُرجع dict جاهز للإرسال
"""

import json
from typing import Any


def _coerce_db_pin(value: Any) -> str:
    """حقل pin قد يُخزَّن كنص أو رقم في SQLite؛ مخطط Pydantic يتوقع str."""
    if value is None:
        return ""
    return str(value).strip()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# دوال تنسيق المعرّفات (IDs)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def fmt_doctor_id(doctor_id: int) -> str:
    """تحويل معرف الطبيب الرقمي إلى صيغة doc-XX"""
    return f"doc-{doctor_id:02d}"


def fmt_category_id(category_id: int) -> str:
    """تحويل معرف التصنيف الرقمي إلى صيغة cat-XX"""
    return f"cat-{category_id:02d}"


def fmt_company_id(company_id: int) -> str:
    """تحويل معرف الشركة الرقمي إلى صيغة cmp-XX"""
    return f"cmp-{company_id:02d}"


def fmt_drug_id(category_slug: str, drug_id: int) -> str:
    """تحويل معرف الدواء إلى صيغة slug-drug-N"""
    return f"{category_slug}-drug-{drug_id}"


def parse_drug_id(drug_id_str: str) -> int:
    """
    تحليل معرف الدواء من صيغة 'analgesics-drug-5' إلى العدد الصحيح 5.
    يُرجع -1 في حالة الفشل.
    """
    try:
        return int(drug_id_str.split("-drug-")[-1])
    except (IndexError, ValueError):
        return -1


def parse_doctor_id(doctor_id_str: str) -> int:
    """تحليل معرف الطبيب من صيغة 'doc-01' إلى العدد الصحيح 1"""
    try:
        return int(doctor_id_str.replace("doc-", ""))
    except ValueError:
        return -1


def parse_category_id(cat_id_str: str) -> int:
    """تحليل معرف التصنيف من صيغة 'cat-01' إلى العدد الصحيح"""
    try:
        return int(cat_id_str.replace("cat-", ""))
    except ValueError:
        return -1


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# دوال التحويل — Doctor Portal
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def map_availability(amount: int) -> str:
    """تحويل كمية المخزون إلى حالة توفر"""
    if amount == 0:
        return "out_of_stock"
    if amount < 10:
        return "limited"
    return "in_stock"


def map_order_status(db_status: str) -> str:
    """
    تحويل حالة الطلب من الداتابيس إلى صيغة الفرونت.
    success في الداتابيس → completed في الفرونت
    """
    return "completed" if db_status == "success" else db_status


def parse_warnings(warnings_json: Any) -> list:
    """تحويل حقل warnings من JSON string إلى list"""
    if not warnings_json:
        return []
    if isinstance(warnings_json, list):
        return warnings_json
    try:
        return json.loads(warnings_json)
    except (json.JSONDecodeError, TypeError):
        return []


def format_drug_for_doctor(row: Any) -> dict:
    """
    تحويل صف الدواء من الداتابيس إلى الصيغة التي يتوقعها doctor-portal-app.
    يتطلب أن يكون الصف ناتجاً عن JOIN مع drug_category و company_drug.
    """
    category_slug = row["category_slug"] or "uncategorized"
    drug_id_str = fmt_drug_id(category_slug, row["drug_id"])

    return {
        "id": drug_id_str,
        "name": row["dname"] or "",
        "nameEn": row["dname"] or "",
        "scientificName": row["scientific_name"] or "",
        "categoryId": fmt_category_id(row["category_id"]),
        "categorySlug": category_slug,
        "companyId": fmt_company_id(row["company_id"]),
        "price": float(row["price"] or 0),
        "stock": int(row["amount"] or 0),
        "availability": map_availability(int(row["amount"] or 0)),
        "dosage": row["dosage"] or "",
        "description": row["description"] or "",
        "warnings": parse_warnings(row["warnings"]),
        "isPopular": bool(row["is_popular"]),
        "isFeatured": bool(row["is_featured"]),
        "pin": _coerce_db_pin(row["pin"]),
        "machineColumn": row["machine_column"] or "",
        "imageUrl": None,
    }


def format_category_for_doctor(row: Any) -> dict:
    """تحويل صف التصنيف إلى صيغة الفرونت"""
    return {
        "id": fmt_category_id(row["category_id"]),
        "slug": row["slug"] or "",
        "name": row["name_category"] or "",
        "nameEn": row["name_category"] or "",
        "descriptionAr": row["description_ar"] or "",
        "descriptionEn": row["description_en"] or "",
        "icon": row["icon"] or "pill",
        "accent": row["accent"] or "#009EDB",
        "drugCount": int(row["drug_count"] if "drug_count" in row.keys() else 0),
    }


def format_company_for_doctor(row: Any) -> dict:
    """تحويل صف الشركة إلى صيغة الفرونت"""
    return {
        "id": fmt_company_id(row["company_id"]),
        "name": row["name_company"] or "",
        "country": row["country"] or "",
        "categoryIds": [fmt_category_id(row["category_id"])],
    }


def format_doctor_account(row: Any) -> dict:
    """تحويل صف الطبيب إلى DoctorAccount للـ doctor portal"""
    return {
        "id": fmt_doctor_id(row["doctor_id"]),
        "fullName": row["fname"] or "",
        "email": row["email"] or "",
        "password": "*",
        "specialty": row["specialty"] or "",
        "clinicName": row["clinic_name"] or "",
        "licenseNumber": row["license_number"] or "",
        "phone": row["phone"] or "",
        "role": row["role"] or "doctor",
        "status": row["status"] or "active",
        "joinedAt": row["created_at"] or "",
    }


def format_recent_order(order_row: Any, items: list) -> dict:
    """تحويل صف الطلب مع عناصره إلى RecentOrder للـ doctor portal"""
    return {
        "id": str(order_row["order_id"]),
        "doctorId": fmt_doctor_id(order_row["doctor_id"]) if order_row["doctor_id"] else None,
        "status": map_order_status(order_row["status"] or "pending"),
        "totalPrice": float(order_row["total_price"] or 0),
        "isPaid": bool(order_row["is_pay"]),
        "createdAt": order_row["created_at"] or "",
        "updatedAt": order_row["updated_at"] or "",
        "items": items,
    }


def format_order_item(detail_row: Any, drug_row: Any) -> dict:
    """تحويل تفصيلة طلب واحدة إلى CartItem للفرونت"""
    category_slug = drug_row["category_slug"] if drug_row else "unknown"
    return {
        "drugId": fmt_drug_id(category_slug, detail_row["drug_id"]),
        "drugName": drug_row["dname"] if drug_row else "—",
        "quantity": int(detail_row["number_of_drug"] or 1),
        "unitPrice": float(detail_row["price_of_one_drug"] or 0),
        "subtotal": float(detail_row["number_of_drug"] or 1)
                    * float(detail_row["price_of_one_drug"] or 0),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# دوال التحويل — Admin Portal
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def map_admin_role(db_role: str) -> str:
    """تحويل دور المستخدم: assistant → pharmacist"""
    return "pharmacist" if db_role == "assistant" else db_role


def map_doctor_status_to_request_status(db_status: str) -> str:
    """تحويل حالة الطبيب إلى حالة طلب التسجيل"""
    mapping = {
        "pending": "pending",
        "active": "approved",
        "rejected": "rejected",
    }
    return mapping.get(db_status, "pending")


def format_doctor_record_for_admin(row: Any) -> dict:
    """تحويل صف الطبيب إلى DoctorRecord للـ admin portal"""
    return {
        "doctor_id": str(row["doctor_id"]),
        "fname": row["fname"] or "",
        "email": row["email"] or "",
        "phone": row["phone"] or "",
        "role": row["role"] or "doctor",
        "created_at": row["created_at"] or "",
        "updated_at": row["updated_at"] or "",
    }


def format_signup_request_for_admin(row: Any) -> dict:
    """تحويل صف الطبيب المعلق إلى DoctorSignupRequestRecord"""
    return {
        "request_id": str(row["doctor_id"]),
        "full_name": row["fname"] or "",
        "email": row["email"] or "",
        "phone": row["phone"] or "",
        "specialty": row["specialty"] or "",
        "clinic_name": row["clinic_name"] or "",
        "requested_role": "doctor",
        "source_app": "doctor-portal-app",
        "status": map_doctor_status_to_request_status(row["status"] or "pending"),
        "submitted_at": row["created_at"] or "",
        "reviewed_at": row["updated_at"] if row["status"] != "pending" else None,
        "reviewed_by": None,
        "review_note": None,
    }


def format_drug_record_for_admin(row: Any) -> dict:
    """تحويل صف الدواء إلى DrugRecord للـ admin portal"""
    return {
        "drug_id": str(row["drug_id"]),
        "dname": row["dname"] or "",
        "category_id": str(row["category_id"]),
        "company_id": str(row["company_id"]),
        "price": float(row["price"] or 0),
        "amount": int(row["amount"] or 0),
        "pin": _coerce_db_pin(row["pin"]),
        "machine_column": row["machine_column"] or "",
        "created_at": row["created_at"] or "",
    }


def format_category_record_for_admin(row: Any) -> dict:
    """تحويل صف التصنيف إلى DrugCategoryRecord للـ admin"""
    return {
        "category_id": str(row["category_id"]),
        "name_category": row["name_category"] or "",
    }


def format_company_record_for_admin(row: Any) -> dict:
    """تحويل صف الشركة إلى CompanyDrugRecord للـ admin"""
    return {
        "company_id": str(row["company_id"]),
        "name_company": row["name_company"] or "",
        "category_id": str(row["category_id"]),
        "created_at": row["created_at"] or "",
    }


def format_order_record_for_admin(row: Any) -> dict:
    """تحويل صف الطلب إلى OrderRecord للـ admin"""
    return {
        "order_id": str(row["order_id"]),
        "doctor_id": str(row["doctor_id"]) if row["doctor_id"] else None,
        "status": row["status"] or "pending",
        "total_price": float(row["total_price"] or 0),
        "is_pay": bool(row["is_pay"]),
        "created_at": row["created_at"] or "",
        "updated_at": row["updated_at"] or "",
    }


def format_order_detail_for_admin(row: Any) -> dict:
    """تحويل تفصيلة الطلب إلى OrderDetailRecord للـ admin"""
    return {
        "order_detail_id": str(row["order_detail_id"]),
        "order_id": str(row["order_id"]),
        "drug_id": str(row["drug_id"]),
        "number_of_drug": int(row["number_of_drug"] or 0),
        "price_of_one_drug": float(row["price_of_one_drug"] or 0),
    }


def format_patient_record_for_admin(row: Any) -> dict:
    """تحويل صف المريض إلى CompanyPatientRecord للـ admin"""
    return {
        "patient_id": str(row["patient_id"]),
        "name_of_patients": row["name_of_patients"] or "",
        "nid": row["nid"] or "",
        "company_patients": row["company_patients"] or "",
        "hash_password": "***",
        "operation_id": row["operation_id"] or "",
        "created_at": row["created_at"] or "",
    }
