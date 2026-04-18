import { create } from 'zustand'

interface Toast {
  id: string
  drugName: string
  messageAr: string
  messageEn: string
}

interface ToastStore {
  toast: Toast | null
  _timerId: ReturnType<typeof setTimeout> | null
  addToast: (drugName: string, messageAr: string, messageEn: string) => void
  dismiss: () => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toast: null,
  _timerId: null,

  addToast(drugName, messageAr, messageEn) {
    const existing = get()._timerId
    if (existing) clearTimeout(existing)

    const id = Math.random().toString(36).slice(2)
    const timerId = setTimeout(() => {
      set({ toast: null, _timerId: null })
    }, 2500)

    set({ toast: { id, drugName, messageAr, messageEn }, _timerId: timerId })
  },

  dismiss() {
    const existing = get()._timerId
    if (existing) clearTimeout(existing)
    set({ toast: null, _timerId: null })
  },
}))
