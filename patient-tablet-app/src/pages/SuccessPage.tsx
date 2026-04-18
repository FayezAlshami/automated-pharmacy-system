import { motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, PackageCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { TouchButton } from '@/components/common/TouchButton'
import { PrescriptionSummary } from '@/components/features/PrescriptionSummary'
import { TabletShell } from '@/components/layout/TabletShell'
import { useTabletFlowController } from '@/hooks/useTabletFlowController'

export function SuccessPage() {
  const navigate = useNavigate()
  const { activeScenario, dispensingState, resetFlow } = useTabletFlowController()
  const reduceMotion = useReducedMotion()

  const handleFinish = () => {
    resetFlow()
    navigate('/')
  }

  return (
    <TabletShell
      eyebrow="Success"
      title="تم تسليم الطلب بنجاح"
      subtitle="يمكنك أخذ الأدوية من نقطة الاستلام. تحقق من الأرقام المرجعية أدناه عند الحاجة."
      aside={<PrescriptionSummary scenario={activeScenario} />}
    >
      <div className="space-y-6">
        <motion.div
          className="surface-panel border-success/40 bg-[#E8F5E9] p-6"
          initial={reduceMotion ? false : { scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <BadgeCheck className="h-12 w-12 text-success" aria-hidden />
          <h2 className="mt-4 text-3xl font-bold text-ink">اكتملت عملية الصرف</h2>
          <p className="mt-3 text-lg leading-8 text-ink-muted">{dispensingState.message}</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-panel p-5">
            <p className="text-sm font-semibold text-ink-muted">رقم العملية</p>
            <p className="mt-3 text-2xl font-bold text-ink">
              {activeScenario?.operationId ?? '—'}
            </p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-sm font-semibold text-ink-muted">رقم المعاملة</p>
            <p className="mt-3 text-2xl font-bold text-ink">
              {dispensingState.transactionId ?? '—'}
            </p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-sm font-semibold text-ink-muted">كود الاستلام</p>
            <p className="mt-3 text-2xl font-bold text-ink">
              {dispensingState.pickupCode ?? '—'}
            </p>
          </div>
        </div>

        <div className="surface-panel p-6">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-8 w-8 text-primary" aria-hidden />
            <p className="text-lg font-semibold text-ink">
              يمكن إنهاء الجلسة الآن ليستخدم المريض التالي الجهاز.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <TouchButton onClick={handleFinish}>إنهاء والعودة للبداية</TouchButton>
          <TouchButton tone="secondary" onClick={() => navigate('/scan')}>
            مسح وصفة جديدة
          </TouchButton>
        </div>
      </div>
    </TabletShell>
  )
}
