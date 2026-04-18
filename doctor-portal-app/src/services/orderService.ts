import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import { mockRecentOrders } from '@/mocks/data/orders'
import type { CartItem, CheckoutResult, RecentOrder } from '@/types/doctor-portal'
import { delay } from '@/utils/delay'

export interface SubmitOrderPayload {
  doctorId: string
  items: Array<{ drugId: string; quantity: number; unitPrice: number }>
  totalPrice: number
}

export interface OrderService {
  getRecentOrders: (doctorId?: string) => Promise<RecentOrder[]>
  submitOrder: (payload: SubmitOrderPayload) => Promise<CheckoutResult>
}

let mockOrderCounter = 9000

const mockOrderService: OrderService = {
  async getRecentOrders(doctorId) {
    await delay(350)
    return doctorId
      ? mockRecentOrders.filter((order) => order.doctorId === doctorId)
      : mockRecentOrders
  },
  async submitOrder(payload) {
    await delay(800)
    mockOrderCounter += 1
    return {
      orderId: mockOrderCounter,
      operationId: `OP-${mockOrderCounter}`,
      totalPrice: payload.totalPrice,
      itemCount: payload.items.length,
      createdAt: new Date().toISOString(),
    }
  },
}

const apiOrderService: OrderService = {
  async getRecentOrders(doctorId) {
    const response = await apiClient.get<RecentOrder[]>('/doctor/orders/recent', {
      params: { doctorId },
    })
    return response.data
  },
  async submitOrder(payload) {
    const response = await apiClient.post<CheckoutResult>('/doctor/orders/checkout', payload)
    return response.data
  },
}

/**
 * Order facade used by the dashboard, order records, and checkout.
 */
export const orderService = appConfig.useMock ? mockOrderService : apiOrderService

/**
 * Builds a SubmitOrderPayload from the current cart and doctor session.
 */
export function buildCheckoutPayload(doctorId: string, cart: CartItem[]): SubmitOrderPayload {
  return {
    doctorId,
    items: cart.map((item) => ({
      drugId: item.drug.id,
      quantity: item.quantity,
      unitPrice: item.drug.price,
    })),
    totalPrice: cart.reduce((sum, item) => sum + item.drug.price * item.quantity, 0),
  }
}
