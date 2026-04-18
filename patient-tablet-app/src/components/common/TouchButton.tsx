import clsx from 'clsx'
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

interface TouchButtonProps
  extends PropsWithChildren,
    ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'primary' | 'secondary' | 'danger' | 'ghost'
  fullWidth?: boolean
}

export function TouchButton({
  children,
  className,
  tone = 'primary',
  fullWidth = false,
  ...rest
}: TouchButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-3xl px-6 py-4 text-lg font-semibold transition duration-200 focus:outline-none focus:ring-4 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60',
        fullWidth && 'w-full',
        tone === 'primary' &&
          'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90',
        tone === 'secondary' &&
          'border border-line bg-white text-ink hover:border-primary/30 hover:bg-primary-muted',
        tone === 'danger' &&
          'bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700',
        tone === 'ghost' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
