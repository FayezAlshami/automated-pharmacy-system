import { runtimeEnvironment } from '@/config/env'

/**
 * إعدادات التطبيق المشتقة من البيئة بحيث تستخدم في الواجهة والخدمات.
 */
export const appConfig = {
  appName: runtimeEnvironment.appName,
  apiBaseUrl: runtimeEnvironment.apiBaseUrl,
  useMock: runtimeEnvironment.useMock,
  esp32BaseUrl: runtimeEnvironment.esp32BaseUrl,
  esp32WsUrl: runtimeEnvironment.esp32WsUrl,
} as const
