import { ClipboardList, Heart, LogOut, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { LanguageSwitch } from '@/components/common/LanguageSwitch'
import { SearchBar } from '@/components/common/SearchBar'
import { usePortalLocale } from '@/hooks/usePortalLocale'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'

export function DoctorAppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchValue, setSearchValue] = useState('')
  const { currentUser, cart, favoriteDrugIds, signOut, initialiseSession } = useDoctorPortalStore()
  const { getSpecialtyLabel, text } = usePortalLocale()

  useEffect(() => {
    if (!currentUser) {
      void initialiseSession()
    }
  }, [currentUser, initialiseSession])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  const handleSearch = () => {
    if (!searchValue.trim()) return
    navigate(`/app/search?q=${encodeURIComponent(searchValue.trim())}`)
  }

  const isActive = (segment: string) => location.pathname.includes(segment)

  const isPendingApproval = currentUser?.status === 'pending'

  return (
    <div className="min-h-screen bg-portal-surface px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {isPendingApproval ? (
          <div
            role="status"
            className="rounded-2xl border border-warning/50 bg-warning/10 px-4 py-3 text-sm leading-relaxed text-primary-900"
          >
            {text(
              'حسابك قيد المراجعة من قِبل الإدارة. يمكنك استخدام البوابة؛ ستُفعّل الصلاحيات الكاملة بعد الموافقة.',
              'Your account is pending admin review. You can use the portal; full access will activate after approval.',
            )}
          </div>
        ) : null}

        <header className="portal-card hero-grid overflow-hidden px-6 py-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/brand/dtc-logo.png"
                    alt="DTC"
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                  <span className="glass-chip px-3 py-1.5 text-sm font-semibold text-primary-700">
                    {text('بوابة الطبيب', 'Doctor Portal')}
                  </span>
                </div>
                <LanguageSwitch />
              </div>

              <div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-900">
                  {currentUser?.fullName ?? text('بوابة الطبيب', 'Doctor Portal')}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-8 text-slate-500">
                  {getSpecialtyLabel(currentUser?.specialty ?? 'family-medicine')}
                  {currentUser?.clinicName ? ` • ${currentUser.clinicName}` : ''}
                </p>
              </div>

              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                onSubmit={handleSearch}
                placeholder={text(
                  'ابحث عن دواء أو شركة أو تصنيف...',
                  'Search by drug, company, or category...',
                )}
                actionLabel={text('بحث', 'Search')}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Link
                to="/app/favorites"
                className="soft-panel flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-400">{text('المفضلة', 'Favorites')}</p>
                  <p className="mt-2 text-2xl font-bold text-primary-900">{favoriteDrugIds.length}</p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
                  <Heart className="h-5 w-5" />
                </div>
              </Link>

              <Link
                to="/app/cart"
                className="soft-panel flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-400">{text('السلة', 'Cart')}</p>
                  <p className="mt-2 text-2xl font-bold text-primary-900">{cartCount}</p>
                </div>
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </Link>

              <Link
                to="/app/orders"
                className="soft-panel flex items-center justify-between p-4 md:col-span-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-400">
                    {text('سجلات الطلبات', 'Order Records')}
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary-900">
                    {text('آخر الطلبات والملخصات السريعة', 'Latest requests and quick summaries')}
                  </p>
                </div>
                <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              to="/app/dashboard"
              className={`rounded-full px-4 py-2 ${
                isActive('/dashboard') ? 'bg-primary-500 text-white' : 'bg-white text-primary-700'
              }`}
            >
              {text('الرئيسية', 'Home')}
            </Link>
            <Link
              to="/app/orders"
              className={`rounded-full px-4 py-2 ${
                isActive('/orders') ? 'bg-primary-500 text-white' : 'bg-white text-primary-700'
              }`}
            >
              {text('سجلات الطلبات', 'Order Records')}
            </Link>
            <Link
              to="/app/favorites"
              className={`rounded-full px-4 py-2 ${
                isActive('/favorites') ? 'bg-primary-500 text-white' : 'bg-white text-primary-700'
              }`}
            >
              {text('المفضلة', 'Favorites')}
            </Link>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-primary-900 px-4 py-2 text-white"
              onClick={() => {
                signOut()
                navigate('/auth')
              }}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              {text('خروج', 'Sign Out')}
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
