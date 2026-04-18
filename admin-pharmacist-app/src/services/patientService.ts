import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import { mockPatients } from '@/mocks/data/adminData'
import type { CompanyPatientRecord } from '@/types/admin'
import { delay } from '@/utils/delay'

const mockPatientService = {
  async getPatients(): Promise<CompanyPatientRecord[]> {
    await delay(260)
    return mockPatients
  },
}

const apiPatientService = {
  async getPatients(): Promise<CompanyPatientRecord[]> {
    const response = await apiClient.get<{ patients: CompanyPatientRecord[] }>('/admin/patients')
    return response.data.patients ?? []
  },
}

/**
 * Patient data provider used by the beneficiaries screen.
 */
export const patientService = appConfig.useMock ? mockPatientService : apiPatientService
