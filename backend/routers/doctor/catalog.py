"""
routers/doctor/catalog.py — كتالوج الأدوية للطبيب
GET /api/doctor/catalog/dashboard              — ملخص الداشبورد
GET /api/doctor/catalog/categories             — كل التصنيفات
GET /api/doctor/catalog/categories/{slug}      — تصنيف واحد
GET /api/doctor/catalog/categories/{slug}/drugs — أدوية تصنيف
GET /api/doctor/catalog/drugs                  — كل الأدوية
GET /api/doctor/catalog/drugs/{drug_id}        — دواء واحد
GET /api/doctor/catalog/search?q=              — البحث في الأدوية
GET /api/doctor/catalog/companies              — كل الشركات
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query

from database import get_db
from schemas.drug import (
    CategoryResponse, CompanyResponse, DrugResponse, DashboardSnapshotResponse
)
from utils.helpers import (
    format_category_for_doctor, format_company_for_doctor,
    format_drug_for_doctor, parse_drug_id
)

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# استعلام SQL الأساسي لجلب الأدوية مع بيانات التصنيف والشركة
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DRUG_QUERY_BASE = """
    SELECT
        d.drug_id, d.dname, d.scientific_name, d.dosage, d.description,
        d.warnings, d.price, d.amount, d.is_popular, d.is_featured,
        d.pin, d.machine_column, d.created_at,
        dc.category_id, dc.name_category, dc.slug AS category_slug,
        dc.description_ar, dc.icon, dc.accent,
        cd.company_id, cd.name_company, cd.country
    FROM drugs d
    JOIN drug_category dc ON d.category_id = dc.category_id
    JOIN company_drug  cd ON d.company_id  = cd.company_id
"""

CATEGORY_QUERY_BASE = """
    SELECT
        dc.category_id, dc.name_category, dc.slug,
        dc.description_ar, dc.description_en, dc.icon, dc.accent,
        COUNT(d.drug_id) AS drug_count
    FROM drug_category dc
    LEFT JOIN drugs d ON d.category_id = dc.category_id
    GROUP BY dc.category_id
"""


@router.get("/catalog/dashboard", response_model=DashboardSnapshotResponse)
def get_dashboard():
    """جلب ملخص الداشبورد: أدوية شائعة ومميزة وآخر التصنيفات"""
    db = get_db()
    try:
        # الأدوية الشائعة (is_popular = 1)
        popular_rows = db.execute(
            f"{DRUG_QUERY_BASE} WHERE d.is_popular = 1 LIMIT 8"
        ).fetchall()

        # الأدوية المميزة (is_featured = 1)
        featured_rows = db.execute(
            f"{DRUG_QUERY_BASE} WHERE d.is_featured = 1 LIMIT 6"
        ).fetchall()

        # آخر 6 تصنيفات
        category_rows = db.execute(
            f"{CATEGORY_QUERY_BASE} ORDER BY dc.category_id DESC LIMIT 6"
        ).fetchall()

        # إحصائيات عامة
        total_drugs = db.execute("SELECT COUNT(*) FROM drugs").fetchone()[0]
        total_cats  = db.execute("SELECT COUNT(*) FROM drug_category").fetchone()[0]
        total_comps = db.execute("SELECT COUNT(DISTINCT name_company) FROM company_drug").fetchone()[0]

        return DashboardSnapshotResponse(
            popularDrugs=[DrugResponse(**format_drug_for_doctor(r)) for r in popular_rows],
            featuredDrugs=[DrugResponse(**format_drug_for_doctor(r)) for r in featured_rows],
            recentCategories=[CategoryResponse(**format_category_for_doctor(r)) for r in category_rows],
            totalDrugs=total_drugs,
            totalCategories=total_cats,
            totalCompanies=total_comps,
        )
    finally:
        db.close()


@router.get("/catalog/categories", response_model=List[CategoryResponse])
def get_categories():
    """جلب كل تصنيفات الأدوية مع عدد الأدوية في كل تصنيف"""
    db = get_db()
    try:
        rows = db.execute(f"{CATEGORY_QUERY_BASE} ORDER BY dc.category_id").fetchall()
        return [CategoryResponse(**format_category_for_doctor(r)) for r in rows]
    finally:
        db.close()


@router.get("/catalog/categories/{slug}", response_model=CategoryResponse)
def get_category_by_slug(slug: str):
    """جلب تصنيف واحد بالـ slug"""
    db = get_db()
    try:
        row = db.execute(
            f"{CATEGORY_QUERY_BASE} HAVING dc.slug = ?", (slug,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"التصنيف '{slug}' غير موجود")
        return CategoryResponse(**format_category_for_doctor(row))
    finally:
        db.close()


@router.get("/catalog/categories/{slug}/drugs", response_model=List[DrugResponse])
def get_drugs_by_category(slug: str):
    """جلب أدوية تصنيف معين بالـ slug"""
    db = get_db()
    try:
        rows = db.execute(
            f"{DRUG_QUERY_BASE} WHERE dc.slug = ? ORDER BY d.drug_id", (slug,)
        ).fetchall()
        return [DrugResponse(**format_drug_for_doctor(r)) for r in rows]
    finally:
        db.close()


@router.get("/catalog/drugs", response_model=List[DrugResponse])
def get_all_drugs(
    categoryId: Optional[str] = Query(None),
    companyId: Optional[str] = Query(None),
    limit: int = Query(100, le=200),
    offset: int = Query(0, ge=0),
):
    """
    جلب كل الأدوية مع خيارات التصفية.
    - categoryId: معرف التصنيف بصيغة 'cat-01'
    - companyId: معرف الشركة بصيغة 'cmp-01'
    """
    db = get_db()
    try:
        query = DRUG_QUERY_BASE
        params: list = []
        conditions: list = []

        if categoryId:
            try:
                cat_num = int(categoryId.replace("cat-", ""))
                conditions.append("d.category_id = ?")
                params.append(cat_num)
            except ValueError:
                pass

        if companyId:
            try:
                cmp_num = int(companyId.replace("cmp-", ""))
                conditions.append("d.company_id = ?")
                params.append(cmp_num)
            except ValueError:
                pass

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY d.drug_id LIMIT ? OFFSET ?"
        params += [limit, offset]

        rows = db.execute(query, params).fetchall()
        return [DrugResponse(**format_drug_for_doctor(r)) for r in rows]
    finally:
        db.close()


@router.get("/catalog/drugs/{drug_id}", response_model=DrugResponse)
def get_drug_by_id(drug_id: str):
    """
    جلب دواء واحد بمعرّفه.
    يقبل الصيغة 'analgesics-drug-5' أو الرقم الصحيح '5'.
    """
    db = get_db()
    try:
        # تحليل المعرف — يقبل 'slug-drug-N' أو رقم مباشر
        if "-drug-" in drug_id:
            numeric_id = parse_drug_id(drug_id)
        else:
            numeric_id = int(drug_id)

        if numeric_id <= 0:
            raise HTTPException(status_code=404, detail="معرف الدواء غير صالح")

        row = db.execute(
            f"{DRUG_QUERY_BASE} WHERE d.drug_id = ?", (numeric_id,)
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="الدواء غير موجود")

        return DrugResponse(**format_drug_for_doctor(row))
    except ValueError:
        raise HTTPException(status_code=404, detail="معرف الدواء غير صالح")
    finally:
        db.close()


@router.get("/catalog/search", response_model=List[DrugResponse])
def search_drugs(q: str = Query(..., min_length=1)):
    """
    البحث في الأدوية بالاسم أو الاسم العلمي.
    يبحث في: dname, scientific_name
    """
    db = get_db()
    try:
        pattern = f"%{q.strip()}%"
        rows = db.execute(
            f"""
            {DRUG_QUERY_BASE}
            WHERE d.dname LIKE ? OR d.scientific_name LIKE ?
            ORDER BY d.is_popular DESC, d.drug_id
            LIMIT 50
            """,
            (pattern, pattern)
        ).fetchall()
        return [DrugResponse(**format_drug_for_doctor(r)) for r in rows]
    finally:
        db.close()


@router.get("/catalog/companies", response_model=List[CompanyResponse])
def get_companies():
    """جلب كل شركات الأدوية"""
    db = get_db()
    try:
        rows = db.execute(
            "SELECT * FROM company_drug ORDER BY company_id"
        ).fetchall()
        return [CompanyResponse(**format_company_for_doctor(r)) for r in rows]
    finally:
        db.close()
