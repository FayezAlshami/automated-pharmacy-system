import { Lock, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { DisplayControls } from '@/components/common/DisplayControls'
import { appConfig } from '@/config/appConfig'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'

export function LoginPage() {
  const navigate = useNavigate()
  const { sessionUser, login, loginError, isAuthLoading } = useAdminStore()
  const { text } = useAdminLocale()
  const devHints = appConfig.showDevLoginHints
  /** المحاكاة والـ API (بعد seed) يستخدمان admin@admin.com / fayez */
  const defaultDevEmail = devHints ? 'admin@admin.com' : ''
  const [email, setEmail] = useState(defaultDevEmail)
  const [password, setPassword] = useState(devHints ? 'fayez' : '')

  useEffect(() => {
    if (sessionUser) {
      navigate('/app/dashboard')
    }
  }, [navigate, sessionUser])

  return (
    <main className="app-canvas relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,158,219,0.12),transparent)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex justify-end">
          <DisplayControls />
        </div>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
        <section className="flex flex-col justify-center px-1">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slateAdmin-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slateAdmin-500 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brandSecondary" aria-hidden />
            {text('بوابة التشغيل', 'Operations Portal')}
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-slateAdmin-950 sm:text-5xl lg:text-[2.75rem]">
            {text('الصيدلية المؤتمتة', 'Automated Pharmacy')}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slateAdmin-600 sm:text-lg">
            {text(
              'لوحة موحّدة لمراقبة المخزون والطلبات والوصول. سجّل الدخول للمتابعة.',
              'One dashboard for inventory, orders, and access. Sign in to continue.',
            )}
          </p>
          {devHints ? (
            <p className="mt-4 rounded-2xl border border-dashed border-slateAdmin-200 bg-slateAdmin-50 px-4 py-3 text-xs leading-relaxed text-slateAdmin-600">
              {text(
                'وضع التطوير: يمكن استخدام حسابات الاختبار من الفريق.',
                'Development mode: your team may use internal test credentials.',
              )}
            </p>
          ) : null}
        </section>

        <section className="dashboard-card relative overflow-hidden p-8 sm:p-10">
          <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,158,219,0.12),transparent_70%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 text-brandSecondary">
                <Lock className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slateAdmin-400">
                  {text('تسجيل الدخول', 'Sign in')}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slateAdmin-950">
                  {text('الوصول إلى لوحة التحكم', 'Access the dashboard')}
                </h2>
              </div>
            </div>

            {loginError ? (
              <div
                className="mt-6 rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 px-4 py-3 text-sm text-brandSecondary"
                role="alert"
              >
                {loginError}
              </div>
            ) : null}

            <form
              className="mt-8 space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                void (async () => {
                  const success = await login(email, password)
                  if (success) {
                    navigate('/app/dashboard')
                  }
                })()
              }}
            >
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slateAdmin-700">
                  {text('البريد الإلكتروني', 'Email')}
                </span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="field-input"
                  type="email"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slateAdmin-700">
                  {text('كلمة المرور', 'Password')}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="field-input"
                />
              </label>
              <button className="button-primary w-full justify-center py-4 text-base" type="submit">
                {isAuthLoading
                  ? text('جارٍ تسجيل الدخول…', 'Signing in…')
                  : text('دخول', 'Sign in')}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
