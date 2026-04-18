"""
routers/tablet/flow.py — تدفق المريض في الجهاز اللوحي
GET  /api/tablet/scan-presets        — بطاقات الاختيار السريع (للتطوير)
GET  /api/tablet/payment-methods     — طرق الدفع المتاحة
POST /api/tablet/scan                — مسح الباركود وجلب بيانات الوصفة
POST /api/tablet/verify              — التحقق من صحة معرف العملية
POST /api/tablet/payment             — تسجيل الدفع
POST /api/tablet/dispense            — تأكيد الصرف (يُحدّث الداتابيس)
"""

import random
import string
from typing import List, Optional
from fastapi import APIRouter, HTTPException

from database import get_db
from schemas.patient import (
    ScanRequest, VerifyRequest, PaymentRequest, DispenseRequest,
    ScanResponse, VerificationResult, PaymentResult, DispensingResult,
    PrescriptionScenarioResponse, MedicationItemResponse,
    PaymentMethodResponse, ScanPresetResponse,
)

router = APIRouter()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# طرق الدفع الثابتة
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT_METHODS = [
    PaymentMethodResponse(
        id="syriatel-cash",
        label="سيريتيل كاش",
        description="حوّل المبلغ عبر تطبيق سيريتيل كاش إلى رقم المحفظة.",
        icon="wallet",
        walletAddress="0935510789",
    ),
    PaymentMethodResponse(
        id="sham-cash",
        label="شام كاش",
        description="حوّل المبلغ عبر تطبيق شام كاش إلى رمز المحفظة.",
        icon="wallet",
        walletAddress="GFYUDS78937EWHIOFUYFEFOFE",
    ),
]


def _generate_code(length: int = 6) -> str:
    """توليد رمز عشوائي للاستلام أو الإيصال"""
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))


def _map_item_availability(amount: int) -> str:
    """تحويل كمية المخزون لحالة توفر دواء الوصفة"""
    if amount == 0:
        return "out"
    if amount < 5:
        return "low"
    return "available"


def _map_prescription_status(order_status: str, is_pay: int) -> str:
    """
    تحويل حالة الطلب إلى حالة الوصفة المناسبة للعرض في الجهاز اللوحي.
    - pending + غير مدفوع → valid (جاهز للمعالجة)
    - success → used (تم الصرف سابقاً)
    - rejected → unavailable
    """
    if order_status == "success":
        return "used"
    if order_status == "rejected":
        return "unavailable"
    return "valid"


def _build_scenario_from_db(db, patient_row, order_row, detail_rows) -> PrescriptionScenarioResponse:
    """بناء سيناريو الوصفة الكامل من بيانات الداتابيس"""
    # جلب اسم الطبيب إن وُجد
    physician_name = "الطبيب المعالج"
    if order_row and order_row["doctor_id"]:
        doc = db.execute(
            "SELECT fname FROM doctors WHERE doctor_id = ?",
            (order_row["doctor_id"],)
        ).fetchone()
        if doc:
            physician_name = f"د. {doc['fname']}"

    # بناء قائمة الأدوية
    items: List[MedicationItemResponse] = []
    total_price = float(order_row["total_price"] if order_row else 0)

    for detail in detail_rows:
        drug = db.execute(
            """SELECT d.drug_id, d.dname, d.dosage, d.amount,
                      cd.name_company
               FROM drugs d
               JOIN company_drug cd ON d.company_id = cd.company_id
               WHERE d.drug_id = ?""",
            (detail["drug_id"],)
        ).fetchone()

        if not drug:
            continue

        items.append(MedicationItemResponse(
            id=f"drug-{detail['drug_id']}",
            name=drug["dname"] or "—",
            dosage=drug["dosage"] or "",
            manufacturer=drug["name_company"] or "",
            quantity=int(detail["number_of_drug"] or 1),
            price=float(detail["price_of_one_drug"] or 0),
            availability=_map_item_availability(int(drug["amount"] or 0)),
        ))

    operation_id = patient_row["operation_id"]
    is_pay = int(order_row["is_pay"] if order_row else 0)
    order_status = order_row["status"] if order_row else "pending"

    # هل يوجد دواء غير متوفر؟
    has_unavailable = any(i.availability == "out" for i in items)
    prescription_status = (
        "unavailable" if has_unavailable
        else _map_prescription_status(order_status, is_pay)
    )

    requires_payment = (is_pay == 0) and (total_price > 0)
    payment_amount = total_price if requires_payment else 0.0

    return PrescriptionScenarioResponse(
        id=operation_id,
        code=f"RX-{operation_id}",
        label="وصفة طبية",
        patientName=patient_row["name_of_patients"] or "مريض",
        patientId=str(patient_row["patient_id"]),
        physicianName=physician_name,
        operationId=operation_id,
        insuranceProvider=patient_row["company_patients"] or "تغطية قياسية",
        coverageNote="يغطي هذا العقد الأدوية المعتمدة حسب الجهة المصدِرة.",
        notes="",
        scanOutcome="valid",
        prescriptionStatus=prescription_status,
        requiresPayment=requires_payment,
        paymentAmount=payment_amount,
        estimatedWaitMinutes=max(2, len(items)),
        dispensingOutcome="success",
        items=items,
        paymentMethods=PAYMENT_METHODS,
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
def get_payment_methods():
    """جلب طرق الدفع المتاحة"""
    return PAYMENT_METHODS


@router.get("/scan-presets", response_model=List[ScanPresetResponse])
def get_scan_presets():
    """
    جلب بطاقات الاختيار السريع للتطوير والاختبار.
    كل بطاقة تمثل مريضاً من الداتابيس مع operation_id للمسح.
    """
    db = get_db()
    try:
        patients = db.execute(
            "SELECT patient_id, name_of_patients, operation_id, company_patients FROM company_patients LIMIT 9"
        ).fetchall()

        presets: List[ScanPresetResponse] = []
        tones = ["primary", "primary", "warning", "warning", "warning", "warning", "danger", "neutral", "neutral"]

        for i, patient in enumerate(patients):
            op_id = patient["operation_id"]

            # جلب حالة الطلب المرتبط بهذه العملية
            order = db.execute(
                "SELECT status, is_pay, total_price FROM orders WHERE operation_id = ?",
                (op_id,)
            ).fetchone()

            if order:
                status = order["status"]
                is_paid = bool(order["is_pay"])
                has_amount = float(order["total_price"] or 0) > 0

                if status == "success":
                    desc = "وصفة تم صرفها سابقاً — تنتهي بحالة 'مستخدمة'."
                    tone = "warning"
                elif status == "rejected":
                    desc = "وصفة مرفوضة — تنتهي بحالة غير متاحة."
                    tone = "danger"
                elif has_amount and not is_paid:
                    desc = "وصفة صالحة تتطلب دفعاً قبل الصرف."
                    tone = "primary"
                else:
                    desc = "وصفة صالحة — الصرف مجاني مغطى بالكامل."
                    tone = "primary"
            else:
                desc = "مريض بدون طلب مرتبط — اختبار حالة المسح."
                tone = tones[i % len(tones)]

            presets.append(ScanPresetResponse(
                id=f"preset-{op_id}",
                title=patient["name_of_patients"] or f"مريض {i + 1}",
                description=desc,
                scenarioId=op_id,
                tone=tone,
            ))

        return presets
    finally:
        db.close()


def _build_scenario_from_order_only(db, order_row, detail_rows) -> PrescriptionScenarioResponse:
    """
    بناء سيناريو الوصفة من الطلب فقط (بدون سجل company_patients).
    يُستخدم عندما يُنشأ الطلب من بوابة الطبيب ولا يوجد مريض مسجّل مسبقاً.
    """
    physician_name = "الطبيب المعالج"
    if order_row["doctor_id"]:
        doc = db.execute(
            "SELECT fname FROM doctors WHERE doctor_id = ?",
            (order_row["doctor_id"],)
        ).fetchone()
        if doc:
            physician_name = f"د. {doc['fname']}"

    # محاولة جلب اسم المريض من patient_id إن وُجد
    patient_name = "مريض"
    patient_id_str = "—"
    if order_row["patient_id"]:
        pt = db.execute(
            "SELECT name_of_patients, patient_id FROM company_patients WHERE patient_id = ?",
            (order_row["patient_id"],)
        ).fetchone()
        if pt:
            patient_name = pt["name_of_patients"] or "مريض"
            patient_id_str = str(pt["patient_id"])

    items: List[MedicationItemResponse] = []
    total_price = float(order_row["total_price"] or 0)

    for detail in detail_rows:
        drug = db.execute(
            """SELECT d.drug_id, d.dname, d.dosage, d.amount,
                      cd.name_company
               FROM drugs d
               JOIN company_drug cd ON d.company_id = cd.company_id
               WHERE d.drug_id = ?""",
            (detail["drug_id"],)
        ).fetchone()
        if not drug:
            continue

        items.append(MedicationItemResponse(
            id=f"drug-{detail['drug_id']}",
            name=drug["dname"] or "—",
            dosage=drug["dosage"] or "",
            manufacturer=drug["name_company"] or "",
            quantity=int(detail["number_of_drug"] or 1),
            price=float(detail["price_of_one_drug"] or 0),
            availability=_map_item_availability(int(drug["amount"] or 0)),
        ))

    operation_id = order_row["operation_id"] or f"OP-{order_row['order_id']}"
    is_pay = int(order_row["is_pay"] or 0)
    order_status = order_row["status"] or "pending"

    has_unavailable = any(i.availability == "out" for i in items)
    prescription_status = (
        "unavailable" if has_unavailable
        else _map_prescription_status(order_status, is_pay)
    )

    requires_payment = (is_pay == 0) and (total_price > 0)
    payment_amount = total_price if requires_payment else 0.0

    return PrescriptionScenarioResponse(
        id=operation_id,
        code=f"RX-{operation_id}",
        label="وصفة طبية",
        patientName=patient_name,
        patientId=patient_id_str,
        physicianName=physician_name,
        operationId=operation_id,
        insuranceProvider="تغطية قياسية",
        coverageNote="يغطي هذا العقد الأدوية المعتمدة حسب الجهة المصدِرة.",
        notes="",
        scanOutcome="valid",
        prescriptionStatus=prescription_status,
        requiresPayment=requires_payment,
        paymentAmount=payment_amount,
        estimatedWaitMinutes=max(2, len(items)),
        dispensingOutcome="success",
        items=items,
        paymentMethods=PAYMENT_METHODS,
    )


@router.post("/scan", response_model=ScanResponse)
def scan_barcode(payload: ScanRequest):
    """
    مسح الباركود (operation_id) وإرجاع بيانات الوصفة الكاملة.
    - valid: الباركود موجود وصالح
    - invalid: الباركود غير موجود
    - unreadable: الباركود فارغ أو تالف
    - used: الرمز مُستخدم مسبقاً (QR يُقبل مرة واحدة فقط)
    """
    barcode = payload.barcode.strip()

    if not barcode:
        return ScanResponse(
            outcome="unreadable",
            message="تعذّر قراءة الرمز. يرجى إعادة وضع البطاقة أو الورقة أمام الكاميرا.",
        )

    db = get_db()
    try:
        # أولاً: البحث في orders مباشرة بـ operation_id
        order = db.execute(
            "SELECT * FROM orders WHERE operation_id = ?", (barcode,)
        ).fetchone()

        if not order:
            return ScanResponse(
                outcome="invalid",
                message="الرمز الممسوح غير معرَّف في النظام. يرجى التواصل مع الصيدلي.",
            )

        # منع إعادة الاستخدام: QR يُقبل مرة واحدة فقط
        if order["status"] == "success":
            return ScanResponse(
                outcome="invalid",
                message="هذا الرمز تم استخدامه مسبقاً ولا يمكن صرفه مرة أخرى.",
            )

        # جلب تفاصيل الطلب
        details = db.execute(
            "SELECT * FROM details_order WHERE order_id = ?",
            (order["order_id"],)
        ).fetchall()

        # محاولة ربط المريض عبر company_patients.operation_id
        patient = db.execute(
            "SELECT * FROM company_patients WHERE operation_id = ?", (barcode,)
        ).fetchone()

        if patient:
            scenario = _build_scenario_from_db(db, patient, order, details)
        else:
            scenario = _build_scenario_from_order_only(db, order, details)

        return ScanResponse(
            outcome="valid",
            message="تم قراءة الرمز بنجاح.",
            scenario=scenario,
            operationId=barcode,
        )
    finally:
        db.close()


@router.post("/verify", response_model=VerificationResult)
def verify_prescription(payload: VerifyRequest):
    """
    التحقق من صحة معرف العملية وحالة الوصفة.
    يُرجع نتيجة التحقق وما إذا كان يمكن المتابعة.
    """
    db = get_db()
    try:
        # البحث عن الطلب
        order = db.execute(
            "SELECT status, is_pay, total_price FROM orders WHERE operation_id = ?",
            (payload.operationId,)
        ).fetchone()

        if not order:
            return VerificationResult(
                status="expired",
                badge="غير موجود",
                message="معرف العملية غير موجود في النظام.",
                canContinue=False,
            )

        status = order["status"]

        if status == "success":
            return VerificationResult(
                status="used",
                badge="مستخدمة",
                message="هذه الوصفة استُخدمت مسبقاً ولا يمكن صرفها مرة أخرى.",
                canContinue=False,
            )

        if status == "rejected":
            return VerificationResult(
                status="unavailable",
                badge="غير متاحة",
                message="هذه الوصفة غير متاحة للصرف.",
                canContinue=False,
            )

        # التحقق من توفر الأدوية في المخزون
        details = db.execute(
            """SELECT d.amount FROM details_order od
               JOIN drugs d ON d.drug_id = od.drug_id
               JOIN orders o ON o.order_id = od.order_id
               WHERE o.operation_id = ?""",
            (payload.operationId,)
        ).fetchall()

        has_out_of_stock = any(int(d["amount"] or 0) == 0 for d in details)
        if has_out_of_stock:
            return VerificationResult(
                status="unavailable",
                badge="غير متوفر",
                message="أحد الأدوية في الوصفة غير متوفر حالياً في المخزون.",
                canContinue=False,
            )

        return VerificationResult(
            status="verified",
            badge="صالحة",
            message="الوصفة صالحة وجاهزة للمتابعة.",
            canContinue=True,
        )
    finally:
        db.close()


@router.post("/payment", response_model=PaymentResult)
def process_payment(payload: PaymentRequest):
    """
    تسجيل الدفع — يُحدّث is_pay=1 في الطلب.
    يُرجع نتيجة الدفع برقم إيصال عشوائي.
    """
    db = get_db()
    try:
        order = db.execute(
            "SELECT order_id, total_price, is_pay FROM orders WHERE operation_id = ?",
            (payload.operationId,)
        ).fetchone()

        if not order:
            raise HTTPException(status_code=404, detail="العملية غير موجودة")

        if order["is_pay"]:
            # تم الدفع مسبقاً — اعتبره ناجحاً
            return PaymentResult(
                status="success",
                message="تم تسجيل الدفع مسبقاً.",
                paidAmount=float(order["total_price"] or 0),
                receiptId=f"RCP-{_generate_code(8)}",
            )

        # تحديث حالة الدفع في الداتابيس
        db.execute(
            "UPDATE orders SET is_pay = 1, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?",
            (order["order_id"],)
        )
        db.commit()

        return PaymentResult(
            status="success",
            message="تم تسجيل الدفع بنجاح.",
            paidAmount=float(order["total_price"] or 0),
            receiptId=f"RCP-{_generate_code(8)}",
        )
    finally:
        db.close()


@router.post("/dispense", response_model=DispensingResult)
def dispense_medications(payload: DispenseRequest):
    """
    تأكيد الصرف — يُحدّث status='success' في الطلب.
    في المستقبل: هنا يُرسَل الأمر للـ ESP32 عبر HTTP.
    """
    db = get_db()
    try:
        order = db.execute(
            "SELECT order_id, status FROM orders WHERE operation_id = ?",
            (payload.operationId,)
        ).fetchone()

        if not order:
            raise HTTPException(status_code=404, detail="العملية غير موجودة")

        if order["status"] == "success":
            return DispensingResult(
                status="completed",
                outcome="success",
                message="تم صرف الأدوية مسبقاً.",
                pickupCode=f"PK-{_generate_code(6)}",
            )

        # تحديث حالة الطلب إلى success (تم الصرف)
        db.execute(
            """UPDATE orders
               SET status = 'success', updated_at = CURRENT_TIMESTAMP
               WHERE order_id = ?""",
            (order["order_id"],)
        )
        db.commit()

        # رمز الاستلام الذي يُعرض للمريض
        pickup_code = f"PK-{_generate_code(6)}"
        transaction_id = f"TXN-{_generate_code(10)}"

        return DispensingResult(
            status="completed",
            outcome="success",
            message="تم صرف الأدوية بنجاح. يرجى التوجه لفتحة الاستلام.",
            pickupCode=pickup_code,
            transactionId=transaction_id,
        )
    finally:
        db.close()
