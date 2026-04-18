export interface RuntimeEnvironment {
  appName: string
  apiBaseUrl: string
  useMock: boolean
  /** When true, login form is pre-filled with demo credentials (dev convenience only). */
  showDevLoginHints: boolean
}

const env = import.meta.env

export const runtimeEnvironment: RuntimeEnvironment = {
  appName: env.VITE_APP_NAME ?? 'لوحة الأدمن والصيدلي - الصيدلية المؤتمتة',
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  useMock: env.VITE_USE_MOCK !== 'false',
  showDevLoginHints:
    env.VITE_SHOW_DEV_LOGIN_HINTS === 'true' ||
    (env.DEV === true && env.VITE_SHOW_DEV_LOGIN_HINTS !== 'false'),
}
