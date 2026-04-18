import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Copy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { TouchButton } from '@/components/common/TouchButton'
import { PrescriptionSummary } from '@/components/features/PrescriptionSummary'
import { TabletShell } from '@/components/layout/TabletShell'
import { useTabletFlowController } from '@/hooks/useTabletFlowController'
import { formatCurrency } from '@/utils/formatters'
import shamCashLogo from '@/assets/sham-cash.png'
import syriatelCashLogo from '@/assets/syriatel-cash.png'

const METHOD_LOGOS: Record<string, string> = {
  'syriatel-cash': syriatelCashLogo,
  'sham-cash': shamCashLogo,
}

const COUNTDOWN_SECONDS = 5

export function PaymentPage() {
  const navigate = useNavigate()
  const {
    activeScenario,
    paymentMethods,
    selectedPaymentMethodId,
    selectPaymentMethod,
    processPayment,
    isBusy,
  } = useTabletFlowController()

  const [countdown, setCountdown] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!activeScenario) {
      navigate('/scan', { replace: true })
    }
  }, [activeScenario, navigate])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (!activeScenario) return null

  const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethodId)

  const handleCopyWallet = () => {
    if (!selectedMethod?.walletAddress) return
    void navigator.clipboard.writeText(selectedMethod.walletAddress).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleConfirmPayment = () => {
    if (!activeScenario.requiresPayment) {
      void processPayment().then((success) => {
        navigate(success ? '/dispensing' : '/error')
      })
      return
    }

    // Start 5-second countdown then auto-succeed
    setCountdown(COUNTDOWN_SECONDS)
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          // Trigger payment processing then navigate
          void processPayment().then((success) => {
            navigate(success ? '/dispensing' : '/error')
          })
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const isCounting = countdown !== null
  const circumference = 2 * Math.PI * 26
  const progress = isCounting ? ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * circumference : 0

  return (
    <TabletShell
      eyebrow="Pay"
      title="اختر طريقة الدفع"
      subtitle="اختر إحدى طرق الدفع أدناه، حوّل المبلغ المطلوب إلى رقم المحفظة، ثم اضغط تأكيد الدفع."
      aside={<PrescriptionSummary scenario={activeScenario} />}
    >
      <div className="space-y-8" dir="rtl">
        {/* ───── Payment Method Cards ───── */}
        {activeScenario.requiresPayment ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const isSelected = selectedPaymentMethodId === method.id
                const logo = METHOD_LOGOS[method.id]

                return (
                  <button
                    key={method.id}
                    type="button"
                    disabled={isBusy || isCounting}
                    onClick={() => selectPaymentMethod(method.id)}
                    className={[
                      'relative flex flex-col items-center gap-4 rounded-3xl border-2 p-6 text-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/25',
                      isSelected
                        ? 'border-primary bg-primary-muted shadow-lg shadow-primary/15 ring-2 ring-primary/30'
                        : 'border-line bg-white hover:border-primary/40 hover:shadow-md',
                    ].join(' ')}
                  >
                    {/* Selected checkmark */}
                    {isSelected && (
                      <CheckCircle2 className="absolute left-4 top-4 h-6 w-6 text-primary" />
                    )}

                    {/* Logo */}
                    {logo ? (
                      <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-sm">
                        <img
                          src={logo}
                          alt={method.label}
                          className="h-full w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-muted">
                        <span className="text-3xl">💳</span>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-bold text-ink">{method.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-ink-muted">{method.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ───── Wallet Info Panel ───── */}
            {selectedMethod?.walletAddress && (
              <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary-muted to-white p-6 shadow-sm">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-muted">
                  رقم المحفظة
                </p>

                <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-white px-5 py-4 shadow-inner">
                  <p className="flex-1 select-all text-right font-mono text-2xl font-bold tracking-widest text-ink">
                    {selectedMethod.walletAddress}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyWallet}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 active:scale-95"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/70 px-5 py-3">
                  <span className="text-base text-ink-muted">المبلغ المطلوب</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(activeScenario.paymentAmount)}
                  </span>
                </div>

                <p className="mt-4 text-center text-sm leading-6 text-ink-muted">
                  قم بتحويل المبلغ أعلاه إلى رقم المحفظة، ثم اضغط <strong>تأكيد الدفع</strong> لمتابعة عملية الصرف.
                </p>
              </div>
            )}
          </>
        ) : (
          /* No payment required */
          <div className="rounded-3xl border-2 border-[#4CAF50]/30 bg-[#E8F5E9] p-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#2E7D32]" />
            <h3 className="mt-4 text-2xl font-bold text-ink">لا يوجد دفع إضافي</h3>
            <p className="mt-2 text-base leading-7 text-ink-muted">
              هذه الوصفة مغطاة بالكامل، ويمكنك الانتقال مباشرة إلى مرحلة الصرف.
            </p>
          </div>
        )}

        {/* ───── Actions ───── */}
        <div className="flex flex-wrap items-center gap-4" dir="ltr">
          {isCounting ? (
            /* Countdown button */
            <button
              type="button"
              disabled
              className="relative flex items-center gap-4 rounded-3xl bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 disabled:cursor-not-allowed"
            >
              {/* SVG circular countdown */}
              <svg className="-rotate-90" width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
                <text
                  x="30"
                  y="30"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="18"
                  fontWeight="bold"
                  style={{ transform: 'rotate(90deg)', transformOrigin: '30px 30px' }}
                >
                  {countdown}
                </text>
              </svg>
              جاري التأكيد...
            </button>
          ) : (
            <TouchButton
              disabled={isBusy || (activeScenario.requiresPayment && !selectedMethod?.walletAddress)}
              onClick={handleConfirmPayment}
            >
              {activeScenario.requiresPayment ? 'تأكيد الدفع' : 'المتابعة إلى الصرف'}
            </TouchButton>
          )}

          <TouchButton tone="secondary" onClick={() => navigate('/verification')}>
            الرجوع إلى التحقق
          </TouchButton>
        </div>
      </div>
    </TabletShell>
  )
}
