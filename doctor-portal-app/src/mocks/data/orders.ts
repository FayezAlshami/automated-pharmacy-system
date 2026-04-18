import type { RecentOrder } from '@/types/doctor-portal'

export const mockRecentOrders: RecentOrder[] = [
  {
    id: 'ORD-9001',
    doctorId: 'doc-01',
    createdAt: '2026-03-22T09:30:00',
    status: 'completed',
    totalPrice: 154000,
    itemCount: 4,
  },
  {
    id: 'ORD-9002',
    doctorId: 'doc-01',
    createdAt: '2026-03-21T13:15:00',
    status: 'pending',
    totalPrice: 92000,
    itemCount: 2,
  },
  {
    id: 'ORD-9003',
    doctorId: 'doc-02',
    createdAt: '2026-03-20T10:10:00',
    status: 'review',
    totalPrice: 118000,
    itemCount: 3,
  },
  {
    id: 'ORD-9004',
    doctorId: 'doc-03',
    createdAt: '2026-03-19T15:45:00',
    status: 'completed',
    totalPrice: 173000,
    itemCount: 5,
  },
  {
    id: 'ORD-9005',
    doctorId: 'doc-04',
    createdAt: '2026-03-18T11:05:00',
    status: 'completed',
    totalPrice: 48000,
    itemCount: 1,
  },
  {
    id: 'ORD-9006',
    doctorId: 'doc-02',
    createdAt: '2026-03-17T16:20:00',
    status: 'pending',
    totalPrice: 87000,
    itemCount: 2,
  },
]
