import { motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { TouchButton } from '@/components/common/TouchButton'
import { TabletShell } from '@/components/layout/TabletShell'
import { useTabletFlowController } from '@/hooks/useTabletFlowController'

function mapRetryPath(retryStage?: string) {
  switch (retryStage) {
    case 'payment':
      return '/payment'
    case 'dispensing':
      return '/dispensing'
    case 'scan':
      return '/scan'
    default:
      return '/scan'
  }
}

export function ErrorPage() {
  const navigate = useNavigate()
  const { error, prepareRetry, resetFlow } = useTabletFlowController()
  const reduceMotion = useReducedMotion()

  const handleRetry = () => {
    const retryPath = mapRetryPath(error?.retryStage)
    prepareRetry()
    navigate(retryPath)
  }

  const handleHome = () => {
    resetFlow()
    navigate('/')
  }

  return (
    <TabletShell
      eyebrow="Failure"
      title="تعذر إكمال العملية"
      subtitle="يمكنك إعادة المحاولة من المرحلة المناسبة أو العودة للشاشة الرئيسية."
      aside={
        <div className="space-y-4">
          <div className="surface-panel p-5">
            <p className="text-sm font-semibold text-ink-muted">الوصف</p>
            <p className="mt-3 text-2xl font-bold text-ink">{error?.title ?? 'خطأ'}</p>
            <p className="mt-3 leading-7 text-ink-muted">
              {error?.description ??
                'تعذر إكمال العملية. يمكنك إعادة المحاولة أو العودة للبداية.'}
            </p>
          </div>
          <div className="surface-panel p-5">
            <p className="text-sm font-semibold text-ink-muted">ماذا أفعل؟</p>
            <p className="mt-3 leading-7 text-ink-muted">
              إذا تكرر الخطأ، راجع الصيدلي أو تأكد من صلاحية الرمز والدفع.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col justify-between gap-6">
        <motion.div
          className="surface-panel border-error/35 bg-[#FFEBEE] p-6"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="h-12 w-12 text-error" aria-hidden />
          <h2 className="mt-4 text-3xl font-bold text-ink">
            {error?.title ?? 'حدث خطأ'}
          </h2>
          <p className="mt-4 text-lg leading-8 text-ink-muted">
            {error?.description ??
              'لم يتم إكمال العملية. يمكنك المحاولة مرة أخرى أو العودة للبداية.'}
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          <TouchButton onClick={handleRetry}>إعادة المحاولة</TouchButton>
          <TouchButton tone="secondary" onClick={handleHome}>
            العودة للبداية
          </TouchButton>
        </div>
      </div>
    </TabletShell>
  )
}
