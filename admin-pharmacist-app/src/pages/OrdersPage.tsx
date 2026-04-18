import { Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { DataTable, TableEmptyState } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { PageHero } from '@/components/common/PageHero'
import { StatusPill } from '@/components/common/StatusPill'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { matchesSearchQuery } from '@/utils/search'

export function OrdersPage() {
  const { orders, doctors, orderDetails, drugs, updateOrderStatus } = useAdminStore()
  const { text } = useAdminLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'rejected' | 'review'>(
    'all',
  )
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const statusLabels: Record<string, string> = {
    pending: text('معلّقة', 'Pending'),
    success: text('ناجحة', 'Successful'),
    rejected: text('مرفوضة', 'Rejected'),
    review: text('قيد المراجعة', 'Under Review'),
  }

  const doctorMap = new Map(doctors.map((doctor) => [doctor.doctor_id, doctor]))
  const drugMap = new Map(drugs.map((drug) => [drug.drug_id, drug]))

  const filteredOrders = orders.filter((order) => {
    const doctor = doctorMap.get(order.doctor_id)
    const details = orderDetails.filter((detail) => detail.order_id === order.order_id)
    const drugNames = details.map((detail) => drugMap.get(detail.drug_id)?.dname ?? detail.drug_id)

    const matchesSearch = matchesSearchQuery(search, [
      order.order_id,
      doctor?.fname,
      statusLabels[order.status],
      order.is_pay ? text('مدفوع', 'Paid') : text('غير مدفوع', 'Unpaid'),
      order.total_price,
      formatCurrency(order.total_price),
      formatDate(order.created_at),
      drugNames.join(' '),
    ])

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const selectedOrder = orders.find((order) => order.order_id === selectedOrderId)

  const tableColumns = [
    { key: 'order', label: text('رقم الطلب', 'Order ID') },
    { key: 'doctor', label: text('الطبيب', 'Doctor') },
    { key: 'payment', label: text('الدفع', 'Payment') },
    { key: 'status', label: text('الحالة', 'Status') },
    { key: 'total', label: text('الإجمالي', 'Total') },
    { key: 'created', label: text('التاريخ', 'Date') },
    { key: 'actions', label: text('إجراءات', 'Actions') },
  ]

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={text('مراقبة الطلبات', 'Orders Monitoring')}
        title={text('إدارة الطلبات', 'Orders Management')}
        description={text(
          'لوحة متابعة أوضح لحالة كل طلب مع بحث موسّع، فلترة سريعة، وإظهار أفضل للعناصر والحالة المالية.',
          'A clearer order-monitoring view with expanded search, quick filtering, and improved visibility for items and payment state.',
        )}
        meta={
          <>
            <span className="summary-chip">
              {text('إجمالي الطلبات', 'Total Orders')}: {orders.length}
            </span>
            <span className="summary-chip">
              {text('الطلبات المعلّقة', 'Pending Orders')}:{' '}
              {orders.filter((order) => order.status === 'pending').length}
            </span>
            <span className="summary-chip">
              {text('نتائج العرض', 'Visible Results')}: {filteredOrders.length}
            </span>
          </>
        }
      />

      <section className="toolbar-panel">
        <div className="grid gap-4 lg:grid-cols-[1.45fr_0.75fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slateAdmin-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text(
                'ابحث برقم الطلب أو الطبيب أو الأدوية أو الحالة أو المبلغ',
                'Search by order ID, doctor, drugs, status, or total',
              )}
              className="field-input pr-12"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="field-select"
          >
            <option value="all">{text('كل الحالات', 'All Statuses')}</option>
            <option value="pending">{text('معلّقة', 'Pending')}</option>
            <option value="success">{text('ناجحة', 'Successful')}</option>
            <option value="rejected">{text('مرفوضة', 'Rejected')}</option>
            <option value="review">{text('قيد المراجعة', 'Under Review')}</option>
          </select>
        </div>
      </section>

      <DataTable columns={tableColumns} minWidthClassName="min-w-[1140px]">
        {filteredOrders.length === 0 ? (
          <TableEmptyState
            colSpan={tableColumns.length}
            title={text('لا توجد طلبات مطابقة', 'No matching orders')}
            description={text(
              'جرّب تعديل البحث أو الفلتر لعرض طلبات أخرى.',
              'Try changing the search term or filter to display other orders.',
            )}
          />
        ) : (
          filteredOrders.map((order) => {
            const doctor = doctorMap.get(order.doctor_id)
            const tone =
              order.status === 'success'
                ? 'success'
                : order.status === 'pending'
                  ? 'warning'
                  : order.status === 'review'
                    ? 'neutral'
                    : 'danger'

            return (
              <tr key={order.order_id}>
                <td>
                  <div className="space-y-1">
                    <p className="font-bold text-slateAdmin-950">{order.order_id}</p>
                    <p className="text-xs text-slateAdmin-500">
                      {orderDetails.filter((detail) => detail.order_id === order.order_id).length}{' '}
                      {text('عناصر', 'items')}
                    </p>
                  </div>
                </td>
                <td>
                  <p className="font-semibold text-slateAdmin-900">{doctor?.fname ?? '-'}</p>
                  <p className="mt-1 text-xs text-slateAdmin-500">
                    {doctor?.email ?? text('لا يوجد بريد', 'No email')}
                  </p>
                </td>
                <td>
                  <StatusPill
                    tone={order.is_pay ? 'success' : 'warning'}
                    label={order.is_pay ? text('مدفوع', 'Paid') : text('غير مدفوع', 'Unpaid')}
                  />
                </td>
                <td>
                  <StatusPill tone={tone} label={statusLabels[order.status]} />
                </td>
                <td>
                  <p className="font-bold text-slateAdmin-950">{formatCurrency(order.total_price)}</p>
                </td>
                <td>
                  <p className="font-semibold text-slateAdmin-900">{formatDate(order.created_at)}</p>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateOrderStatus(order.order_id, event.target.value as typeof order.status)
                      }
                      className="field-select h-11 min-w-[150px] px-3 py-0 text-sm"
                    >
                      <option value="pending">{text('معلّقة', 'Pending')}</option>
                      <option value="success">{text('ناجحة', 'Successful')}</option>
                      <option value="rejected">{text('مرفوضة', 'Rejected')}</option>
                      <option value="review">{text('قيد المراجعة', 'Under Review')}</option>
                    </select>
                    <button
                      className="button-secondary px-4 py-2.5 text-sm"
                      onClick={() => setSelectedOrderId(order.order_id)}
                      type="button"
                    >
                      {text('تفاصيل', 'Details')}
                    </button>
                    <Link
                      to={`/app/details/order/${order.order_id}`}
                      className="button-secondary px-4 py-2.5 text-sm"
                    >
                      {text('صفحة التفاصيل', 'Details Page')}
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })
        )}
      </DataTable>

      <Modal
        open={Boolean(selectedOrder)}
        title={text('تفاصيل الطلب', 'Order Details')}
        onClose={() => setSelectedOrderId(null)}
      >
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('رقم الطلب', 'Order ID')}</p>
                <p className="mt-2 text-xl font-bold text-slateAdmin-950">{selectedOrder.order_id}</p>
              </div>
              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('التاريخ', 'Date')}</p>
                <p className="mt-2 text-xl font-bold text-slateAdmin-950">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('الإجمالي', 'Total')}</p>
                <p className="mt-2 text-xl font-bold text-slateAdmin-950">
                  {formatCurrency(selectedOrder.total_price)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {orderDetails
                .filter((detail) => detail.order_id === selectedOrder.order_id)
                .map((detail) => (
                  <div key={detail.order_detail_id} className="dashboard-panel p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3 text-slateAdmin-700">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slateAdmin-950">
                            {drugMap.get(detail.drug_id)?.dname ?? detail.drug_id}
                          </p>
                          <p className="mt-1 text-sm text-slateAdmin-500">
                            {text('عدد العبوات', 'Units')}: {detail.number_of_drug}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-slateAdmin-950">
                        {formatCurrency(detail.price_of_one_drug)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
