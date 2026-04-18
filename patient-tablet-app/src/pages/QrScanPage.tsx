import clsx from 'clsx'
import { useCallback, useState } from 'react'
import { ScanLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { BarcodeScanner } from '@/components/features/BarcodeScanner'
import { PrescriptionSummary } from '@/components/features/PrescriptionSummary'
import { TouchButton } from '@/components/common/TouchButton'
import { TabletShell } from '@/components/layout/TabletShell'
import { appConfig } from '@/config/appConfig'
import { useTabletFlowController } from '@/hooks/useTabletFlowController'

export function QrScanPage() {
  const navigate = useNavigate()
  const [manualCode, setManualCode] = useState('')
  const { scanPresets, scanBarcode, scanMessage, activeScenario, isBusy } =
    useTabletFlowController()

  const handleDecoded = useCallback(
    async (text: string) => {
      const success = await scanBarcode(text)
      navigate(success ? '/verification' : '/error')
    },
    [navigate, scanBarcode],
  )

  const submitManual = async () => {
    const success = await scanBarcode(manualCode)
    navigate(success ? '/verification' : '/error')
  }

  return (
    <TabletShell
      eyebrow="Scan"
      title="امسح باركود الوصفة"
      subtitle="وجّه الرمز نحو الكاميرا حتى يُقرأ تلقائياً، أو أدخل الرمز يدوياً إذا لزم الأمر."
      aside={<PrescriptionSummary scenario={activeScenario} />}
    >
      <div className="space-y-8">
        <div className="surface-card grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-muted px-4 py-2 text-sm font-semibold text-primary">
              <ScanLine className="h-4 w-4" />
              حالة القارئ
            </p>
            <h2 className="mt-4 text-2xl font-bold text-ink">الكاميرا جاهزة</h2>
            <p className="mt-3 text-lg leading-8 text-ink-muted">{scanMessage}</p>
          </div>
        </div>

        <BarcodeScanner onDecode={handleDecoded} disabled={isBusy} />

        <div className="surface-panel p-5">
          <label className="block text-sm font-semibold text-ink-muted" htmlFor="manual-barcode">
            إدخال يدوي للرمز
          </label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="manual-barcode"
              type="text"
              autoComplete="off"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void submitManual()}
              placeholder="أدخل الرمز ثم اضغط تأكيد"
              className="min-h-[52px] flex-1 rounded-2xl border border-line bg-white px-4 text-lg text-ink outline-none ring-primary/20 focus:ring-4"
              disabled={isBusy}
            />
            <TouchButton type="button" disabled={isBusy} onClick={() => void submitManual()}>
              تأكيد الرمز
            </TouchButton>
          </div>
        </div>

        {appConfig.useMock && scanPresets.length > 0 ? (
          <div>
            <p className="mb-3 text-sm font-semibold text-ink-muted">اختصارات للمطورين</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scanPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={clsx(
                    'surface-panel min-h-[160px] p-5 text-right transition hover:-translate-y-0.5',
                    preset.tone === 'primary' && 'border-primary/25 bg-primary-muted/80',
                    preset.tone === 'warning' && 'border-[#FFC107]/40 bg-[#FFF8E1]',
                    preset.tone === 'danger' && 'border-[#F44336]/25 bg-[#FFEBEE]',
                    preset.tone === 'neutral' && 'border-line bg-white',
                  )}
                  disabled={isBusy}
                  onClick={() => void handleDecoded(preset.scenarioId)}
                >
                  <h3 className="text-xl font-bold text-ink">{preset.title}</h3>
                  <p className="mt-3 leading-7 text-ink-muted">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-4">
          <TouchButton tone="secondary" onClick={() => navigate('/')}>
            العودة للبداية
          </TouchButton>
        </div>
      </div>
    </TabletShell>
  )
}
