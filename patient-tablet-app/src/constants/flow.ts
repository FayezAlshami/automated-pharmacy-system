import type { DispensingStep, PaymentResult, VerificationResult } from '@/types/patient-flow'

export const welcomeInstructions = [
  'ضع رمز الوصفة أو الباركود داخل إطار الكاميرا حتى يتم التقاطه تلقائياً.',
  'راجع تفاصيل الطلب والدفع قبل متابعة عملية الصرف.',
  'انتظر رسالة النجاح أو اتبع التعليمات عند حدوث خطأ.',
]

export const dispensingBlueprint: Array<Omit<DispensingStep, 'status'>> = [
  {
    id: 'queue',
    title: 'تم استلام أمر الصرف',
    description: 'جرى توجيه الطلب إلى وحدة التحكم الخاصة بخزانة الأدوية.',
  },
  {
    id: 'prepare',
    title: 'جاري تجهيز الدواء',
    description: 'النظام الروبوتي يتحقق من القنوات ويستخرج العبوات المطلوبة.',
  },
  {
    id: 'transfer',
    title: 'الدواء في الطريق لنقطة الخروج',
    description: 'تُنقل العبوات من الآلية الداخلية إلى درج التسليم النهائي.',
  },
  {
    id: 'handoff',
    title: 'جاهز للاستلام',
    description: 'تحقق من اسم المريض والكمية قبل إنهاء الجلسة.',
  },
]

export const idleVerificationState: VerificationResult = {
  status: 'idle',
  badge: 'في الانتظار',
  message: 'ابدأ بمسح رمز الوصفة للانتقال إلى التحقق.',
  canContinue: false,
}

export const idlePaymentState: PaymentResult = {
  status: 'idle',
  message: 'اختر طريقة الدفع ثم اضغط تأكيد الدفع.',
  paidAmount: 0,
}
