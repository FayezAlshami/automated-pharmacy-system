import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { LanguageSwitch } from '@/components/common/LanguageSwitch'
import { usePortalLocale } from '@/hooks/usePortalLocale'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'

function buildLoginSchema(isArabic: boolean) {
  return z.object({
    email: z.string().email(
      isArabic ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'A valid email is required.',
    ),
    password: z.string().min(
      8,
      isArabic ? 'كلمة المرور 8 أحرف على الأقل.' : 'At least 8 characters.',
    ),
  })
}

function buildSignupSchema(isArabic: boolean) {
  return z
    .object({
      fullName: z.string().min(3, isArabic ? 'الاسم الكامل مطلوب.' : 'Full name is required.'),
      specialty: z.string().min(2, isArabic ? 'يرجى اختيار التخصص.' : 'Specialty is required.'),
      phone: z.string().min(8, isArabic ? 'رقم الهاتف مطلوب.' : 'Phone is required.'),
      clinicName: z.string().min(2, isArabic ? 'اسم العيادة مطلوب.' : 'Clinic name is required.'),
      email: z.string().email(
        isArabic ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'A valid email is required.',
      ),
      password: z.string().min(
        8,
        isArabic ? 'كلمة المرور 8 أحرف على الأقل.' : 'At least 8 characters.',
      ),
      confirmPassword: z.string().min(
        8,
        isArabic ? 'يرجى تأكيد كلمة المرور.' : 'Please confirm your password.',
      ),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: isArabic ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',
      path: ['confirmPassword'],
    })
}

type LoginValues = z.infer<ReturnType<typeof buildLoginSchema>>
type SignupValues = z.infer<ReturnType<typeof buildSignupSchema>>

function fieldClass(hasError: boolean) {
  return [
    'w-full rounded-xl border bg-white px-4 py-3 text-primary-900 outline-none',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
    hasError ? 'border-error/50' : 'border-primary-100',
  ].join(' ')
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-primary-700">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1.5 block text-xs text-error">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function PasswordToggle({
  show,
  onToggle,
  ariaLabel,
}: {
  show: boolean
  onToggle: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      className="absolute inset-y-0 end-3 flex items-center text-primary-400 hover:text-primary-600"
      onClick={onToggle}
      aria-label={ariaLabel}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { signIn, signUp, authError, isAuthLoading } = useDoctorPortalStore()
  const { isArabic, specialtyOptions, text } = usePortalLocale()

  const loginSchema = useMemo(() => buildLoginSchema(isArabic), [isArabic])
  const signupSchema = useMemo(() => buildSignupSchema(isArabic), [isArabic])

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      specialty: specialtyOptions[0]?.value ?? '',
      phone: '',
      clinicName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleLogin = async (values: LoginValues) => {
    const success = await signIn(values)
    if (success) navigate('/app/dashboard')
  }

  const handleSignup = async (values: SignupValues) => {
    const success = await signUp({
      fullName: values.fullName,
      specialty: values.specialty,
      phone: values.phone,
      clinicName: values.clinicName,
      email: values.email,
      password: values.password,
    })
    if (success) navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Brand panel */}
      <aside className="hidden flex-col items-center justify-center bg-primary-900 px-10 py-12 text-white lg:flex lg:w-[440px] xl:w-[500px]">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          <img
            src="/brand/dtc-logo.png"
            alt={text('مركز دمشق للتدريب', 'Damascus Training Centre')}
            className="h-52 w-52 rounded-[28px] object-contain xl:h-60 xl:w-60"
          />

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
            {text('مركز دمشق للتدريب', 'Damascus Training Centre')}
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-snug xl:text-4xl">
            {text('بوابة الطبيب', 'Doctor Portal')}
          </h1>
          <p className="mt-8 text-sm leading-relaxed text-primary-200">
            {text('بإشراف المهندس جمال العمري', 'Under the supervision of Eng. Jamal Al-Omari')}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-primary-200">
            {text('بإدارة المهندس وسيم الماضي', 'Managed by Eng. Wassim Al-Madi')}
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col items-center justify-center bg-[#F5F7FA] px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-end">
            <LanguageSwitch />
          </div>

          {/* Mobile brand mark */}
          <div className="mb-8 lg:hidden">
            <div className="flex flex-col items-center gap-4 text-center">
              <img
                src="/brand/dtc-logo.png"
                alt="DTC"
                className="h-28 w-28 rounded-2xl object-contain sm:h-32 sm:w-32"
              />
              <div>
                <p className="text-xs font-semibold text-primary-500">
                  {text('مركز دمشق للتدريب', 'Damascus Training Centre')}
                </p>
                <p className="font-display text-xl font-bold text-primary-900">
                  {text('بوابة الطبيب', 'Doctor Portal')}
                </p>
                <p className="mt-3 text-xs text-slate-600">
                  {text('بإشراف المهندس جمال العمري', 'Under the supervision of Eng. Jamal Al-Omari')}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {text('بإدارة المهندس وسيم الماضي', 'Managed by Eng. Wassim Al-Madi')}
                </p>
              </div>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="mb-6 flex rounded-2xl bg-primary-50 p-1">
            <button
              className={`flex-1 rounded-xl py-3 text-sm font-semibold ${
                mode === 'login' ? 'bg-primary-500 text-white shadow-sm' : 'text-primary-700'
              }`}
              onClick={() => setMode('login')}
              type="button"
            >
              {text('تسجيل الدخول', 'Sign In')}
            </button>
            <button
              className={`flex-1 rounded-xl py-3 text-sm font-semibold ${
                mode === 'signup' ? 'bg-primary-500 text-white shadow-sm' : 'text-primary-700'
              }`}
              onClick={() => setMode('signup')}
              type="button"
            >
              {text('إنشاء حساب', 'Create Account')}
            </button>
          </div>

          {authError ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
            >
              {authError}
            </div>
          ) : null}

          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <Field
                label={text('البريد الإلكتروني', 'Email address')}
                error={loginForm.formState.errors.email?.message}
              >
                <input
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!loginForm.formState.errors.email}
                  className={fieldClass(!!loginForm.formState.errors.email)}
                  {...loginForm.register('email')}
                />
              </Field>

              <Field
                label={text('كلمة المرور', 'Password')}
                error={loginForm.formState.errors.password?.message}
              >
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    aria-invalid={!!loginForm.formState.errors.password}
                    className={`${fieldClass(!!loginForm.formState.errors.password)} pe-11`}
                    {...loginForm.register('password')}
                  />
                  <PasswordToggle
                    show={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                    ariaLabel={
                      showPassword
                        ? text('إخفاء كلمة المرور', 'Hide password')
                        : text('إظهار كلمة المرور', 'Show password')
                    }
                  />
                </div>
              </Field>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="mt-2 w-full rounded-xl bg-primary-500 py-3.5 font-semibold text-white disabled:opacity-60"
              >
                {isAuthLoading
                  ? text('جارٍ التحقق...', 'Verifying...')
                  : text('الدخول إلى البوابة', 'Enter Portal')}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={signupForm.handleSubmit(handleSignup)}>
              <Field
                label={text('الاسم الكامل', 'Full name')}
                error={signupForm.formState.errors.fullName?.message}
              >
                <input
                  type="text"
                  autoComplete="name"
                  aria-invalid={!!signupForm.formState.errors.fullName}
                  className={fieldClass(!!signupForm.formState.errors.fullName)}
                  {...signupForm.register('fullName')}
                />
              </Field>

              <Field
                label={text('التخصص', 'Specialty')}
                error={signupForm.formState.errors.specialty?.message}
              >
                <select
                  aria-invalid={!!signupForm.formState.errors.specialty}
                  className={fieldClass(!!signupForm.formState.errors.specialty)}
                  {...signupForm.register('specialty')}
                >
                  {specialtyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={text('الهاتف', 'Phone')}
                  error={signupForm.formState.errors.phone?.message}
                >
                  <input
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={!!signupForm.formState.errors.phone}
                    className={fieldClass(!!signupForm.formState.errors.phone)}
                    {...signupForm.register('phone')}
                  />
                </Field>

                <Field
                  label={text('اسم العيادة', 'Clinic')}
                  error={signupForm.formState.errors.clinicName?.message}
                >
                  <input
                    type="text"
                    aria-invalid={!!signupForm.formState.errors.clinicName}
                    className={fieldClass(!!signupForm.formState.errors.clinicName)}
                    {...signupForm.register('clinicName')}
                  />
                </Field>
              </div>

              <Field
                label={text('البريد الإلكتروني', 'Email address')}
                error={signupForm.formState.errors.email?.message}
              >
                <input
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!signupForm.formState.errors.email}
                  className={fieldClass(!!signupForm.formState.errors.email)}
                  {...signupForm.register('email')}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={text('كلمة المرور', 'Password')}
                  error={signupForm.formState.errors.password?.message}
                >
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={!!signupForm.formState.errors.password}
                      className={`${fieldClass(!!signupForm.formState.errors.password)} pe-9`}
                      {...signupForm.register('password')}
                    />
                    <PasswordToggle
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      ariaLabel={showPassword ? text('إخفاء', 'Hide') : text('إظهار', 'Show')}
                    />
                  </div>
                </Field>

                <Field
                  label={text('التأكيد', 'Confirm')}
                  error={signupForm.formState.errors.confirmPassword?.message}
                >
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={!!signupForm.formState.errors.confirmPassword}
                      className={`${fieldClass(!!signupForm.formState.errors.confirmPassword)} pe-9`}
                      {...signupForm.register('confirmPassword')}
                    />
                    <PasswordToggle
                      show={showConfirm}
                      onToggle={() => setShowConfirm((v) => !v)}
                      ariaLabel={showConfirm ? text('إخفاء', 'Hide') : text('إظهار', 'Show')}
                    />
                  </div>
                </Field>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="mt-2 w-full rounded-xl bg-primary-500 py-3.5 font-semibold text-white disabled:opacity-60"
              >
                {isAuthLoading
                  ? text('جارٍ إنشاء الحساب...', 'Creating account...')
                  : text('إنشاء الحساب والمتابعة', 'Create Account')}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
