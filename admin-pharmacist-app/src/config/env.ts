export interface RuntimeEnvironment {
  appName: string
  apiBaseUrl: string
  useMock: boolean
  /** When true, login form is pre-filled with demo credentials (dev convenience only). */
  showDevLoginHints: boolean
}

const env = import.meta.env
const LOCAL_API_FALLBACK = 'http://localhost:3000/api'

function getWindowOrigin() {
  if (typeof window === 'undefined') return null
  return window.location.origin
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function normalizeHttpBaseUrl(rawValue: string | undefined, fallbackPath: string) {
  const configuredValue = rawValue?.trim()
  const windowOrigin = getWindowOrigin()

  if (!configuredValue) {
    if (windowOrigin) return `${trimTrailingSlash(windowOrigin)}${fallbackPath}`
    return LOCAL_API_FALLBACK
  }

  try {
    const baseUrl = windowOrigin ? new URL(configuredValue, windowOrigin) : new URL(configuredValue)
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseUrl.protocol === 'http:') {
      baseUrl.protocol = 'https:'
    }
    return trimTrailingSlash(baseUrl.toString())
  } catch {
    return trimTrailingSlash(configuredValue)
  }
}

export const runtimeEnvironment: RuntimeEnvironment = {
  appName: env.VITE_APP_NAME ?? 'لوحة الأدمن والصيدلي - الصيدلية المؤتمتة',
  apiBaseUrl: normalizeHttpBaseUrl(env.VITE_API_BASE_URL as string | undefined, '/api'),
  useMock: env.VITE_USE_MOCK !== 'false',
  showDevLoginHints:
    env.VITE_SHOW_DEV_LOGIN_HINTS === 'true' ||
    (env.DEV === true && env.VITE_SHOW_DEV_LOGIN_HINTS !== 'false'),
}
