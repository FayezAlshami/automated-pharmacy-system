import { appConfig } from '@/config/appConfig'

/**
 * حالات يفترض أن يعيدها الـ ESP32 على المسار `/status` (JSON).
 * عدّل الحقول عند الحاجة ليتوافق مع البرنامج الثابت.
 */
export type Esp32HardwareState = 'idle' | 'moving' | 'dispensing' | 'error' | 'done'

export interface Esp32StatusPayload {
  state: Esp32HardwareState
  message?: string
  /** فهرس تقريبي للخطوة (0…n) لعرض الـ timeline */
  step?: number
}

function baseUrl() {
  return appConfig.esp32BaseUrl.replace(/\/$/, '')
}

export function isEsp32Configured(): boolean {
  return baseUrl().length > 0
}

export async function fetchEsp32Status(): Promise<Esp32StatusPayload | null> {
  if (!isEsp32Configured()) return null
  try {
    const response = await fetch(`${baseUrl()}/status`, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null
    return (await response.json()) as Esp32StatusPayload
  } catch {
    return null
  }
}
