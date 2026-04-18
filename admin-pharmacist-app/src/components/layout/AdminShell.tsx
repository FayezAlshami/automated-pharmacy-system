import { LogOut, Menu, ShieldCheck, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { DisplayControls } from '@/components/common/DisplayControls'
import { AdminNavLinks } from '@/components/layout/AdminNavLinks'
import { appConfig } from '@/config/appConfig'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'

interface AdminShellProps {
  children: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { sessionUser, logout } = useAdminStore()
  const { language, text } = useAdminLocale()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!mobileNavOpen) {
      return
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  const closeMobileNav = () => setMobileNavOpen(false)

  const sidebarInner = (
    <>
      <div className="relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
          {text('التشغيل', 'Operations')}
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight">
          {text('الصيدلية المؤتمتة', 'Automated Pharmacy')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          {text(
            'مخزون، طلبات، وصلاحيات من مكان واحد.',
            'Inventory, orders, and permissions in one place.',
          )}
        </p>

        <div className="mt-5">
          <DisplayControls />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2.5">
              <ShieldCheck className="h-5 w-5 text-white/90" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {sessionUser?.name ?? text('مستخدم', 'User')}
              </p>
              <p className="truncate text-xs text-white/55">
                {sessionUser?.role === 'admin'
                  ? text('إدارة', 'Admin')
                  : sessionUser?.role === 'pharmacist'
                    ? text('صيدلي', 'Pharmacist')
                    : sessionUser?.role ?? '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <AdminNavLinks
            pathname={location.pathname}
            language={language}
            onNavigate={closeMobileNav}
          />
        </div>

        <p className="mt-8 text-[11px] text-white/40">{appConfig.appName}</p>

        <button
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          {text('تسجيل الخروج', 'Sign out')}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slateAdmin-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slateAdmin-200 bg-white text-slateAdmin-900 shadow-sm"
          onClick={() => setMobileNavOpen(true)}
          aria-expanded={mobileNavOpen}
          aria-label={text('فتح القائمة', 'Open menu')}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-xs font-semibold uppercase tracking-widest text-slateAdmin-400">
            {text('لوحة التحكم', 'Dashboard')}
          </p>
          <p className="truncate text-sm font-bold text-slateAdmin-950">{appConfig.appName.split(' - ')[0]}</p>
        </div>
        <div className="w-11 shrink-0" aria-hidden />
      </header>

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slateAdmin-950/50 backdrop-blur-sm lg:hidden"
          aria-label={text('إغلاق القائمة', 'Close menu')}
          onClick={closeMobileNav}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(100%,300px)] flex-col overflow-y-auto border-l border-white/10 bg-slateAdmin-950 px-5 py-7 text-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(0,158,219,0.2),transparent_65%)]" />
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-white/50">{text('القائمة', 'Menu')}</span>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
            onClick={closeMobileNav}
            aria-label={text('إغلاق', 'Close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {sidebarInner}
      </aside>

      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="relative hidden overflow-hidden bg-slateAdmin-950 px-6 py-8 text-white lg:block">
          <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(0,158,219,0.22),transparent_65%)]" />
          <div className="relative z-10">{sidebarInner}</div>
        </aside>

        <main className="app-canvas min-h-screen min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="dashboard-card mb-6 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slateAdmin-400">
                  {text('نظرة عامة', 'Overview')}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slateAdmin-950 sm:text-3xl">
                  {text('مركز العمليات', 'Operations center')}
                </h2>
              </div>
              <p className="text-sm text-slateAdmin-500">
                {text('إدارة المخزون والطلبات والوصول', 'Manage inventory, orders, and access')}
              </p>
            </div>
          </header>

          <div className="pb-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
