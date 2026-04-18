import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import {
  createDispensingResult,
  createPaymentResult,
  createScanResponse,
  createVerificationResult,
  findScenarioForOperation,
  getMockPaymentMethods,
  getMockScanPresets,
} from '@/mocks/handlers/patientFlowHandlers'
import type {
  DispensingResult,
  PaymentMethod,
  PaymentResult,
  PaymentSimulationOutcome,
  ScanPreset,
  ScanResponse,
  VerificationResult,
} from '@/types/patient-flow'
import { delay } from '@/utils/delay'

export interface PatientFlowService {
  getScanPresets: () => Promise<ScanPreset[]>
  getPaymentMethods: () => Promise<PaymentMethod[]>
  scanBarcode: (barcode: string) => Promise<ScanResponse>
  verifyOperation: (operationId: string) => Promise<VerificationResult>
  processPayment: (
    operationId: string,
    paymentMethodId: string,
    mockOutcome?: PaymentSimulationOutcome,
  ) => Promise<PaymentResult>
  dispense: (operationId: string) => Promise<DispensingResult>
}

const mockPatientFlowService: PatientFlowService = {
  async getScanPresets() {
    await delay(200)
    return getMockScanPresets()
  },
  async getPaymentMethods() {
    await delay(120)
    return getMockPaymentMethods()
  },
  async scanBarcode(barcode) {
    await delay(850)
    return createScanResponse(barcode)
  },
  async verifyOperation(operationId) {
    await delay(1400)
    const scenario = findScenarioForOperation(operationId)

    if (!scenario) {
      return {
        status: 'unavailable',
        badge: 'غير معروف',
        message: 'تعذر العثور على العملية المطلوبة.',
        canContinue: false,
      }
    }

    return createVerificationResult(scenario)
  },
  async processPayment(operationId, paymentMethodId, mockOutcome = 'success') {
    await delay(1200)
    const scenario = findScenarioForOperation(operationId)

    if (!scenario) {
      return {
        status: 'failed',
        message: 'لم يتم العثور على الطلب المراد تسديده.',
        paidAmount: 0,
      }
    }

    void paymentMethodId
    return createPaymentResult(scenario, mockOutcome)
  },
  async dispense(operationId) {
    await delay(650)
    const scenario = findScenarioForOperation(operationId)

    if (!scenario) {
      return {
        status: 'failed',
        outcome: 'sensor_fail',
        message: 'تعذر تحميل تفاصيل الصرف لهذه العملية.',
        pickupCode: 'SUP-ERROR',
      }
    }

    return createDispensingResult(scenario)
  },
}

const apiPatientFlowService: PatientFlowService = {
  async getScanPresets() {
    const response = await apiClient.get<ScanPreset[]>('/tablet/scan-presets')
    return response.data
  },
  async getPaymentMethods() {
    const response = await apiClient.get<PaymentMethod[]>('/tablet/payment-methods')
    return response.data
  },
  async scanBarcode(barcode) {
    const response = await apiClient.post<ScanResponse>('/tablet/scan', { barcode })
    return response.data
  },
  async verifyOperation(operationId) {
    const response = await apiClient.post<VerificationResult>('/tablet/verify', {
      operationId,
    })
    return response.data
  },
  async processPayment(operationId, paymentMethodId, _mockOutcome) {
    void _mockOutcome
    const response = await apiClient.post<PaymentResult>('/tablet/payment', {
      operationId,
      paymentMethodId,
    })
    return response.data
  },
  async dispense(operationId) {
    const response = await apiClient.post<DispensingResult>('/tablet/dispense', {
      operationId,
    })
    return response.data
  },
}

export const patientFlowService = appConfig.useMock
  ? mockPatientFlowService
  : apiPatientFlowService
