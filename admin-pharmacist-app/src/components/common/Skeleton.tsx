import clsx from 'clsx'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-gradient-to-r from-slateAdmin-100 via-slateAdmin-50 to-slateAdmin-100 bg-[length:200%_100%]',
        className,
      )}
      aria-hidden
    />
  )
}
