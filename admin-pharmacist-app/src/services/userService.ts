import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import { mockDoctors } from '@/mocks/data/adminData'
import type { DoctorRecord } from '@/types/admin'
import { delay } from '@/utils/delay'

const mockUserService = {
  async getDoctors(): Promise<DoctorRecord[]> {
    await delay(260)
    return mockDoctors
  },
}

const apiUserService = {
  async getDoctors(): Promise<DoctorRecord[]> {
    const response = await apiClient.get<{ doctors: DoctorRecord[] }>('/admin/users/doctors')
    return response.data.doctors ?? []
  },
}

/**
 * User gateway for doctor and assistant account records.
 */
export const userService = appConfig.useMock ? mockUserService : apiUserService
