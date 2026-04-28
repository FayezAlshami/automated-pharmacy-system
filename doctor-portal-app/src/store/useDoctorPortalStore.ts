import { create } from 'zustand'

import { authService } from '@/services/authService'
import type {
  AuthPayload,
  CartItem,
  DoctorAccount,
  Drug,
  PortalLanguage,
  SignupPayload,
} from '@/types/doctor-portal'
import {
  readStoredFavoriteDrugIds,
  readStoredLanguage,
  readStoredSession,
  writeStoredFavoriteDrugIds,
  writeStoredLanguage,
  writeStoredSession,
} from '@/utils/storage'

function resolveAuthError(error: unknown, language: PortalLanguage, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback
  }

  if (error.message === 'INVALID_CREDENTIALS') {
    return language === 'ar'
      ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
      : 'The email or password is incorrect.'
  }

  if (error.message === 'EMAIL_EXISTS') {
    return language === 'ar'
      ? 'هذا البريد مستخدم بالفعل.'
      : 'This email is already in use.'
  }

  if (error.message === 'PHONE_EXISTS') {
    return language === 'ar'
      ? 'رقم الهاتف مستخدم بالفعل.'
      : 'This phone number is already in use.'
  }

  return error.message
}

/**
 * Shared session, preferences, cart, and favourites state
 * for the authenticated doctor portal.
 */
interface DoctorPortalState {
  currentUser?: DoctorAccount
  cart: CartItem[]
  authError?: string
  isAuthLoading: boolean
  language: PortalLanguage
  favoriteDrugIds: string[]
  initialiseSession: () => Promise<void>
  signIn: (payload: AuthPayload) => Promise<boolean>
  signUp: (payload: SignupPayload) => Promise<boolean>
  signOut: () => void
  addToCart: (drug: Drug) => void
  updateQuantity: (drugId: string, quantity: number) => void
  removeFromCart: (drugId: string) => void
  clearCart: () => void
  setLanguage: (language: PortalLanguage) => void
  toggleLanguage: () => void
  toggleFavorite: (drugId: string) => void
  isFavorite: (drugId: string) => boolean
}

/**
 * Central doctor portal store responsible for session hydration,
 * authentication, cart interactions, and UI preferences.
 */
export const useDoctorPortalStore = create<DoctorPortalState>((set, get) => ({
  currentUser: undefined,
  cart: [],
  authError: undefined,
  isAuthLoading: false,
  language: 'ar',
  favoriteDrugIds: [],
  async initialiseSession() {
    const storedDoctorId = readStoredSession()
    const storedLanguage = readStoredLanguage()
    const storedFavoriteDrugIds = readStoredFavoriteDrugIds()

    set({
      language: storedLanguage ?? get().language,
      favoriteDrugIds: storedFavoriteDrugIds,
    })

    if (!storedDoctorId) {
      return
    }

    const doctor = await authService.getDoctorById(storedDoctorId)

    if (doctor) {
      set({ currentUser: doctor })
    }
  },
  async signIn(payload) {
    set({ isAuthLoading: true, authError: undefined })

    try {
      const doctor = await authService.signIn(payload)
      writeStoredSession(doctor.id)
      set({ currentUser: doctor, isAuthLoading: false })
      return true
    } catch (error) {
      set({
        isAuthLoading: false,
        authError: resolveAuthError(
          error,
          get().language,
          get().language === 'ar' ? 'فشل تسجيل الدخول.' : 'Failed to sign in.',
        ),
      })
      return false
    }
  },
  async signUp(payload) {
    set({ isAuthLoading: true, authError: undefined })

    try {
      const doctor = await authService.signUp(payload)
      writeStoredSession(doctor.id)
      set({ currentUser: doctor, isAuthLoading: false })
      return true
    } catch (error) {
      set({
        isAuthLoading: false,
        authError: resolveAuthError(
          error,
          get().language,
          get().language === 'ar' ? 'فشل إنشاء الحساب.' : 'Failed to create the account.',
        ),
      })
      return false
    }
  },
  signOut() {
    writeStoredSession(null)
    set({ currentUser: undefined, cart: [], authError: undefined })
  },
  addToCart(drug) {
    const exists = get().cart.find((item) => item.drug.id === drug.id)

    if (exists) {
      set({
        cart: get().cart.map((item) =>
          item.drug.id === drug.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      })
      return
    }

    set({
      cart: [...get().cart, { drug, quantity: 1 }],
    })
  },
  updateQuantity(drugId, quantity) {
    if (quantity <= 0) {
      set({
        cart: get().cart.filter((item) => item.drug.id !== drugId),
      })
      return
    }

    set({
      cart: get().cart.map((item) =>
        item.drug.id === drugId ? { ...item, quantity } : item,
      ),
    })
  },
  removeFromCart(drugId) {
    set({
      cart: get().cart.filter((item) => item.drug.id !== drugId),
    })
  },
  clearCart() {
    set({ cart: [] })
  },
  setLanguage(language) {
    writeStoredLanguage(language)
    set({ language })
  },
  toggleLanguage() {
    const nextLanguage = get().language === 'ar' ? 'en' : 'ar'
    writeStoredLanguage(nextLanguage)
    set({ language: nextLanguage })
  },
  toggleFavorite(drugId) {
    const favoriteDrugIds = get().favoriteDrugIds.includes(drugId)
      ? get().favoriteDrugIds.filter((id) => id !== drugId)
      : [...get().favoriteDrugIds, drugId]

    writeStoredFavoriteDrugIds(favoriteDrugIds)
    set({ favoriteDrugIds })
  },
  isFavorite(drugId) {
    return get().favoriteDrugIds.includes(drugId)
  },
}))
