import { ArrowLeft, ClipboardList, Heart, Pill, ShieldCheck, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'

import { LanguageSwitch } from '@/components/common/LanguageSwitch'
import { usePortalLocale } from '@/hooks/usePortalLocale'

export function LandingPage() {
  const { isArabic, text } = usePortalLocale()

  return (
    <main className="min-h-screen bg-portal-surface px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/brand/dtc-logo.png" alt="DTC" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-sm font-bold text-primary-900">
              {text('مركز دمشق للتدريب', 'Damascus Training Centre')}
            </span>
          </div>
          <LanguageSwitch />
        </div>

        <section className="portal-card hero-grid overflow-hidden px-6 py-8 lg:px-10 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-500">
                {text('بوابة الطبيب', 'Doctor Portal')}
              </p>
              <h1 className="mt-4 font-display text-5xl font-extrabold leading-tight text-primary-900">
                {text(
                  'بوابة وصف ذكية تربط الطبيب بالكتالوج والمخزون المؤتمت',
                  'A smart prescribing portal connected to catalog and automated stock',
                )}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-600">
                {text(
                  'ابحث في كتالوج أدوية شامل، تصفح الأقسام العلاجية، وأدر اختياراتك وطلباتك بسهولة من مكان واحد.',
                  'Browse a comprehensive drug catalog, explore therapeutic categories, and manage your selections and orders from one place.',
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-6 py-4 font-semibold text-white shadow-sm"
                >
                  {text('تسجيل الدخول', 'Sign In')}
                  <ArrowLeft className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
                </Link>
                <Link
                  to="/auth"
                  className="rounded-2xl border border-primary-100 bg-white px-6 py-4 font-semibold text-primary-700"
                >
                  {text('إنشاء حساب', 'Create Account')}
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="soft-panel p-5">
                <div className="flex items-center justify-between">
                  <Stethoscope className="h-8 w-8 text-primary-500" />
                  <span className="glass-chip px-3 py-1 text-xs font-semibold text-primary-600">
                    {text('بحث عام', 'Global Search')}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold text-primary-900">
                  {text('تصفح أسرع وقرارات أوضح', 'Faster browsing, clearer decisions')}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {text(
                    'ابحث عن الدواء ثم افتح القسم ثم احفظه في المفضلة أو أضفه إلى السلة من نفس التجربة.',
                    'Search a therapy, open its category, save it to favourites, or add it to the cart from one smooth flow.',
                  )}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="soft-panel p-5">
                  <Heart className="h-7 w-7 text-rose-500" />
                  <h4 className="mt-3 text-xl font-bold text-primary-900">
                    {text('مفضلة عملية', 'Useful favourites')}
                  </h4>
                  <p className="mt-3 leading-7 text-slate-600">
                    {text(
                      'احفظ الأدوية المهمة سريعاً وعد إليها من صفحة مستقلة.',
                      'Save key therapies and revisit them from a dedicated view.',
                    )}
                  </p>
                </div>
                <div className="soft-panel p-5">
                  <ClipboardList className="h-7 w-7 text-accent" />
                  <h4 className="mt-3 text-xl font-bold text-primary-900">
                    {text('سجلات طلبات', 'Order records')}
                  </h4>
                  <p className="mt-3 leading-7 text-slate-600">
                    {text(
                      'واجهة مخصصة لآخر الطلبات بدل صفحة الملف التقليدية.',
                      'A dedicated recent-orders screen instead of a traditional profile page.',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="soft-panel p-5">
            <Pill className="h-8 w-8 text-primary-500" />
            <h3 className="mt-4 text-xl font-bold text-primary-900">
              {text('كتالوج غني', 'Rich catalog')}
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              {text(
                'تصنيفات دوائية متعددة مع بطاقات أقسام واضحة وأيقونات طبية معبّرة.',
                'Multiple therapeutic sections with clear category cards and expressive medical iconography.',
              )}
            </p>
          </div>
          <div className="soft-panel p-5">
            <ShieldCheck className="h-8 w-8 text-primary-500" />
            <h3 className="mt-4 text-xl font-bold text-primary-900">
              {text('جاهزية للربط', 'Ready for integration')}
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              {text(
                'طبقة الخدمات تفصل الواجهة عن البيانات وتسمح بالربط بالخادم الحقيقي لاحقاً.',
                'The services layer keeps UI isolated from data, allowing a real backend connection with minimal impact.',
              )}
            </p>
          </div>
          <div className="soft-panel p-5">
            <ClipboardList className="h-8 w-8 text-primary-500" />
            <h3 className="mt-4 text-xl font-bold text-primary-900">
              {text('تجربة عملية للطبيب', 'Clinician-first flow')}
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              {text(
                'الرحلة صممت لتخدم قرارات الطبيب اليومية بسرعة ووضوح، لا لتبدو كمتجر عادي.',
                'The flow is built for daily clinical decisions — not to feel like a generic store.',
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
