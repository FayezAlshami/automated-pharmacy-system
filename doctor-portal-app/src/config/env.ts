export interface RuntimeEnvironment {
  appName: string
  apiBaseUrl: string
  useMock: boolean
}

const env = import.meta.env

export const runtimeEnvironment: RuntimeEnvironment = {
  appName: env.VITE_APP_NAME ?? 'بوابة الطبيب - الصيدلية المؤتمتة',
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  useMock: env.VITE_USE_MOCK !== 'false',
}
