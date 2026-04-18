import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import { mockDoctorSignupRequests } from '@/mocks/data/adminData'
import type { DoctorSignupRequestRecord } from '@/types/admin'
import { delay } from '@/utils/delay'

/**
 * Read gateway for doctor signup requests submitted from the doctor portal.
 * Later this service can be expanded with approve/reject endpoints without
 * changing the page contract.
 */
export interface DoctorSignupRequestService {
  getDoctorSignupRequests: () => Promise<DoctorSignupRequestRecord[]>
}

const mockDoctorSignupRequestService: DoctorSignupRequestService = {
  async getDoctorSignupRequests() {
    await delay(260)
    return mockDoctorSignupRequests
  },
}

const apiDoctorSignupRequestService: DoctorSignupRequestService = {
  async getDoctorSignupRequests() {
    const response = await apiClient.get<{ requests: DoctorSignupRequestRecord[] }>('/admin/doctor-signup-requests')
    return response.data.requests ?? []
  },
}

export const doctorSignupRequestService = appConfig.useMock
  ? mockDoctorSignupRequestService
  : apiDoctorSignupRequestService
