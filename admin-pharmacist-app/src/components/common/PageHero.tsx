import clsx from 'clsx'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
  meta?: ReactNode
  className?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  action,
  meta,
  className,
}: PageHeroProps) {
  return (
    <motion.section
      className={clsx(
        'relative overflow-hidden rounded-[28px] border border-slateAdmin-200 bg-white p-6 shadow-[0_8px_40px_rgba(26,42,58,0.06)] sm:p-8 lg:p-10',
        className,
      )}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(0,158,219,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(26,42,58,0.06),transparent_70%)]" />

      <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <span className="inline-flex items-center rounded-full border border-slateAdmin-200 bg-slateAdmin-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slateAdmin-500">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slateAdmin-950 sm:text-4xl lg:text-[2.35rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slateAdmin-600 sm:text-lg">
            {description}
          </p>
          {meta ? <div className="mt-6 flex flex-wrap gap-2">{meta}</div> : null}
        </div>

        {action ? <div className="shrink-0 xl:pt-1">{action}</div> : null}
      </div>
    </motion.section>
  )
}
