import { Check, ShoppingCart, X } from 'lucide-react'

import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'
import { useToastStore } from '@/store/useToastStore'

export function CartToast() {
  const { toast, dismiss } = useToastStore()
  const language = useDoctorPortalStore((state) => state.language)

  if (!toast) return null

  const message = language === 'ar' ? toast.messageAr : toast.messageEn

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-primary-900 px-5 py-4 text-white shadow-portal"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success/20 text-success">
        <Check className="h-5 w-5" />
      </span>

      <div className="min-w-0">
        <p className="truncate font-semibold leading-tight">{toast.drugName}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-primary-300">
          <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
          {message}
        </p>
      </div>

      <button
        onClick={dismiss}
        type="button"
        aria-label={language === 'ar' ? 'إغلاق' : 'Dismiss'}
        className="ms-1 shrink-0 text-primary-400 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
