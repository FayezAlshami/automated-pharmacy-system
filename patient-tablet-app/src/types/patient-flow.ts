export type FlowStage =
  | 'welcome'
  | 'scan'
  | 'verification'
  | 'payment'
  | 'dispensing'
  | 'success'
  | 'error'

export type ScanOutcome = 'valid' | 'invalid' | 'unreadable'
export type PrescriptionLifecycleStatus = 'valid' | 'expired' | 'used' | 'unavailable'
export type VerificationStatus = 'idle' | 'checking' | 'verified' | 'expired' | 'used' | 'unavailable'
export type PaymentSimulationOutcome = 'success' | 'failed' | 'cancelled'
export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'cancelled'
export type DispensingOutcome = 'success' | 'mechanical_error' | 'timeout' | 'sensor_fail'
export type DispensingStatus = 'idle' | 'running' | 'completed' | 'failed'
export type TimelineState = 'pending' | 'active' | 'completed' | 'error'
export type ErrorKind = 'scan' | 'verification' | 'payment' | 'dispensing'

/**
 * يمثل دواءً واحداً في الوصفة أو في ملخص الطلب.
 */
export interface MedicationItem {
  id: string
  name: string
  dosage: string
  manufacturer: string
  quantity: number
  price: number
  availability: 'available' | 'low' | 'out'
}

/**
 * طرق الدفع المعروضة للمستخدم في الواجهة.
 */
export interface PaymentMethod {
  id: string
  label: string
  description: string
  icon: 'card' | 'wallet' | 'shield'
  walletAddress?: string
}

/**
 * بيانات الوصفة والطلب كما تعيدها الخدمة بعد المسح.
 */
export interface PrescriptionScenario {
  id: string
  code: string
  label: string
  patientName: string
  patientId: string
  physicianName: string
  operationId: string
  insuranceProvider: string
  coverageNote: string
  notes: string
  scanOutcome: ScanOutcome
  prescriptionStatus: PrescriptionLifecycleStatus
  requiresPayment: boolean
  paymentAmount: number
  estimatedWaitMinutes: number
  dispensingOutcome: DispensingOutcome
  items: MedicationItem[]
  paymentMethods?: PaymentMethod[]
}

/** بطاقة اختيار سريع في وضع التطوير (مسار mock فقط). */
export interface ScanPreset {
  id: string
  title: string
  description: string
  scenarioId: string
  tone: 'primary' | 'warning' | 'danger' | 'neutral'
}

export interface ScanResponse {
  outcome: ScanOutcome
  message: string
  scenario?: PrescriptionScenario
  /** معرّف العملية لدى السيرفر للتحقق والدفع والصرف */
  operationId?: string
}

export interface VerificationResult {
  status: VerificationStatus
  badge: string
  message: string
  canContinue: boolean
}

export interface PaymentResult {
  status: PaymentStatus
  message: string
  paidAmount: number
  receiptId?: string
}

/**
 * خطوة واحدة ضمن الـ timeline الخاص بعملية الصرف.
 */
export interface DispensingStep {
  id: string
  title: string
  description: string
  status: TimelineState
}

export interface DispensingState {
  status: DispensingStatus
  message: string
  currentStepIndex: number
  steps: DispensingStep[]
  pickupCode?: string
  transactionId?: string
  outcome?: DispensingOutcome
}

export interface DispensingResult {
  status: DispensingStatus
  outcome: DispensingOutcome
  message: string
  pickupCode: string
  transactionId?: string
}

export interface FlowError {
  kind: ErrorKind
  title: string
  description: string
  retryStage: FlowStage
}
