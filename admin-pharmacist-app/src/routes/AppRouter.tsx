import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { Skeleton } from '@/components/common/Skeleton'
import { AdminShell } from '@/components/layout/AdminShell'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { CompaniesPage } from '@/pages/CompaniesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DetailsPage } from '@/pages/DetailsPage'
import { DoctorRequestsPage } from '@/pages/DoctorRequestsPage'
import { DrugsPage } from '@/pages/DrugsPage'
import { LoginPage } from '@/pages/LoginPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { PatientsPage } from '@/pages/PatientsPage'
import { UsersPage } from '@/pages/UsersPage'
import { useAdminStore } from '@/store/useAdminStore'

function RequireAuth({ children }: { children: ReactNode }) {
  const { sessionUser, initialise } = useAdminStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void (async () => {
      await initialise()
      setReady(true)
    })()
  }, [initialise])

  if (!ready) {
    return (
      <div className="m-6 space-y-4 rounded-[28px] border border-slateAdmin-200 bg-white p-8 shadow-dashboard">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-2/3 max-w-sm" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
    )
  }

  if (!sessionUser) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function LoginGate() {
  const { sessionUser, initialise } = useAdminStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void (async () => {
      await initialise()
      setReady(true)
    })()
  }, [initialise])

  if (!ready) {
    return (
      <div className="m-6 space-y-4 rounded-[28px] border border-slateAdmin-200 bg-white p-8 shadow-dashboard">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
    )
  }

  if (sessionUser) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <LoginPage />
}

/** مسارات مسطّحة: لا nested routes ولا Outlet — الصفحة تُمرَّر كـ children مباشرة */
function admin(page: ReactNode) {
  return (
    <RequireAuth>
      <AdminShell>{page}</AdminShell>
    </RequireAuth>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGate />} />

      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/app/dashboard" element={admin(<DashboardPage />)} />
      <Route path="/app/drugs" element={admin(<DrugsPage />)} />
      <Route path="/app/categories" element={admin(<CategoriesPage />)} />
      <Route path="/app/companies" element={admin(<CompaniesPage />)} />
      <Route path="/app/orders" element={admin(<OrdersPage />)} />
      <Route path="/app/doctor-requests" element={admin(<DoctorRequestsPage />)} />
      <Route path="/app/users" element={admin(<UsersPage />)} />
      <Route path="/app/patients" element={admin(<PatientsPage />)} />
      <Route path="/app/details/:entity/:id" element={admin(<DetailsPage />)} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
