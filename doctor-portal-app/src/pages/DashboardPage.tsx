import { ClipboardList, Heart, Search, ShoppingCart } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { CategoryCard } from '@/components/features/CategoryCard'
import { DrugCard } from '@/components/features/DrugCard'
import { usePortalLocale } from '@/hooks/usePortalLocale'
import { catalogService, type DashboardSnapshot } from '@/services/catalogService'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'

export function DashboardPage() {
  const { currentUser, cart, favoriteDrugIds } = useDoctorPortalStore()
  const { getSpecialtyLabel, text } = usePortalLocale()
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)

  useEffect(() => {
    void (async () => {
      const dashboardData = await catalogService.getDashboardSnapshot()
      setSnapshot(dashboardData)
    })()
  }, [])

  const quickAccessItems = useMemo(
    () => [
      {
        title: text('ابحث داخل المنصة', 'Global search'),
        description: text('ابدأ بالبحث في الكتالوج الدوائي الشامل.', 'Jump straight into the catalog search.'),
        href: '/app/search?q=metformin',
        icon: <Search className="h-5 w-5" />,
      },
      {
        title: text('سجلات الطلبات', 'Order records'),
        description: text('تابع آخر الطلبات في صفحة مخصصة.', 'Recent requests in a dedicated page.'),
        href: '/app/orders',
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        title: text('المفضلة', 'Favorites'),
        description: text('احتفظ بالأدوية المهمة للرجوع السريع.', 'Keep important drugs ready for quick return.'),
        href: '/app/favorites',
        icon: <Heart className="h-5 w-5" />,
      },
      {
        title: text('السلة', 'Cart'),
        description: text('راجع العناصر التي اخترتها.', 'Review the items currently selected.'),
        href: '/app/cart',
        icon: <ShoppingCart className="h-5 w-5" />,
      },
    ],
    [text],
  )

  if (!snapshot) {
    return (
      <div className="portal-card p-8 text-lg text-slate-500">
        {text('جارٍ تجهيز اللوحة...', 'Preparing dashboard...')}
      </div>
    )
  }

  const totalDrugs = snapshot.categories.reduce((total, category) => total + category.drugCount, 0)

  return (
    <div className="space-y-6">
      <section className="portal-card hero-grid overflow-hidden p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-500">
              {text('نظرة عامة', 'Overview')}
            </p>
            <h2 className="mt-4 font-display text-5xl font-extrabold leading-tight text-primary-900">
              {text(
                'لوحة التحكم الرئيسية',
                'Your command center',
              )}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-9 text-slate-600">
              {text(
                'ابدأ بحثك في الكتالوج الدوائي الشامل، أو راجع سلتك وطلباتك من هنا مباشرة.',
                'Jump straight into the drug catalog, or review your cart and recent orders right here.',
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="glass-chip px-4 py-2 text-sm font-semibold text-primary-700">
                {currentUser?.fullName}
              </span>
              <span className="glass-chip px-4 py-2 text-sm font-semibold text-primary-700">
                {getSpecialtyLabel(currentUser?.specialty ?? 'family-medicine')}
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              {quickAccessItems.map((item, index) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`soft-panel flex min-h-[180px] flex-col justify-between overflow-hidden p-5 ${
                    index === 0 ? 'md:row-span-2' : ''
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary-900">{item.title}</h3>
                    <p className="mt-2 leading-7 text-slate-500">{item.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    {text('فتح القسم', 'Open section')}
                  </span>
                </Link>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="metric-card">
                <p className="text-sm font-semibold text-slate-400">{text('التصنيفات', 'Categories')}</p>
                <p className="mt-3 text-4xl font-bold text-primary-900">{snapshot.categories.length}</p>
              </div>
              <div className="metric-card">
                <p className="text-sm font-semibold text-slate-400">{text('إجمالي الأدوية', 'Total drugs')}</p>
                <p className="mt-3 text-4xl font-bold text-primary-900">{totalDrugs}</p>
              </div>
              <div className="metric-card">
                <p className="text-sm font-semibold text-slate-400">{text('السلة الحالية', 'Current cart')}</p>
                <p className="mt-3 text-4xl font-bold text-primary-900">{cart.length}</p>
              </div>
              <div className="metric-card">
                <p className="text-sm font-semibold text-slate-400">{text('المفضلة', 'Favorites')}</p>
                <p className="mt-3 text-4xl font-bold text-primary-900">{favoriteDrugIds.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="portal-card p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-500">
              {text('الأقسام', 'Categories')}
            </p>
            <h3 className="mt-3 text-3xl font-bold text-primary-900">
              {text('أقسام الأدوية', 'Therapy categories')}
            </h3>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="portal-card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-500">
          {text('الأدوية الشائعة', 'Popular drugs')}
        </p>
        <h3 className="mt-3 text-3xl font-bold text-primary-900">
          {text('الأدوية الأكثر شيوعاً', 'Most popular therapies')}
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {snapshot.popularDrugs.slice(0, 4).map((drug) => (
            <DrugCard key={drug.id} drug={drug} />
          ))}
        </div>
      </section>
    </div>
  )
}
