import axios from 'axios'

import { appConfig } from '@/config/appConfig'
import { readAuthToken, writeAdminSession, writeAuthToken } from '@/utils/storage'

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 12000,
})

apiClient.interceptors.request.use((config) => {
  const token = readAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    if (status === 401 && typeof window !== 'undefined') {
      writeAuthToken(null)
      writeAdminSession(null)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)
