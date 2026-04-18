import { motion, useReducedMotion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'

import { appConfig } from '@/config/appConfig'

interface TabletShellProps extends PropsWithChildren {
  eyebrow: string
  title: string
  subtitle: string
  aside?: ReactNode
  footer?: ReactNode
}

export function TabletShell({
  eyebrow,
  title,
  subtitle,
  aside,
  footer,
  children,
}: TabletShellProps) {
  const reduceMotion = useReducedMotion()

  return (
    <main className="min-h-screen bg-kiosk-mesh px-4 py-6 text-ink sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6">
        <motion.header
          className="surface-card flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-muted px-4 py-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              {appConfig.appName}
            </p>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-ink-muted">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-ink-muted">{subtitle}</p>
          </div>
        </motion.header>

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="surface-card p-6 sm:p-8">{children}</div>
          <aside className="surface-card p-6">{aside}</aside>
        </section>

        {footer ? <div className="surface-card p-4">{footer}</div> : null}
      </div>
    </main>
  )
}
