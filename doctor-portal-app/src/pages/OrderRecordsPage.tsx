import { useEffect, useMemo, useState } from 'react'

import { usePortalLocale } from '@/hooks/usePortalLocale'
import { orderService } from '@/services/orderService'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'
import type { RecentOrder } from '@/types/doctor-portal'
import { formatCurrency, formatDate } from '@/utils/formatters'

function orderStatusClass(status: RecentOrder['status']) {
  if (status === 'completed') return 'bg-success/10 text-success'
  if (status === 'pending') return 'bg-warning/10 text-warning'
  return 'bg-primary-50 text-primary-600'
}

export function OrderRecordsPage() {
  const { currentUser, language } = useDoctorPortalStore()
  const { getOrderStatusLabel, text } = usePortalLocale()
  const [orders, setOrders] = useState<RecentOrder[]>([])

  useEffect(() => {
    if (!currentUser) return

    void (async () => {
      const orderData = await orderService.getRecentOrders(currentUser.id)
      setOrders(orderData)
    })()
  }, [currentUser])

  const summary = useMemo(
    () => ({
      total: orders.length,
      completed: orders.filter((order) => order.status === 'completed').length,
      pending: orders.filter((order) => order.status === 'pending').length,
      value: orders.reduce((sum, order) => sum + order.totalPrice, 0),
    }),
    [orders],
  )

  return (
    <div className="space-y-6">
      <section className="portal-card p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-500">
              {text('سجلات الطلبات', 'Order Records')}
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold text-primary-900">
              {text('آخر الطلبات الخاصة بالطبيب', 'Latest doctor order activity')}
            </h2>
            <p className="mt-4 max-w-3xl leading-8 text-slate-600">
              {text(
                'صفحة مستقلة لمتابعة أحدث الطلبات مع أرقام سريعة تسهّل الوصول إلى حالة التشغيل الحالية.',
                'A dedicated page for recent requests with quick metrics for the current activity stream.',
              )}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="metric-card">
              <p className="text-sm font-semibold text-slate-400">{text('إجمالي الطلبات', 'Total Orders')}</p>
              <p className="mt-3 text-3xl font-bold text-primary-900">{summary.total}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm font-semibold text-slate-400">{text('مكتملة', 'Completed')}</p>
              <p className="mt-3 text-3xl font-bold text-primary-900">{summary.completed}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm font-semibold text-slate-400">{text('معلقة', 'Pending')}</p>
              <p className="mt-3 text-3xl font-bold text-primary-900">{summary.pending}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm font-semibold text-slate-400">{text('القيمة الإجمالية', 'Total Value')}</p>
              <p className="mt-3 text-2xl font-bold text-primary-900">
                {formatCurrency(summary.value, language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="portal-card p-8">
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="soft-panel p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-bold text-primary-900">{order.id}</p>
                  <p className="mt-2 text-sm text-slate-500">{formatDate(order.createdAt, language)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${orderStatusClass(order.status)}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <span className="glass-chip px-3 py-1.5 text-sm font-semibold text-primary-700">
                    {order.itemCount} {text('عناصر', 'items')}
                  </span>
                  <span className="text-lg font-bold text-primary-900">
                    {formatCurrency(order.totalPrice, language)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
