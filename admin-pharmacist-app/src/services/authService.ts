import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import { mockAdminUsers } from '@/mocks/data/adminData'
import type { AdminSessionUser } from '@/types/admin'
import { getAxiosDetailMessage } from '@/utils/apiError'
import { delay } from '@/utils/delay'
import { writeAuthToken } from '@/utils/storage'

/**
 * Authentication contract for admin and pharmacist access.
 */
export interface AuthService {
  login: (email: string, password: string) => Promise<AdminSessionUser>
  getUserById: (userId: string) => Promise<AdminSessionUser | undefined>
}

/** API may return JWT alongside user fields. */
type LoginResponseBody = AdminSessionUser & {
  accessToken?: string
  token?: string
}

function mapLoginResponse(data: LoginResponseBody): AdminSessionUser {
  const { accessToken, token, ...rest } = data
  const bearer = accessToken ?? token
  if (typeof bearer === 'string' && bearer.length > 0) {
    writeAuthToken(bearer)
  }
  return {
    id: rest.id,
    name: rest.name,
    email: rest.email,
    role: rest.role,
    password: rest.password,
  }
}

const mockAuthService: AuthService = {
  async login(email, password) {
    await delay(700)
    const user = mockAdminUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.toLowerCase() &&
        candidate.password === password,
    )

    if (!user) {
      throw new Error('بيانات الدخول غير صحيحة.')
    }

    return user
  },
  async getUserById(userId) {
    await delay(180)
    return mockAdminUsers.find((user) => user.id === userId)
  },
}

const apiAuthService: AuthService = {
  async login(email, password) {
    try {
      const response = await apiClient.post<LoginResponseBody>('/admin/auth/login', {
        email,
        password,
      })
      return mapLoginResponse(response.data)
    } catch (e) {
      throw new Error(
        getAxiosDetailMessage(e, 'بيانات تسجيل الدخول غير صحيحة أو لا يوجد صلاحية وصول.'),
      )
    }
  },
  async getUserById(userId) {
    try {
      const response = await apiClient.get<AdminSessionUser>(`/admin/auth/users/${userId}`)
      return response.data
    } catch {
      return undefined
    }
  },
}

/**
 * Runtime-selected authentication gateway used by the login page and store.
 */
export const authService = appConfig.useMock ? mockAuthService : apiAuthService
