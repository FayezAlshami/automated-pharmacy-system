import { create } from 'zustand'

import { appConfig } from '@/config/appConfig'
import { dispensingBlueprint, idlePaymentState, idleVerificationState } from '@/constants/flow'
import { fetchEsp32Status, isEsp32Configured } from '@/services/esp32HardwareService'
import { patientFlowService } from '@/services/patientFlowService'
import {
  DispensingWebSocket,
  ESP32_RESULT_CODES,
  type DispenseProgressMessage,
} from '@/services/dispensingWebSocket'
import type {
  DispensingState,
  FlowError,
  FlowStage,
  PaymentMethod,
  PaymentResult,
  PrescriptionScenario,
  ScanPreset,
  VerificationResult,
} from '@/types/patient-flow'
import { createDisplayIdentifier } from '@/utils/identifiers'

const paymentMethodsFallback: PaymentMethod[] = [
  {
    id: 'syriatel-cash',
    label: 'سيريتيل كاش',
    description: 'حوّل المبلغ عبر تطبيق سيريتيل كاش إلى رقم المحفظة.',
    icon: 'wallet',
    walletAddress: '0935510789',
  },
  {
    id: 'sham-cash',
    label: 'شام كاش',
    description: 'حوّل المبلغ عبر تطبيق شام كاش إلى رمز المحفظة.',
    icon: 'wallet',
    walletAddress: 'GFYUDS78937EWHIOFUYFEFOFE',
  },
]

function createInitialDispensingState(): DispensingState {
  return {
    status: 'idle',
    message: 'تبدأ شاشة الصرف بعد إتمام التحقق والدفع.',
    currentStepIndex: -1,
    steps: dispensingBlueprint.map((step) => ({
      ...step,
      status: 'pending',
    })),
  }
}

function buildSteps(activeIndex: number, failureIndex?: number, completed = false) {
  return dispensingBlueprint.map((step, index) => {
    if (completed) {
      return { ...step, status: 'completed' as const }
    }

    if (failureIndex === index) {
      return { ...step, status: 'error' as const }
    }

    if (index < activeIndex) {
      return { ...step, status: 'completed' as const }
    }

    if (index === activeIndex) {
      return { ...step, status: 'active' as const }
    }

    return { ...step, status: 'pending' as const }
  })
}

function mapVerificationError(result: VerificationResult): FlowError {
  return {
    kind: 'verification',
    title: 'تعذر اعتماد الوصفة',
    description: result.message,
    retryStage: 'scan',
  }
}

function mapPaymentError(result: PaymentResult): FlowError {
  return {
    kind: 'payment',
    title: result.status === 'cancelled' ? 'تم إلغاء العملية' : 'فشلت عملية الدفع',
    description: result.message,
    retryStage: 'payment',
  }
}

function mapScanError(message: string): FlowError {
  return {
    kind: 'scan',
    title: 'تعذرت قراءة الرمز',
    description: message,
    retryStage: 'scan',
  }
}

function mapDispensingError(message: string): FlowError {
  return {
    kind: 'dispensing',
    title: 'توقفت عملية الصرف',
    description: message,
    retryStage: 'dispensing',
  }
}

interface TabletFlowStoreState {
  sessionId: string
  currentStage: FlowStage
  scanPresets: ScanPreset[]
  paymentMethods: PaymentMethod[]
  selectedPaymentMethodId: string
  activeScenario?: PrescriptionScenario
  /** معرّف العملية لدى السيرفر للتحقق والدفع والصرف */
  activeOperationId?: string
  scanMessage: string
  verificationResult: VerificationResult
  paymentResult: PaymentResult
  dispensingState: DispensingState
  error?: FlowError
  isBusy: boolean
  initialise: () => Promise<void>
  startJourney: () => void
  resetFlow: () => void
  prepareRetry: () => void
  selectPaymentMethod: (paymentMethodId: string) => void
  scanBarcode: (barcode: string) => Promise<boolean>
  verifyActiveScenario: () => Promise<boolean>
  processPayment: () => Promise<boolean>
  runDispensing: () => Promise<boolean>
}

function createInitialState() {
  return {
    sessionId: createDisplayIdentifier('SESSION'),
    currentStage: 'welcome' as FlowStage,
    scanPresets: [] as ScanPreset[],
    paymentMethods: paymentMethodsFallback,
    selectedPaymentMethodId: paymentMethodsFallback[0].id,
    activeScenario: undefined as PrescriptionScenario | undefined,
    activeOperationId: undefined as string | undefined,
    scanMessage:
      'وجّه الباركود أو رمز QR نحو الكاميرا، أو أدخل الرمز يدوياً إذا طُلب منك ذلك.',
    verificationResult: idleVerificationState,
    paymentResult: idlePaymentState,
    dispensingState: createInitialDispensingState(),
    error: undefined as FlowError | undefined,
    isBusy: false,
  }
}

export const useTabletFlowStore = create<TabletFlowStoreState>((set, get) => ({
  ...createInitialState(),
  async initialise() {
    const [scanPresets, paymentMethods] = await Promise.all([
      patientFlowService.getScanPresets(),
      patientFlowService.getPaymentMethods(),
    ])

    set({
      scanPresets,
      paymentMethods,
      selectedPaymentMethodId: paymentMethods[0]?.id ?? paymentMethodsFallback[0].id,
    })
  },
  startJourney() {
    set({
      currentStage: 'scan',
      activeScenario: undefined,
      activeOperationId: undefined,
      verificationResult: idleVerificationState,
      paymentResult: idlePaymentState,
      dispensingState: createInitialDispensingState(),
      error: undefined,
      scanMessage:
        'وجّه الباركود نحو الكاميرا حتى يتم التقاطه تلقائياً.',
    })
  },
  resetFlow() {
    set(createInitialState())
    void get().initialise()
  },
  prepareRetry() {
    const currentError = get().error
    const stage = currentError?.retryStage ?? 'scan'

    set({
      error: undefined,
      isBusy: false,
      currentStage: stage,
      paymentResult: idlePaymentState,
      verificationResult: idleVerificationState,
      dispensingState: createInitialDispensingState(),
      ...(stage === 'scan'
        ? { activeScenario: undefined, activeOperationId: undefined }
        : {}),
    })
  },
  selectPaymentMethod(paymentMethodId) {
    set({ selectedPaymentMethodId: paymentMethodId })
  },
  async scanBarcode(barcode) {
    const trimmed = barcode.trim()
    if (!trimmed) {
      set({
        error: mapScanError('يرجى إدخال رمز صالح أو مسح الباركود.'),
      })
      return false
    }

    set({ isBusy: true, error: undefined })
    const response = await patientFlowService.scanBarcode(trimmed)

    if (response.outcome !== 'valid' || !response.scenario) {
      set({
        isBusy: false,
        error: mapScanError(response.message),
        currentStage: 'scan',
        activeScenario: undefined,
        activeOperationId: undefined,
        scanMessage: response.message,
      })
      return false
    }

    const operationId =
      response.operationId ??
      response.scenario.operationId ??
      response.scenario.id

    set({
      isBusy: false,
      currentStage: 'verification',
      activeScenario: response.scenario,
      activeOperationId: operationId,
      scanMessage: response.message,
      verificationResult: idleVerificationState,
      paymentMethods: response.scenario.paymentMethods?.length
        ? response.scenario.paymentMethods
        : get().paymentMethods,
      selectedPaymentMethodId:
        response.scenario.paymentMethods?.[0]?.id ??
        get().paymentMethods[0]?.id ??
        paymentMethodsFallback[0].id,
      paymentResult: idlePaymentState,
      dispensingState: createInitialDispensingState(),
    })
    return true
  },
  async verifyActiveScenario() {
    const operationId = get().activeOperationId ?? get().activeScenario?.id

    if (!operationId) {
      set({
        error: mapScanError('لا توجد وصفة محملة حالياً. ابدأ القراءة من جديد.'),
      })
      return false
    }

    set({
      isBusy: true,
      verificationResult: {
        status: 'checking',
        badge: 'جارٍ التحقق',
        message: 'يجري الآن التحقق من صلاحية الوصفة وتوفر الأدوية المطلوبة.',
        canContinue: false,
      },
    })

    const result = await patientFlowService.verifyOperation(operationId)
    set({
      isBusy: false,
      verificationResult: result,
      currentStage: 'verification',
      error: result.canContinue ? undefined : mapVerificationError(result),
    })

    return result.canContinue
  },
  async processPayment() {
    const scenario = get().activeScenario
    const operationId = get().activeOperationId ?? scenario?.id

    if (!scenario || !operationId) {
      set({
        error: mapScanError('لا يوجد طلب فعّال لمعالجة الدفع.'),
      })
      return false
    }

    if (!scenario.requiresPayment) {
      set({
        currentStage: 'dispensing',
        paymentResult: {
          status: 'success',
          message: 'الطلب لا يحتاج إلى دفع إضافي.',
          paidAmount: 0,
          receiptId: createDisplayIdentifier('FREE'),
        },
      })
      return true
    }

    set({
      isBusy: true,
      paymentResult: {
        status: 'processing',
        message: 'جارٍ معالجة الدفع...',
        paidAmount: 0,
      },
      error: undefined,
    })

    const result = await patientFlowService.processPayment(
      operationId,
      get().selectedPaymentMethodId,
      appConfig.useMock ? 'success' : undefined,
    )

    set({
      isBusy: false,
      paymentResult: result,
      currentStage: result.status === 'success' ? 'dispensing' : 'payment',
      error: result.status === 'success' ? undefined : mapPaymentError(result),
    })

    return result.status === 'success'
  },
  async runDispensing() {
    const scenario = get().activeScenario
    const operationId = get().activeOperationId ?? scenario?.id

    if (!scenario || !operationId) {
      set({ error: mapScanError('لا يمكن بدء الصرف بدون عملية صالحة.') })
      return false
    }

    set({
      isBusy: true,
      currentStage: 'dispensing',
      error: undefined,
      dispensingState: {
        status: 'running',
        message: 'جاري الاتصال بجهاز الصرف...',
        currentStepIndex: 0,
        steps: buildSteps(0),
      },
    })

    // ─── Map ESP32 step strings to timeline index ────────────────
    const espStepToIndex = (step: DispenseProgressMessage['step']): number => {
      switch (step) {
        case 'cabinet_start':     return 0
        case 'cabinet_done_one':  return 1
        case 'conveyor_start':    return 2
        case 'delivery_done':     return 3
        default:                  return 0
      }
    }

    // ─── Try WebSocket path first (when not in mock mode) ────────
    const wsBase = appConfig.esp32WsUrl
    if (!appConfig.useMock && wsBase) {
      return new Promise<boolean>((resolve) => {
        const dispWs = new DispensingWebSocket(operationId, wsBase)

        dispWs.onProgress((msg) => {
          const idx = espStepToIndex(msg.step)
          set({
            dispensingState: {
              status: 'running',
              message: `الكبينة ${msg.cabinet_id} — المتبقي: ${msg.remaining}`,
              currentStepIndex: idx,
              steps: buildSteps(idx),
            },
          })
        })

        dispWs.onResult((msg) => {
          dispWs.close()

          if (msg.result_code === ESP32_RESULT_CODES.SUCCESS) {
            const pickupCode = createDisplayIdentifier('PK')
            set({
              isBusy: false,
              currentStage: 'success',
              dispensingState: {
                status: 'completed',
                message: 'تم صرف الأدوية بنجاح. يرجى التوجه لفتحة الاستلام.',
                currentStepIndex: dispensingBlueprint.length - 1,
                steps: buildSteps(dispensingBlueprint.length - 1, undefined, true),
                pickupCode,
              },
              error: undefined,
            })
            resolve(true)
          } else {
            const failIdx = Math.min(
              Math.max(get().dispensingState.currentStepIndex, 0),
              dispensingBlueprint.length - 1,
            )
            const errorMsg = msg.message || 'حدثت مشكلة أثناء الصرف.'
            set({
              isBusy: false,
              currentStage: 'dispensing',
              dispensingState: {
                status: 'failed',
                message: errorMsg,
                currentStepIndex: failIdx,
                steps: buildSteps(failIdx, failIdx),
                pickupCode: '',
              },
              error: mapDispensingError(errorMsg),
            })
            resolve(false)
          }
        })

        dispWs.connect()
          .then(() => {
            set({
              dispensingState: {
                ...get().dispensingState,
                message: 'تم الاتصال بالجهاز — جاري إرسال أمر الصرف...',
              },
            })
            dispWs.startDispense()
          })
          .catch(() => {
            dispWs.close()
            // WebSocket failed — fall back to REST
            void _runDispensingRest(operationId, resolve)
          })
      })
    }

    // ─── REST fallback (mock mode or no wsBase) ──────────────────
    return _runDispensingRest(operationId, undefined)

    async function _runDispensingRest(
      opId: string,
      externalResolve?: (v: boolean) => void,
    ): Promise<boolean> {
      let stepIndex = get().dispensingState.currentStepIndex
      let fallbackTimer: ReturnType<typeof setInterval> | undefined

      // Only use old HTTP-poll if esp32BaseUrl is configured
      if (isEsp32Configured()) {
        const applyEspStatus = () => {
          void fetchEsp32Status().then((esp) => {
            if (!esp) return
            const raw = esp.step ?? stepIndex
            const max = dispensingBlueprint.length - 1
            stepIndex = Math.min(Math.max(raw, 0), max)
            set({
              dispensingState: {
                status: 'running',
                message: esp.message ?? get().dispensingState.message,
                currentStepIndex: stepIndex,
                steps: buildSteps(stepIndex),
              },
            })
          })
        }
        applyEspStatus()
        fallbackTimer = setInterval(applyEspStatus, 450)
      } else {
        fallbackTimer = setInterval(() => {
          stepIndex = Math.min(stepIndex + 1, dispensingBlueprint.length - 1)
          set({
            dispensingState: {
              status: 'running',
              message: `تنفيذ الخطوة ${stepIndex + 1} من ${dispensingBlueprint.length}.`,
              currentStepIndex: stepIndex,
              steps: buildSteps(stepIndex),
            },
          })
        }, 550)
      }

      const result = await patientFlowService.dispense(opId)
      clearInterval(fallbackTimer)

      let returnValue: boolean

      if (result.status === 'failed') {
        const failIdx = Math.min(
          Math.max(get().dispensingState.currentStepIndex, 0),
          dispensingBlueprint.length - 1,
        )
        set({
          isBusy: false,
          currentStage: 'dispensing',
          dispensingState: {
            status: 'failed',
            message: result.message,
            currentStepIndex: failIdx,
            steps: buildSteps(failIdx, failIdx),
            pickupCode: result.pickupCode,
            outcome: result.outcome,
          },
          error: mapDispensingError(result.message),
        })
        returnValue = false
      } else {
        set({
          isBusy: false,
          currentStage: result.status === 'completed' ? 'success' : 'dispensing',
          dispensingState: {
            status: result.status,
            message: result.message,
            currentStepIndex: dispensingBlueprint.length - 1,
            steps: buildSteps(dispensingBlueprint.length - 1, undefined, true),
            pickupCode: result.pickupCode,
            transactionId: result.transactionId,
            outcome: result.outcome,
          },
          error: result.status === 'completed' ? undefined : mapDispensingError(result.message),
        })
        returnValue = result.status === 'completed'
      }

      if (externalResolve) externalResolve(returnValue)
      return returnValue
    }
  },
}))
