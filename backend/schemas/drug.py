"""
schemas/drug.py — نماذج Pydantic للأدوية والتصنيفات والشركات
تُستخدم لـ doctor-portal-app catalog endpoints
"""

from pydantic import BaseModel
from typing import Optional, List, Any


class CategoryResponse(BaseModel):
    """تصنيف دوائي"""
    id: str
    slug: str
    name: str
    nameEn: str
    descriptionAr: str = ""
    descriptionEn: str = ""
    icon: str = "pill"
    accent: str = "#009EDB"
    drugCount: int = 0


class CompanyResponse(BaseModel):
    """شركة أدوية"""
    id: str
    name: str
    country: str = ""
    categoryIds: List[str] = []


class DrugResponse(BaseModel):
    """دواء واحد"""
    id: str
    name: str
    nameEn: str = ""
    scientificName: str = ""
    categoryId: str
    categorySlug: str = ""
    companyId: str
    price: float
    stock: int
    availability: str = "in_stock"
    dosage: str = ""
    description: str = ""
    warnings: List[str] = []
    isPopular: bool = False
    isFeatured: bool = False
    pin: str = ""
    machineColumn: str = ""
    imageUrl: Optional[str] = None


class DashboardSnapshotResponse(BaseModel):
    """ملخص الداشبورد للطبيب"""
    popularDrugs: List[DrugResponse] = []
    featuredDrugs: List[DrugResponse] = []
    recentCategories: List[CategoryResponse] = []
    totalDrugs: int = 0
    totalCategories: int = 0
    totalCompanies: int = 0
