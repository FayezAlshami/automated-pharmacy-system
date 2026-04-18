import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { DoctorAppShell } from '@/components/layout/DoctorAppShell'
import { AuthPage } from '@/pages/AuthPage'
import { CartPage } from '@/pages/CartPage'
import { CategoryPage } from '@/pages/CategoryPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DrugDetailsPage } from '@/pages/DrugDetailsPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { LandingPage } from '@/pages/LandingPage'
import { OrderRecordsPage } from '@/pages/OrderRecordsPage'
import { SearchResultsPage } from '@/pages/SearchResultsPage'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'

function ProtectedOutlet() {
  const { currentUser, initialiseSession, language } = useDoctorPortalStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void (async () => {
      await initialiseSession()
      setReady(true)
    })()
  }, [initialiseSession])

  if (!ready) {
    return (
      <div className="portal-card p-8 text-lg text-slate-500">
        {language === 'ar' ? 'جارٍ تجهيز الجلسة...' : 'Preparing your session...'}
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}

function PublicOnlyOutlet() {
  const { currentUser, initialiseSession, language } = useDoctorPortalStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void (async () => {
      await initialiseSession()
      setReady(true)
    })()
  }, [initialiseSession])

  if (!ready) {
    return (
      <div className="portal-card p-8 text-lg text-slate-500">
        {language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
      </div>
    )
  }

  if (currentUser) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyOutlet />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      <Route element={<ProtectedOutlet />}>
        <Route path="/app" element={<DoctorAppShell />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="drug/:drugId" element={<DrugDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrderRecordsPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="search" element={<SearchResultsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
