import clsx from 'clsx'
import {
  AlertTriangle,
  BadgeCheck,
  Clock3,
  LoaderCircle,
  type LucideIcon,
} from 'lucide-react'

interface StatusBannerProps {
  tone: 'info' | 'success' | 'warning' | 'danger' | 'processing'
  title: string
  description: string
}

const iconMap: Record<StatusBannerProps['tone'], LucideIcon> = {
  info: LoaderCircle,
  success: BadgeCheck,
  warning: Clock3,
  danger: AlertTriangle,
  processing: LoaderCircle,
}

export function StatusBanner({ tone, title, description }: StatusBannerProps) {
  const Icon = iconMap[tone]
  const spin = tone === 'info' || tone === 'processing'

  return (
    <div
      className={clsx(
        'surface-panel p-5',
        tone === 'info' && 'border-primary/20 bg-primary-muted',
        tone === 'success' && 'border-[#4CAF50]/35 bg-[#E8F5E9]',
        tone === 'warning' && 'border-[#FFC107]/40 bg-[#FFF8E1]',
        tone === 'processing' && 'border-[#FFC107]/45 bg-[#FFF8E1]',
        tone === 'danger' && 'border-[#F44336]/30 bg-[#FFEBEE]',
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={clsx(
            'rounded-2xl p-3',
            tone === 'info' && 'bg-primary-muted text-primary',
            tone === 'success' && 'bg-[#C8E6C9] text-[#2E7D32]',
            tone === 'warning' && 'bg-[#FFE082] text-[#F57F17]',
            tone === 'processing' && 'bg-[#FFE082] text-[#F57F17]',
            tone === 'danger' && 'bg-[#FFCDD2] text-[#C62828]',
          )}
        >
          <Icon className={clsx('h-6 w-6', spin && 'animate-spin')} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-ink">{title}</h3>
          <p className="text-base leading-7 text-ink-muted">{description}</p>
        </div>
      </div>
    </div>
  )
}
