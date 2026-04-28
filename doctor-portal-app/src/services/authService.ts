import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import { mockDoctorAccounts } from '@/mocks/data/auth'
import type { AuthPayload, DoctorAccount, SignupPayload } from '@/types/doctor-portal'
import { getAxiosDetailMessage } from '@/utils/apiError'
import { delay } from '@/utils/delay'

/**
 * Defines the authentication contract that both mock and real API
 * implementations must satisfy.
 */
export interface AuthService {
  signIn: (payload: AuthPayload) => Promise<DoctorAccount>
  signUp: (payload: SignupPayload) => Promise<DoctorAccount>
  getDoctorById: (doctorId: string) => Promise<DoctorAccount | undefined>
}

const mockAuthService: AuthService = {
  async signIn(payload) {
    await delay(800)
    const doctor = mockDoctorAccounts.find(
      (candidate) =>
        candidate.email.toLowerCase() === payload.email.toLowerCase() &&
        candidate.password === payload.password,
    )

    if (!doctor) {
      throw new Error('INVALID_CREDENTIALS')
    }

    return doctor
  },
  async signUp(payload) {
    await delay(950)
    const emailExists = mockDoctorAccounts.some(
      (candidate) => candidate.email.toLowerCase() === payload.email.toLowerCase(),
    )
    const phoneExists = mockDoctorAccounts.some((candidate) => candidate.phone === payload.phone)

    if (emailExists) {
      throw new Error('EMAIL_EXISTS')
    }
    if (phoneExists) {
      throw new Error('PHONE_EXISTS')
    }

    return {
      id: 'doc-signup-demo',
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      specialty: payload.specialty,
      phone: payload.phone,
      clinicName: payload.clinicName,
      licenseNumber: 'MED-DEMO',
      role: 'doctor',
      joinedAt: new Date().toISOString(),
    }
  },
  async getDoctorById(doctorId) {
    await delay(250)
    return mockDoctorAccounts.find((doctor) => doctor.id === doctorId)
  },
}

const apiAuthService: AuthService = {
  async signIn(payload) {
    try {
      const response = await apiClient.post<DoctorAccount>('/doctor/auth/login', payload)
      return response.data
    } catch (e) {
      throw new Error(getAxiosDetailMessage(e, 'فشل تسجيل الدخول.'))
    }
  },
  async signUp(payload) {
    try {
      const response = await apiClient.post<DoctorAccount>('/doctor/auth/register', payload)
      return response.data
    } catch (e) {
      const msg = getAxiosDetailMessage(e, 'فشل إنشاء الحساب.')
      if (e && typeof e === 'object' && 'response' in e) {
        const status = (e as { response?: { status?: number } }).response?.status
        if (status === 409) {
          if (msg.includes('الهاتف') || msg.toLowerCase().includes('phone')) {
            throw new Error('PHONE_EXISTS')
          }
          throw new Error('EMAIL_EXISTS')
        }
      }
      throw new Error(msg)
    }
  },
  async getDoctorById(doctorId) {
    try {
      const response = await apiClient.get<DoctorAccount>(`/doctor/profile/${doctorId}`)
      return response.data
    } catch {
      return undefined
    }
  },
}

/**
 * Public authentication entry point selected at runtime according to
 * the current environment configuration.
 */
export const authService = appConfig.useMock ? mockAuthService : apiAuthService
