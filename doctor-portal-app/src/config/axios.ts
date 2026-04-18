import axios from 'axios'

import { appConfig } from '@/config/appConfig'

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 12000,
})
