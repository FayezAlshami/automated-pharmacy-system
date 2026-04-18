import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { StatusBanner } from '@/components/common/StatusBanner'
import { TouchButton } from '@/components/common/TouchButton'
import { FlowTimeline } from '@/components/features/FlowTimeline'
import { PrescriptionSummary } from '@/components/features/PrescriptionSummary'
import { TabletShell } from '@/components/layout/TabletShell'
import { useTabletFlowController } from '@/hooks/useTabletFlowController'

export function DispensingPage() {
  const navigate = useNavigate()
  const hasTriggered = useRef(false)
  const { activeScenario, dispensingState, runDispensing, isBusy } =
    useTabletFlowController()

  useEffect(() => {
    if (!activeScenario) {
      navigate('/scan', { replace: true })
      return
    }

    if (!hasTriggered.current && dispensingState.status === 'idle') {
      hasTriggered.current = true
      void runDispensing()
    }
  }, [activeScenario, dispensingState.status, navigate, runDispensing])

  const tone =
    dispensingState.status === 'completed'
      ? 'success'
      : dispensingState.status === 'failed'
        ? 'danger'
        : 'processing'

  return (
    <TabletShell
      eyebrow="Dispense"
      title="جاري صرف الدواء"
      subtitle="تتبع الخطوات أدناه. عند اكتمال العملية، ستُفتح نقطة الاستلام أو تظهر رسالة في حال مشكلة."
      aside={<PrescriptionSummary scenario={activeScenario} />}
    >
      <div className="space-y-6">
        <StatusBanner
          tone={tone}
          title={
            dispensingState.status === 'completed'
              ? 'اكتملت العملية'
              : dispensingState.status === 'failed'
                ? 'حدثت مشكلة أثناء الصرف'
                : 'العملية قيد التنفيذ'
          }
          description={dispensingState.message}
        />

        <div className="surface-panel p-6">
          <FlowTimeline steps={dispensingState.steps} />
        </div>

        <div className="flex flex-wrap gap-4">
          {dispensingState.status === 'completed' ? (
            <TouchButton disabled={isBusy} onClick={() => navigate('/success')}>
              عرض شاشة النجاح
            </TouchButton>
          ) : null}
          {dispensingState.status === 'failed' ? (
            <TouchButton tone="danger" disabled={isBusy} onClick={() => navigate('/error')}>
              عرض تفاصيل الخطأ
            </TouchButton>
          ) : null}
          <TouchButton tone="secondary" onClick={() => navigate('/payment')}>
            العودة إلى الدفع
          </TouchButton>
        </div>
      </div>
    </TabletShell>
  )
}
