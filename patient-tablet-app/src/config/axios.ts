import axios from 'axios'

import { appConfig } from '@/config/appConfig'

/**
 * عميل Axios موحد للتبديل لاحقاً إلى الربط الحقيقي مع الـ Back-End.
 */
export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 12000,
})
