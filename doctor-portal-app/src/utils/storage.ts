import type { PortalLanguage } from '@/types/doctor-portal'

const SESSION_KEY = 'doctor-portal-session'
const LANGUAGE_KEY = 'doctor-portal-language'
const FAVORITES_KEY = 'doctor-portal-favorites'

/**
 * Reads the persisted doctor identifier from local storage.
 */
export function readStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(SESSION_KEY)
}

/**
 * Persists or clears the active doctor session identifier.
 */
export function writeStoredSession(sessionValue: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (sessionValue) {
    window.localStorage.setItem(SESSION_KEY, sessionValue)
    return
  }

  window.localStorage.removeItem(SESSION_KEY)
}

/**
 * Reads the doctor portal language preference.
 */
export function readStoredLanguage(): PortalLanguage | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(LANGUAGE_KEY)
  return value === 'ar' || value === 'en' ? value : null
}

/**
 * Persists the chosen portal language.
 */
export function writeStoredLanguage(language: PortalLanguage) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LANGUAGE_KEY, language)
}

/**
 * Reads the stored favourite drug identifiers.
 */
export function readStoredFavoriteDrugIds() {
  if (typeof window === 'undefined') {
    return [] as string[]
  }

  try {
    const rawValue = window.localStorage.getItem(FAVORITES_KEY)
    if (!rawValue) {
      return [] as string[]
    }

    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : []
  } catch {
    return [] as string[]
  }
}

/**
 * Persists the favourite drug identifiers.
 */
export function writeStoredFavoriteDrugIds(drugIds: string[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(drugIds))
}
