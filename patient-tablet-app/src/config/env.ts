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

export const runtimeEnvironment: RuntimeEnvironment = {
  appName: env.VITE_APP_NAME ?? 'واجهة المريض - الصيدلية المؤتمتة',
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  useMock: env.VITE_USE_MOCK !== 'false',
  esp32BaseUrl: (env.VITE_ESP32_BASE_URL as string | undefined)?.trim() ?? '',
  esp32WsUrl: (env.VITE_ESP32_WS_URL as string | undefined)?.trim() ?? '',
}
