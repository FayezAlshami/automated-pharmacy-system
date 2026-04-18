import { motion } from 'motion/react'
import type { PropsWithChildren, ReactNode } from 'react'

import { useAdminLocale } from '@/hooks/useAdminLocale'

interface ModalProps extends PropsWithChildren {
  open: boolean
  title: string
  footer?: ReactNode
  onClose: () => void
}

export function Modal({ open, title, footer, onClose, children }: ModalProps) {
  const { text } = useAdminLocale()

  if (!open) {
    return null
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slateAdmin-950/50 backdrop-blur-sm"
        aria-label={text('إغلاق', 'Close')}
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 w-full max-w-3xl rounded-[28px] border border-slateAdmin-200 bg-white p-6 shadow-[0_24px_80px_rgba(26,42,58,0.14)] sm:p-7"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slateAdmin-400">
              {text('نموذج', 'Form')}
            </p>
            <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-slateAdmin-950">{title}</h3>
          </div>
          <button className="button-secondary shrink-0 px-4 py-2.5 text-sm" onClick={onClose} type="button">
            {text('إغلاق', 'Close')}
          </button>
        </div>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </motion.div>
    </motion.div>
  )
}
