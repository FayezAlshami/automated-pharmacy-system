import { runtimeEnvironment } from '@/config/env'

export const appConfig = {
  appName: runtimeEnvironment.appName,
  apiBaseUrl: runtimeEnvironment.apiBaseUrl,
  useMock: runtimeEnvironment.useMock,
  showDevLoginHints: runtimeEnvironment.showDevLoginHints,
} as const
