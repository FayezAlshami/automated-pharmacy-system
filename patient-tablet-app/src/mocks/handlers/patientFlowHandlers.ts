import { createDisplayIdentifier } from '@/utils/identifiers'
import {
  mockPaymentMethods,
  mockPrescriptionScenarios,
  mockScanPresets,
} from '@/mocks/data/patientFlow'
import type {
  DispensingOutcome,
  DispensingResult,
  PaymentResult,
  PaymentSimulationOutcome,
  PrescriptionScenario,
  ScanPreset,
  ScanResponse,
  VerificationResult,
} from '@/types/patient-flow'

/**
 * يعيد قائمة الأزرار التي تظهر في شاشة محاكاة قراءة QR.
 */
export function getMockScanPresets(): ScanPreset[] {
  return mockScanPresets
}

/**
 * يعيد قائمة طرق الدفع الشكلية لتبقى موحدة عبر السيناريوهات.
 */
export function getMockPaymentMethods() {
  return mockPaymentMethods
}

/**
 * يبحث عن سيناريو وهمي باستخدام معرفه الداخلي.
 */
export function findScenarioById(scenarioId: string) {
  return mockPrescriptionScenarios.find((scenario) => scenario.id === scenarioId)
}

export function findScenarioForOperation(operationId: string) {
  return mockPrescriptionScenarios.find(
    (scenario) => scenario.id === operationId || scenario.operationId === operationId,
  )
}

/**
 * يحاكي استجابة قارئ الـ QR قبل الانتقال إلى مرحلة التحقق.
 */
export function createScanResponse(barcode: string): ScanResponse {
  const scenario = findScenarioForOperation(barcode)

  if (!scenario) {
    return {
      outcome: 'invalid',
      message: 'تعذّر مطابقة الرمز مع أي وصفة في النظام.',
    }
  }

  if (scenario.scanOutcome === 'invalid') {
    return {
      outcome: 'invalid',
      message: 'الرمز غير مرتبط بوصفة صحيحة. يرجى طلب رمز جديد أو إعادة المحاولة.',
    }
  }

  if (scenario.scanOutcome === 'unreadable') {
    return {
      outcome: 'unreadable',
      message: 'تعذر قراءة الرمز. ضع QR بالكامل داخل منطقة القراءة ثم أعد المحاولة.',
    }
  }

  return {
    outcome: 'valid',
    message: `تمت قراءة الوصفة ${scenario.code} بنجاح وجارٍ التحقق من صلاحيتها.`,
    scenario,
    operationId: scenario.operationId,
  }
}

/**
 * يحوّل حالة الوصفة الطبية إلى نتيجة تحقق قابلة للاستهلاك في الواجهة.
 */
export function createVerificationResult(
  scenario: PrescriptionScenario,
): VerificationResult {
  switch (scenario.prescriptionStatus) {
    case 'expired':
      return {
        status: 'expired',
        badge: 'منتهية',
        message:
          'هذه الوصفة منتهية الصلاحية. يلزم مراجعة الطبيب أو مكتب الاستقبال لإصدار وصفة جديدة.',
        canContinue: false,
      }
    case 'used':
      return {
        status: 'used',
        badge: 'مستخدمة',
        message:
          'تم تسجيل صرف سابق لهذه الوصفة، لذلك لن يسمح النظام بإعادة الصرف تلقائياً.',
        canContinue: false,
      }
    case 'unavailable':
      return {
        status: 'unavailable',
        badge: 'غير متوفر',
        message:
          'تم التحقق من الوصفة، لكن أحد الأدوية غير متوفر حالياً في الخزانة المؤتمتة.',
        canContinue: false,
      }
    default:
      return {
        status: 'verified',
        badge: 'تم التحقق',
        message:
          'الوصفة صالحة، وتمت مطابقة المريض والأصناف المطلوبة بنجاح. يمكنك متابعة العملية.',
        canContinue: true,
      }
  }
}

/**
 * يحاكي نتيجة عملية الدفع طبقاً للزر الذي اختاره المستخدم في الشاشة.
 */
export function createPaymentResult(
  scenario: PrescriptionScenario,
  outcome: PaymentSimulationOutcome,
): PaymentResult {
  if (!scenario.requiresPayment) {
    return {
      status: 'success',
      message: 'لا يتطلب هذا الطلب أي دفعة إضافية لأن التغطية كاملة.',
      paidAmount: 0,
      receiptId: createDisplayIdentifier('FREE'),
    }
  }

  if (outcome === 'failed') {
    return {
      status: 'failed',
      message: 'فشلت عملية الدفع. يمكنك إعادة المحاولة.',
      paidAmount: 0,
    }
  }

  if (outcome === 'cancelled') {
    return {
      status: 'cancelled',
      message: 'تم إلغاء العملية قبل إتمام الدفع.',
      paidAmount: 0,
    }
  }

  return {
    status: 'success',
    message: 'تم الدفع بنجاح، جاري إرسال أمر الصرف.',
    paidAmount: scenario.paymentAmount,
    receiptId: createDisplayIdentifier('PAY'),
  }
}

function createDispensingFailureMessage(outcome: DispensingOutcome) {
  switch (outcome) {
    case 'mechanical_error':
      return 'حدث انحشار ميكانيكي في مسار الإخراج. تم تنبيه الصيدلي للتدخل اليدوي.'
    case 'timeout':
      return 'تجاوزت العملية الزمن المتوقع للإنجاز. توقفت الآلية احترازياً بانتظار إعادة المحاولة.'
    case 'sensor_fail':
      return 'أبلغ المستشعر عن عدم تطابق في حركة العبوة. تم إيقاف الصرف لحماية المريض.'
    default:
      return 'تم تجهيز الطلب وجاهز للاستلام من الدرج المخصص.'
  }
}

/**
 * يحاكي النتيجة النهائية لمرحلة الصرف المؤتمت.
 */
export function createDispensingResult(
  scenario: PrescriptionScenario,
): DispensingResult {
  if (scenario.dispensingOutcome === 'success') {
    return {
      status: 'completed',
      outcome: 'success',
      message: 'اكتملت عملية الصرف بنجاح. يمكن للمريض استلام الأدوية الآن.',
      pickupCode: createDisplayIdentifier('PK'),
      transactionId: createDisplayIdentifier('TX'),
    }
  }

  return {
    status: 'failed',
    outcome: scenario.dispensingOutcome,
    message: createDispensingFailureMessage(scenario.dispensingOutcome),
    pickupCode: createDisplayIdentifier('SUP'),
  }
}
