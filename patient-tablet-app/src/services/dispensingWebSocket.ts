/**
 * dispensingWebSocket.ts
 * خدمة WebSocket للتواصل المباشر مع الـ Backend أثناء مرحلة الصرف.
 *
 * تدفق الاتصال:
 *   1. connect() → يفتح ws://<backend>/ws/tablet/{operationId}
 *   2. startDispense() → يرسل { type: "start_dispense" }
 *   3. الـ Backend يُعيد توجيه dispense_progress و dispense_result من ESP32
 *   4. الـ handlers المسجّلة تُحدّث الـ UI
 *
 * عند فشل الاتصال: يُعيد المحاولة حتى MAX_RETRIES مرات.
 */

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

export interface DispenseProgressMessage {
  type: 'dispense_progress'
  job_id: number
  step: 'cabinet_start' | 'cabinet_done_one' | 'conveyor_start' | 'delivery_done'
  cabinet_id: number
  remaining: number
}

export interface DispenseResultMessage {
  type: 'dispense_result'
  job_id: number
  result_code: number
  message: string
}

type ProgressHandler = (msg: DispenseProgressMessage) => void
type ResultHandler = (msg: DispenseResultMessage) => void

export const ESP32_RESULT_CODES = {
  SUCCESS: 210,
  TIMEOUT: 211,
  BUSY: 216,
  SERVER_ERROR: 218,
  CONVEYOR_FAIL: 219,
} as const

export class DispensingWebSocket {
  private ws: WebSocket | null = null
  private retries = 0
  private closed = false
  private progressHandlers: ProgressHandler[] = []
  private resultHandlers: ResultHandler[] = []

  private readonly operationId: string
  private readonly wsBaseUrl: string

  constructor(operationId: string, wsBaseUrl: string) {
    this.operationId = operationId
    this.wsBaseUrl = wsBaseUrl
  }

  /** يفتح اتصال WebSocket مع الـ Backend */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.closed) {
        reject(new Error('DispensingWebSocket was already closed'))
        return
      }

      const url = `${this.wsBaseUrl}/tablet/${encodeURIComponent(this.operationId)}`

      try {
        this.ws = new WebSocket(url)
      } catch (err) {
        reject(err)
        return
      }

      this.ws.onopen = () => {
        this.retries = 0
        resolve()
      }

      this.ws.onmessage = (event: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(event.data) as DispenseProgressMessage | DispenseResultMessage

          if (msg.type === 'dispense_progress') {
            this.progressHandlers.forEach((h) => h(msg))
          } else if (msg.type === 'dispense_result') {
            this.resultHandlers.forEach((h) => h(msg))
          }
        } catch {
          // ignore malformed messages
        }
      }

      this.ws.onerror = () => {
        // handled in onclose
      }

      this.ws.onclose = () => {
        if (!this.closed && this.retries < MAX_RETRIES) {
          this.retries++
          setTimeout(() => {
            this.connect().catch(() => {
              // notify result handlers that connection failed permanently
              const failMsg: DispenseResultMessage = {
                type: 'dispense_result',
                job_id: -1,
                result_code: ESP32_RESULT_CODES.SERVER_ERROR,
                message: 'انقطع الاتصال بالنظام. يرجى مراجعة الصيدلي.',
              }
              this.resultHandlers.forEach((h) => h(failMsg))
            })
          }, RETRY_DELAY_MS)
        } else if (!this.closed && this.retries >= MAX_RETRIES) {
          const failMsg: DispenseResultMessage = {
            type: 'dispense_result',
            job_id: -1,
            result_code: ESP32_RESULT_CODES.SERVER_ERROR,
            message: 'انقطع الاتصال بالنظام بعد عدة محاولات. يرجى مراجعة الصيدلي.',
          }
          this.resultHandlers.forEach((h) => h(failMsg))
        }
      }
    })
  }

  /** يُرسل أمر بدء الصرف إلى الـ Backend */
  startDispense(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[DispensingWebSocket] Cannot send: connection not open')
      return
    }
    this.ws.send(
      JSON.stringify({
        type: 'start_dispense',
        operation_id: this.operationId,
      }),
    )
  }

  /** تسجيل handler لاستقبال تحديثات التقدم */
  onProgress(handler: ProgressHandler): void {
    this.progressHandlers.push(handler)
  }

  /** تسجيل handler لاستقبال النتيجة النهائية */
  onResult(handler: ResultHandler): void {
    this.resultHandlers.push(handler)
  }

  /** إغلاق الاتصال وتنظيف الـ handlers */
  close(): void {
    this.closed = true
    this.progressHandlers = []
    this.resultHandlers = []
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
