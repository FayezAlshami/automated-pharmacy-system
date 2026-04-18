import { Loader2, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { OrderQRCode } from '@/components/features/OrderQRCode'
import { usePortalLocale } from '@/hooks/usePortalLocale'
import { buildCheckoutPayload, orderService } from '@/services/orderService'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'
import type { CheckoutResult } from '@/types/doctor-portal'
import { formatCurrency } from '@/utils/formatters'

export function CartPage() {
  const { cart, currentUser, language, clearCart, removeFromCart, updateQuantity } =
    useDoctorPortalStore()
  const { getDrugSubtitle, getDrugTitle, text } = usePortalLocale()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null)

  const total = cart.reduce((sum, item) => sum + item.drug.price * item.quantity, 0)
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = async () => {
    if (!currentUser || cart.length === 0) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload = buildCheckoutPayload(currentUser.id, cart)
      const result = await orderService.submitOrder(payload)
      setCheckoutResult(result)
      clearCart()
    } catch {
      setSubmitError(
        text(
          'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.',
          'An error occurred while submitting the order. Please try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkoutResult) {
    return (
      <div className="space-y-6">
        <OrderQRCode result={checkoutResult} />

        <div className="flex justify-center gap-4">
          <Link
            to="/app/dashboard"
            className="rounded-xl bg-primary-500 px-6 py-3.5 font-semibold text-white"
          >
            {text('العودة إلى الرئيسية', 'Back to dashboard')}
          </Link>
          <Link
            to="/app/orders"
            className="rounded-xl border border-primary-100 bg-white px-6 py-3.5 font-semibold text-primary-700"
          >
            {text('سجلات الطلبات', 'Order records')}
          </Link>
          <button
            type="button"
            className="rounded-xl border border-primary-100 bg-white px-6 py-3.5 font-semibold text-primary-700"
            onClick={() => setCheckoutResult(null)}
          >
            {text('طلب جديد', 'New order')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="portal-card hero-grid overflow-hidden p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-500">
              {text('السلة العلاجية', 'Therapy cart')}
            </p>
            <h2 className="mt-4 font-display text-5xl font-extrabold text-primary-900">
              {text('مراجعة اختياراتك', 'Review your selections')}
            </h2>
            <p className="mt-5 max-w-3xl leading-8 text-slate-600">
              {text(
                'راجع اختياراتك الدوائية قبل إتمام الطلب — يمكنك تعديل الكميات أو حذف العناصر في أي وقت.',
                'Review your selected therapies before finalizing — edit quantities or remove items at any time.',
              )}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="metric-card">
              <p className="text-sm font-semibold text-slate-400">
                {text('الأصناف المختلفة', 'Distinct items')}
              </p>
              <p className="mt-3 text-4xl font-bold text-primary-900">{cart.length}</p>
            </div>
            <div className="metric-card">
              <p className="text-sm font-semibold text-slate-400">
                {text('إجمالي الوحدات', 'Total units')}
              </p>
              <p className="mt-3 text-4xl font-bold text-primary-900">{totalUnits}</p>
            </div>
          </div>
        </div>
      </section>

      {cart.length === 0 ? (
        <section className="portal-card p-8 text-center">
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
              <ShoppingCart className="h-8 w-8 text-primary-400" />
            </div>
            <h3 className="text-3xl font-bold text-primary-900">
              {text('لا توجد عناصر في السلة حالياً', 'Your cart is currently empty')}
            </h3>
            <p className="leading-8 text-slate-600">
              {text(
                'ابدأ من لوحة الطبيب أو من صفحة المفضلة لإضافة الأدوية، ثم عد هنا لمراجعة الاختيارات.',
                'Start from the doctor dashboard or favourites page to add therapies, then return here to review.',
              )}
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/app/dashboard"
                className="rounded-xl bg-primary-500 px-5 py-3 font-semibold text-white"
              >
                {text('العودة إلى الرئيسية', 'Back to dashboard')}
              </Link>
              <Link
                to="/app/favorites"
                className="rounded-xl border border-primary-100 bg-white px-5 py-3 font-semibold text-primary-700"
              >
                {text('فتح المفضلة', 'Open favorites')}
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="portal-card p-8">
            <div className="space-y-4">
              {cart.map((item) => {
                const lineTotal = item.drug.price * item.quantity

                return (
                  <div key={item.drug.id} className="soft-panel p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="glass-chip px-3 py-1 text-xs font-semibold text-primary-700">
                            {item.drug.companyName}
                          </span>
                          <span className="glass-chip px-3 py-1 text-xs font-semibold text-primary-700">
                            {item.drug.categoryName}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-primary-900">
                          {getDrugTitle(item.drug)}
                        </h3>
                        <p className="text-sm text-slate-500">{getDrugSubtitle(item.drug)}</p>
                      </div>

                      <div className="flex flex-col gap-4 lg:items-end">
                        <div className="flex items-center gap-3">
                          <button
                            className="rounded-xl border border-primary-100 px-3 py-2 font-semibold text-primary-700"
                            onClick={() => updateQuantity(item.drug.id, item.quantity - 1)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="min-w-12 text-center text-lg font-semibold text-primary-900">
                            {item.quantity}
                          </span>
                          <button
                            className="rounded-xl border border-primary-100 px-3 py-2 font-semibold text-primary-700"
                            onClick={() => updateQuantity(item.drug.id, item.quantity + 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-center lg:text-right">
                          <p className="text-sm text-slate-500">{text('الإجمالي الفرعي', 'Line total')}</p>
                          <p className="mt-1 text-2xl font-bold text-primary-900">
                            {formatCurrency(lineTotal, language)}
                          </p>
                        </div>

                        <button
                          className="rounded-xl bg-error/10 px-4 py-2.5 font-semibold text-error"
                          onClick={() => removeFromCart(item.drug.id)}
                          type="button"
                        >
                          {text('حذف من السلة', 'Remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <aside className="portal-card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">
              {text('ملخص الطلب', 'Order Summary')}
            </p>
            <h3 className="mt-3 text-3xl font-bold text-primary-900">
              {text('مراجعة نهائية', 'Final review')}
            </h3>
            <div className="mt-6 space-y-4">
              <div className="soft-panel p-5">
                <p className="text-sm text-slate-500">{text('عدد الأصناف', 'Distinct items')}</p>
                <p className="mt-2 text-2xl font-bold text-primary-900">{cart.length}</p>
              </div>
              <div className="soft-panel p-5">
                <p className="text-sm text-slate-500">{text('إجمالي الوحدات', 'Total units')}</p>
                <p className="mt-2 text-2xl font-bold text-primary-900">{totalUnits}</p>
              </div>
              <div className="soft-panel p-5">
                <p className="text-sm text-slate-500">{text('الإجمالي', 'Grand total')}</p>
                <p className="mt-2 text-2xl font-bold text-primary-900">
                  {formatCurrency(total, language)}
                </p>
              </div>

              {submitError ? (
                <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-4 text-sm leading-7 text-error">
                  {submitError}
                </div>
              ) : null}

              <button
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary-500 px-6 py-4 font-semibold text-white disabled:opacity-60"
                onClick={handleCheckout}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {text('جارٍ إرسال الطلب...', 'Submitting order...')}
                  </>
                ) : (
                  text('تأكيد الطلب وتوليد QR', 'Confirm & Generate QR')
                )}
              </button>

              <p className="text-center text-xs leading-6 text-slate-400">
                {text(
                  'سيتم توليد رمز QR فوراً لاستخدامه عند جهاز الصرف الآلي.',
                  'A QR code will be generated immediately for use at the dispensing machine.',
                )}
              </p>
            </div>
          </aside>
        </section>
      )}
    </div>
  )
}
