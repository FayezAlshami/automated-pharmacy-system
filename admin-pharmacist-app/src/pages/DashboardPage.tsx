import {
  CircleAlert,
  PillBottle,
  ShoppingBag,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { MetricCard } from '@/components/common/MetricCard'
import { PageHero } from '@/components/common/PageHero'
import { Skeleton } from '@/components/common/Skeleton'
import { StatusPill } from '@/components/common/StatusPill'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { dashboardService } from '@/services/dashboardService'
import { useAdminStore } from '@/store/useAdminStore'
import type { DashboardStats } from '@/types/admin'
import { formatCurrency, formatDate } from '@/utils/formatters'

export function DashboardPage() {
  const { drugs, orders } = useAdminStore()
  const { text } = useAdminLocale()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    void (async () => {
      const nextStats = await dashboardService.getStats(drugs, orders)
      setStats(nextStats)
    })()
  }, [drugs, orders])

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slateAdmin-200 bg-white p-8 shadow-dashboard">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-10 w-3/4 max-w-md" />
          <Skeleton className="mt-3 h-4 w-full max-w-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <div key={key} className="rounded-2xl border border-slateAdmin-200 bg-white p-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-4 h-12 w-20" />
              <Skeleton className="mt-3 h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const lowStockDrugs = drugs.filter((drug) => drug.amount < 10).slice(0, 6)
  const recentOrders = orders.slice(0, 6)

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow={text('العمليات', 'Operations')}
        title={text('لوحة المتابعة', 'Operations dashboard')}
        description={text(
          'ملخص المخزون والطلبات والحالات الحرجة في لمحة واحدة.',
          'Stock, orders, and critical statuses at a glance.',
        )}
        meta={
          <>
            <span className="inline-flex items-center rounded-full border border-slateAdmin-200 bg-slateAdmin-50 px-3 py-1.5 text-xs font-medium text-slateAdmin-700">
              {text('الأدوية', 'Drugs')}: {stats.totalDrugs}
            </span>
            <span className="inline-flex items-center rounded-full border border-slateAdmin-200 bg-slateAdmin-50 px-3 py-1.5 text-xs font-medium text-slateAdmin-700">
              {text('الطلبات', 'Orders')}: {stats.totalOrders}
            </span>
            <span className="inline-flex items-center rounded-full border border-slateAdmin-200 bg-slateAdmin-50 px-3 py-1.5 text-xs font-medium text-slateAdmin-700">
              {text('مخزون منخفض', 'Low stock')}: {stats.lowStock}
            </span>
          </>
        }
      />

      <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          accent="highlight"
          label={text('عدد الأدوية', 'Drugs')}
          value={stats.totalDrugs}
          helper={text('الأصناف المسجلة في النظام.', 'Line items registered in the system.')}
          icon={<PillBottle className="h-6 w-6" />}
        />
        <MetricCard
          label={text('الطلبات', 'Orders')}
          value={stats.totalOrders}
          helper={text('إجمالي الطلبات في الدورة الحالية.', 'Total orders in the current cycle.')}
          icon={<ShoppingBag className="h-6 w-6" />}
        />
        <MetricCard
          label={text('معلّقة', 'Pending')}
          value={stats.pendingOrders}
          helper={text('بانتظار المعالجة أو تحديث الحالة.', 'Awaiting processing or status update.')}
          icon={<WalletCards className="h-6 w-6" />}
        />
        <MetricCard
          label={text('مخزون منخفض', 'Low stock')}
          value={stats.lowStock}
          helper={text('أصناف عند أو تحت حد التنبيه.', 'Items at or below the alert threshold.')}
          icon={<CircleAlert className="h-6 w-6" />}
        />
        <MetricCard
          label={text('ناجحة', 'Successful')}
          value={stats.successfulOrders}
          helper={text('طلبات اكتملت بنجاح.', 'Orders completed successfully.')}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <MetricCard
          label={text('مرفوضة', 'Rejected')}
          value={stats.failedOrders}
          helper={text('طلبات لم تُكتمل.', 'Orders that did not complete.')}
          icon={<Users className="h-6 w-6" />}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <motion.div
          className="rounded-[28px] border border-slateAdmin-200 bg-white p-6 shadow-[0_8px_40px_rgba(26,42,58,0.06)] sm:p-8"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slateAdmin-400">
                {text('تنبيهات', 'Alerts')}
              </p>
              <h3 className="mt-2 text-xl font-bold text-slateAdmin-950">
                {text('مخزون منخفض', 'Low stock')}
              </h3>
            </div>
            <span className="rounded-full border border-slateAdmin-200 bg-slateAdmin-50 px-3 py-1 text-xs font-medium text-slateAdmin-600">
              {text('أولوية', 'Priority')}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {lowStockDrugs.map((drug) => (
              <div
                key={drug.drug_id}
                className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50/50 p-4 transition hover:border-brandSecondary/30"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slateAdmin-950">{drug.dname}</p>
                    <p className="mt-1 text-sm text-slateAdmin-500">
                      {drug.machine_column} • {drug.pin}
                    </p>
                  </div>
                  <StatusPill
                    tone={drug.amount === 0 ? 'danger' : 'warning'}
                    label={
                      drug.amount === 0
                        ? text('نفد', 'Out')
                        : text(`متبقي ${drug.amount}`, `${drug.amount} left`)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="rounded-[28px] border border-slateAdmin-200 bg-white p-6 shadow-[0_8px_40px_rgba(26,42,58,0.06)] sm:p-8"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slateAdmin-400">
                {text('الطلبات', 'Orders')}
              </p>
              <h3 className="mt-2 text-xl font-bold text-slateAdmin-950">
                {text('آخر الطلبات', 'Recent orders')}
              </h3>
            </div>
            <span className="rounded-full border border-slateAdmin-200 bg-slateAdmin-50 px-3 py-1 text-xs font-medium text-slateAdmin-600">
              {text('حديث', 'Latest')}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.order_id}
                className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50/50 p-4 transition hover:border-brandSecondary/30"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slateAdmin-950">{order.order_id}</p>
                    <p className="mt-1 text-sm text-slateAdmin-500">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill
                      tone={
                        order.status === 'success'
                          ? 'success'
                          : order.status === 'pending'
                            ? 'warning'
                            : 'danger'
                      }
                      label={
                        order.status === 'success'
                          ? text('ناجح', 'OK')
                          : order.status === 'pending'
                            ? text('معلّق', 'Pending')
                            : text('مرفوض', 'Rejected')
                      }
                    />
                    <p className="font-bold tabular-nums text-slateAdmin-950">
                      {formatCurrency(order.total_price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
