import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import type { DashboardStats, DrugRecord, OrderRecord } from '@/types/admin'

/**
 * Derives dashboard metrics from locally available data while the app
 * is still running in mock mode.
 */
function computeStats(drugs: DrugRecord[], orders: OrderRecord[]): DashboardStats {
  return {
    totalDrugs: drugs.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    lowStock: drugs.filter((drug) => drug.amount < 10).length,
    successfulOrders: orders.filter((order) => order.status === 'success').length,
    failedOrders: orders.filter((order) => order.status === 'rejected').length,
  }
}

/**
 * Dashboard metrics: mock mode computes from store data; API mode calls the server.
 */
export const dashboardService = {
  async getStats(drugs: DrugRecord[], orders: OrderRecord[]): Promise<DashboardStats> {
    if (appConfig.useMock) {
      return computeStats(drugs, orders)
    }
    const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats')
    return response.data
  },
}
