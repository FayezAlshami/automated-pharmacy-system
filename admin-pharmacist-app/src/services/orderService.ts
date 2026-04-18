import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import { mockOrderDetails, mockOrders } from '@/mocks/data/adminData'
import type { OrderDetailRecord, OrderRecord } from '@/types/admin'
import { delay } from '@/utils/delay'

/**
 * Bundle of order headers and their detail lines.
 */
export interface OrderBundle {
  orders: OrderRecord[]
  orderDetails: OrderDetailRecord[]
}

const mockOrderService = {
  async getOrderBundle(): Promise<OrderBundle> {
    await delay(320)
    return {
      orders: mockOrders,
      orderDetails: mockOrderDetails,
    }
  },
}

const apiOrderService = {
  async getOrderBundle(): Promise<OrderBundle> {
    const response = await apiClient.get<OrderBundle>('/admin/orders/bootstrap')
    return response.data
  },
}

/**
 * Order gateway used during initial dashboard hydration.
 */
export const orderService = appConfig.useMock ? mockOrderService : apiOrderService
