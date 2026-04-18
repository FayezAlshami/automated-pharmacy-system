import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { StatusBanner } from '@/components/common/StatusBanner'
import { TouchButton } from '@/components/common/TouchButton'
import { PrescriptionSummary } from '@/components/features/PrescriptionSummary'
import { TabletShell } from '@/components/layout/TabletShell'
import { useTabletFlowController } from '@/hooks/useTabletFlowController'

export function VerificationPage() {
  const navigate = useNavigate()
  const hasTriggered = useRef(false)
  const { activeScenario, verificationResult, verifyActiveScenario, isBusy } =
    useTabletFlowController()

  useEffect(() => {
    if (!activeScenario) {
      navigate('/scan', { replace: true })
      return
    }

    if (!hasTriggered.current && verificationResult.status === 'idle') {
      hasTriggered.current = true
      void verifyActiveScenario()
    }
  }, [activeScenario, navigate, verificationResult.status, verifyActiveScenario])

  const tone =
    verificationResult.status === 'verified'
      ? 'success'
      : verificationResult.status === 'checking'
        ? 'processing'
        : 'danger'

  return (
    <TabletShell
      eyebrow="Verify"
      title="التحقق من الوصفة والجاهزية"
      subtitle="نعرض حالة التحقق بوضوح: إما المتابعة إلى الدفع أو الصرف، أو رسالة توضح سبب التوقف."
      aside={<PrescriptionSummary scenario={activeScenario} />}
    >
      <div className="space-y-6">
        <StatusBanner
          tone={tone}
          title={verificationResult.badge}
          description={verificationResult.message}
        />

        <div className="surface-panel p-5">
          <p className="text-sm font-semibold text-ink-muted">ملاحظات الطبيب</p>
          <p className="mt-3 leading-8 text-ink-muted">
            {activeScenario?.notes ?? 'لا توجد ملاحظات إضافية.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {verificationResult.canContinue ? (
            <TouchButton
              disabled={isBusy}
              onClick={() =>
                navigate(activeScenario?.requiresPayment ? '/payment' : '/dispensing')
              }
            >
              {activeScenario?.requiresPayment ? 'المتابعة إلى الدفع' : 'المتابعة إلى الصرف'}
            </TouchButton>
          ) : (
            <TouchButton tone="danger" disabled={isBusy} onClick={() => navigate('/error')}>
              عرض تفاصيل الخطأ
            </TouchButton>
          )}

          <TouchButton tone="secondary" onClick={() => navigate('/scan')}>
            الرجوع إلى القراءة
          </TouchButton>
        </div>
      </div>
    </TabletShell>
  )
}
