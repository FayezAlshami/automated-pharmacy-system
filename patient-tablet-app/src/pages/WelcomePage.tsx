import { motion, useReducedMotion } from 'framer-motion'
import { QrCode, ShieldCheck, WalletCards } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { TouchButton } from '@/components/common/TouchButton'
import { TabletShell } from '@/components/layout/TabletShell'
import { welcomeInstructions } from '@/constants/flow'
import { useTabletFlowController } from '@/hooks/useTabletFlowController'

export function WelcomePage() {
  const navigate = useNavigate()
  const { startJourney } = useTabletFlowController()
  const reduceMotion = useReducedMotion()

  const handleStart = () => {
    startJourney()
    navigate('/scan')
  }

  return (
    <TabletShell
      eyebrow="Start"
      title="مرحباً بك في كشك الصيدلية المؤتمتة"
      subtitle="واجهة لمس واضحة: امسح الوصفة، أكمل الدفع عند الحاجة، ثم استلم دواءك من نقطة التسليم."
      aside={
        <div className="space-y-4">
          {welcomeInstructions.map((instruction, index) => (
            <motion.div
              key={instruction}
              className="surface-panel p-4"
              initial={reduceMotion ? false : { opacity: 0, x: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * index, duration: 0.3 }}
            >
              <p className="text-sm font-semibold text-ink-muted">الخطوة {index + 1}</p>
              <p className="mt-2 leading-7 text-ink">{instruction}</p>
            </motion.div>
          ))}
        </div>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4 px-2">
          <p className="text-sm text-ink-muted">جلسة جديدة لكل مريض لضمان الخصوصية والدقة.</p>
          <TouchButton onClick={handleStart}>ابدأ الآن</TouchButton>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: QrCode,
            title: 'مسح الباركود',
            body: 'وجّه الرمز نحو الكاميرا حتى يُقرأ تلقائياً، مع إمكانية الإدخال اليدوي عند الحاجة.',
          },
          {
            icon: WalletCards,
            title: 'دفع آمن',
            body: 'اختر وسيلة الدفع المناسبة وأكمل العملية.',
          },
          {
            icon: ShieldCheck,
            title: 'صرف مؤتمت',
            body: 'تتبع مراحل الصرف حتى يصبح الدواء جاهزاً للاستلام.',
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            className="surface-panel p-5"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 * i, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <item.icon className="h-10 w-10 text-primary" aria-hidden />
            <h3 className="mt-4 text-xl font-bold text-ink">{item.title}</h3>
            <p className="mt-3 leading-7 text-ink-muted">{item.body}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <TouchButton onClick={handleStart}>بدء جلسة جديدة</TouchButton>
        <TouchButton tone="secondary" onClick={() => navigate('/scan')}>
          الانتقال إلى المسح
        </TouchButton>
      </div>
    </TabletShell>
  )
}
