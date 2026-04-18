import axios from 'axios'

/** استخراج رسالة FastAPI من Axios (حقل detail) */
export function getAxiosDetailMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }
  const data = error.response?.data as { detail?: unknown } | undefined
  const detail = data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === 'object' && item && 'msg' in item ? String((item as { msg: string }).msg) : String(item)))
      .join(' ')
  }
  return error.message || fallback
}
