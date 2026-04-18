import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: number
  helper: string
  icon: ReactNode
  accent?: 'default' | 'highlight'
}

export function MetricCard({ label, value, helper, icon, accent = 'default' }: MetricCardProps) {
  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl p-6 transition-shadow hover:shadow-[0_12px_40px_rgba(26,42,58,0.1)] ${
        accent === 'highlight'
          ? 'metric-card-accent shadow-[0_4px_24px_rgba(26,42,58,0.06)]'
          : 'border border-slateAdmin-200 bg-white shadow-[0_4px_24px_rgba(26,42,58,0.06)]'
      }`}
      initial={{ opacity: 1, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slateAdmin-500">
            {label}
          </p>
          <p className="mt-3 text-4xl font-bold tabular-nums tracking-tight text-slateAdmin-950">
            {value}
          </p>
          <p className="mt-2 max-w-[14rem] text-sm leading-relaxed text-slateAdmin-500">
            {helper}
          </p>
        </div>
        <div className="shrink-0 rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3.5 text-brandSecondary shadow-inner transition group-hover:border-brandSecondary/30">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
