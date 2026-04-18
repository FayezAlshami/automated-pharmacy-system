import clsx from 'clsx'

import type { DispensingStep } from '@/types/patient-flow'

interface FlowTimelineProps {
  steps: DispensingStep[]
}

export function FlowTimeline({ steps }: FlowTimelineProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
                step.status === 'completed' && 'bg-success text-white',
                step.status === 'active' && 'bg-primary text-white shadow-lift',
                step.status === 'error' && 'bg-error text-white',
                step.status === 'pending' && 'bg-line text-ink-muted',
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 ? (
              <div className="mt-2 h-12 w-px bg-line" />
            ) : null}
          </div>
          <div className="pt-1">
            <p className="text-lg font-semibold text-ink">{step.title}</p>
            <p className="text-sm leading-7 text-ink-muted">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
