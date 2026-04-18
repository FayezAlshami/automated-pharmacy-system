import clsx from 'clsx'

import type { PrescriptionScenario } from '@/types/patient-flow'
import { formatCurrency } from '@/utils/formatters'

interface PrescriptionSummaryProps {
  scenario?: PrescriptionScenario
}

export function PrescriptionSummary({ scenario }: PrescriptionSummaryProps) {
  if (!scenario) {
    return (
      <div className="surface-panel flex h-full min-h-[200px] items-center justify-center p-6 text-center text-ink-muted">
        ستظهر هنا تفاصيل الوصفة بعد مسح الرمز بنجاح.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="surface-panel p-5">
        <p className="text-sm font-semibold text-ink-muted">بيانات المريض</p>
        <h3 className="mt-2 text-2xl font-bold text-ink">{scenario.patientName}</h3>
        <p className="mt-2 text-sm leading-7 text-ink-muted">
          رقم المستفيد: {scenario.patientId}
          <br />
          الطبيب المُصدر: {scenario.physicianName}
          <br />
          رقم العملية: {scenario.operationId}
        </p>
      </div>

      <div className="surface-panel p-5">
        <p className="text-sm font-semibold text-ink-muted">الأدوية المطلوبة</p>
        <div className="mt-4 space-y-3">
          {scenario.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between rounded-2xl border border-line bg-white/80 px-4 py-3"
            >
              <div>
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="text-sm text-ink-muted">
                  {item.dosage} • {item.manufacturer}
                </p>
              </div>
              <div className="text-left">
                <p className="font-semibold text-ink">×{item.quantity}</p>
                <p
                  className={clsx(
                    'text-sm',
                    item.availability === 'available' && 'text-success',
                    item.availability === 'low' && 'text-processing',
                    item.availability === 'out' && 'text-error',
                  )}
                >
                  {item.availability === 'available'
                    ? 'متوفر'
                    : item.availability === 'low'
                      ? 'مخزون منخفض'
                      : 'غير متوفر'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-panel p-5">
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">إجمالي المبلغ</span>
          <span className="text-2xl font-bold text-ink">
            {formatCurrency(scenario.paymentAmount)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-7 text-ink-muted">{scenario.coverageNote}</p>
      </div>
    </div>
  )
}
