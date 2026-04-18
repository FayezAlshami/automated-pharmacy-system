import clsx from 'clsx'

interface StatusPillProps {
  tone: 'success' | 'warning' | 'danger' | 'neutral'
  label: string
}

export function StatusPill({ tone, label }: StatusPillProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-bold',
        tone === 'success' &&
          'border-slateAdmin-200 bg-[rgba(0,158,219,0.08)] text-brandSecondary',
        tone === 'warning' &&
          'border-slateAdmin-200 bg-slateAdmin-50 text-slateAdmin-900',
        tone === 'danger' && 'border-slateAdmin-200 bg-slateAdmin-100 text-slateAdmin-950',
        tone === 'neutral' && 'border-slateAdmin-200 bg-slateAdmin-50 text-slateAdmin-600',
      )}
    >
      {label}
    </span>
  )
}
