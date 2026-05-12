/**
 * يعرّف المتغيرات البيئية المستخدمة داخل التطبيق مع قيم افتراضية مناسبة للتطوير المحلي.
 */
export interface RuntimeEnvironment {
  appName: string
  apiBaseUrl: string
  useMock: boolean
  esp32BaseUrl: string
  esp32WsUrl: string
}

const env = import.meta.env
const LOCAL_API_FALLBACK = 'http://localhost:3000/api'
const LOCAL_WS_FALLBACK = 'ws://localhost:3000/ws'

function getWindowOrigin() {
  if (typeof window === 'undefined') return null
  return window.location.origin
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function buildWindowHttpUrl(fallbackPath: string) {
  return `${trimTrailingSlash(window.location.origin)}${fallbackPath}`
}

function buildWindowWsUrl(fallbackPath: string) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}${fallbackPath}`
}

function shouldPreferWindowOrigin(baseUrl: URL) {
  if (typeof window === 'undefined') return false
  if (window.location.protocol !== 'https:') return false

  return baseUrl.host !== window.location.host
}

function normalizeHttpBaseUrl(rawValue: string | undefined, fallbackPath: string) {
  const configuredValue = rawValue?.trim()
  const windowOrigin = getWindowOrigin()

  if (!configuredValue) {
    if (windowOrigin) return buildWindowHttpUrl(fallbackPath)
    return LOCAL_API_FALLBACK
  }

  try {
    const baseUrl = windowOrigin ? new URL(configuredValue, windowOrigin) : new URL(configuredValue)
    if (shouldPreferWindowOrigin(baseUrl)) {
      return buildWindowHttpUrl(fallbackPath)
    }
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseUrl.protocol === 'http:') {
      baseUrl.protocol = 'https:'
    }
    return trimTrailingSlash(baseUrl.toString())
  } catch {
    return trimTrailingSlash(configuredValue)
  }
}

function normalizeWsBaseUrl(rawValue: string | undefined, fallbackPath: string) {
  const configuredValue = rawValue?.trim()

  if (!configuredValue) {
    if (typeof window !== 'undefined') {
      return buildWindowWsUrl(fallbackPath)
    }
    return LOCAL_WS_FALLBACK
  }

  try {
    const baseUrl = new URL(
      configuredValue,
      typeof window !== 'undefined' ? window.location.origin : undefined,
    )
    if (shouldPreferWindowOrigin(baseUrl)) {
      return buildWindowWsUrl(fallbackPath)
    }
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseUrl.protocol === 'ws:') {
      baseUrl.protocol = 'wss:'
    }
    return trimTrailingSlash(baseUrl.toString())
  } catch {
    return trimTrailingSlash(configuredValue)
  }
}

export const runtimeEnvironment: RuntimeEnvironment = {
  appName: env.VITE_APP_NAME ?? 'واجهة المريض - الصيدلية المؤتمتة',
  apiBaseUrl: normalizeHttpBaseUrl(env.VITE_API_BASE_URL as string | undefined, '/api'),
  useMock: env.VITE_USE_MOCK !== 'false',
  esp32BaseUrl: (env.VITE_ESP32_BASE_URL as string | undefined)?.trim() ?? '',
  esp32WsUrl: normalizeWsBaseUrl(env.VITE_ESP32_WS_URL as string | undefined, '/ws'),
}
