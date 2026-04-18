const SESSION_KEY = 'admin-pharmacist-session'
const AUTH_TOKEN_KEY = 'admin-pharmacist-auth-token'
const LANGUAGE_KEY = 'admin-pharmacist-language'
const THEME_KEY = 'admin-pharmacist-theme'

/**
 * Reads the persisted admin or pharmacist session identifier.
 */
export function readAdminSession() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(SESSION_KEY)
}

/**
 * Persists or clears the active admin session identifier.
 */
export function writeAdminSession(value: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (value) {
    window.localStorage.setItem(SESSION_KEY, value)
    return
  }

  window.localStorage.removeItem(SESSION_KEY)
}

/** Bearer token for API mode (`Authorization` header). */
export function readAuthToken() {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function writeAuthToken(value: string | null) {
  if (typeof window === 'undefined') {
    return
  }
  if (value) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, value)
    return
  }
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function readAdminLanguage() {
  if (typeof window === 'undefined') {
    return 'ar'
  }

  const value = window.localStorage.getItem(LANGUAGE_KEY)
  return value === 'en' ? 'en' : 'ar'
}

export function writeAdminLanguage(value: 'ar' | 'en') {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LANGUAGE_KEY, value)
}

export function readAdminTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const value = window.localStorage.getItem(THEME_KEY)
  return value === 'dark' ? 'dark' : 'light'
}

export function writeAdminTheme(value: 'light' | 'dark') {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_KEY, value)
}
