"""
schemas/patient.py — نماذج Pydantic لتدفق المريض (patient-tablet-app)
"""

from pydantic import BaseModel
from typing import Optional, List


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# طلبات الـ Tablet
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ScanRequest(BaseModel):
    """طلب مسح الباركود"""
    barcode: str


class VerifyRequest(BaseModel):
    """طلب التحقق من معرف العملية"""
    operationId: str


class PaymentRequest(BaseModel):
    """طلب الدفع"""
    operationId: str
    paymentMethodId: str


class DispenseRequest(BaseModel):
    """طلب الصرف"""
    operationId: str


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# استجابات الـ Tablet
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class PaymentMethodResponse(BaseModel):
    """طريقة دفع"""
    id: str
    label: str
    description: str
    icon: str
    walletAddress: Optional[str] = None


class MedicationItemResponse(BaseModel):
    """دواء واحد في الوصفة"""
    id: str
    name: str
    dosage: str = ""
    manufacturer: str = ""
    quantity: int
    price: float
    availability: str = "available"


class PrescriptionScenarioResponse(BaseModel):
    """بيانات الوصفة الكاملة بعد المسح"""
    id: str
    code: str
    label: str = ""
    patientName: str
    patientId: str
    physicianName: str = "الطبيب المعالج"
    operationId: str
    insuranceProvider: str = "تغطية قياسية"
    coverageNote: str = ""
    notes: str = ""
    scanOutcome: str = "valid"
    prescriptionStatus: str = "valid"
    requiresPayment: bool = True
    paymentAmount: float = 0.0
    estimatedWaitMinutes: int = 3
    dispensingOutcome: str = "success"
    items: List[MedicationItemResponse] = []
    paymentMethods: List[PaymentMethodResponse] = []


class ScanResponse(BaseModel):
    """استجابة مسح الباركود"""
    outcome: str
    message: str
    scenario: Optional[PrescriptionScenarioResponse] = None
    operationId: Optional[str] = None


class VerificationResult(BaseModel):
    """نتيجة التحقق من الوصفة"""
    status: str
    badge: str
    message: str
    canContinue: bool


class PaymentResult(BaseModel):
    """نتيجة عملية الدفع"""
    status: str
    message: str
    paidAmount: float
    receiptId: Optional[str] = None


class DispensingResult(BaseModel):
    """نتيجة عملية الصرف"""
    status: str
    outcome: str
    message: str
    pickupCode: str
    transactionId: Optional[str] = None


class ScanPresetResponse(BaseModel):
    """بطاقة اختيار سريع للاختبار"""
    id: str
    title: str
    description: str
    scenarioId: str
    tone: str
