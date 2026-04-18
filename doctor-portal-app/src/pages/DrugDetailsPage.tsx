import { ArrowLeft, ArrowRight, Check, Heart, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { DrugCard } from '@/components/features/DrugCard'
import { usePortalLocale } from '@/hooks/usePortalLocale'
import { catalogService } from '@/services/catalogService'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'
import { useToastStore } from '@/store/useToastStore'
import type { Drug } from '@/types/doctor-portal'
import { formatCurrency } from '@/utils/formatters'

function availabilityClass(status: Drug['availability']) {
  if (status === 'in_stock') return 'bg-success/10 text-success'
  if (status === 'limited') return 'bg-warning/10 text-warning'
  return 'bg-error/10 text-error'
}

export function DrugDetailsPage() {
  const { drugId = '' } = useParams()
  const { addToCart, isFavorite, language, toggleFavorite } = useDoctorPortalStore()
  const {
    getAvailabilityLabel,
    getCategoryName,
    getDrugDescription,
    getDrugSubtitle,
    getDrugTitle,
    getDrugWarnings,
    isArabic,
    text,
  } = usePortalLocale()
  const { addToast } = useToastStore()
  const [drug, setDrug] = useState<Drug | null>(null)
  const [relatedDrugs, setRelatedDrugs] = useState<Drug[]>([])
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = (target: Drug) => {
    addToCart(target)
    setJustAdded(true)
    addToast(getDrugTitle(target), 'تمت الإضافة إلى السلة', 'Added to cart')
    setTimeout(() => setJustAdded(false), 2000)
  }

  useEffect(() => {
    void (async () => {
      const drugData = await catalogService.getDrugById(drugId)
      setDrug(drugData ?? null)

      if (drugData) {
        const categorySlug = drugData.id.split('-drug-')[0]
        const drugsData = await catalogService.getDrugsByCategory(categorySlug)
        setRelatedDrugs(drugsData.filter((candidate) => candidate.id !== drugData.id).slice(0, 3))
      }
    })()
  }, [drugId])

  if (!drug) {
    return (
      <div className="portal-card p-8 text-lg text-slate-500">
        {text('جارٍ تحميل تفاصيل الدواء...', 'Loading drug details...')}
      </div>
    )
  }

  const categorySlug = drug.id.split('-drug-')[0]
  const favorite = isFavorite(drug.id)

  return (
    <div className="space-y-6">
      <section className="portal-card hero-grid overflow-hidden p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">
              {text('تفاصيل الدواء', 'Drug Details')}
            </p>
            <h2 className="mt-4 font-display text-5xl font-extrabold text-primary-900">
              {getDrugTitle(drug)}
            </h2>
            <p className="mt-3 text-lg text-slate-500">{getDrugSubtitle(drug)}</p>
            <p className="mt-6 max-w-4xl leading-8 text-slate-600">{getDrugDescription(drug)}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="glass-chip px-4 py-2 text-sm font-semibold text-primary-700">
                {drug.companyName}
              </span>
              <span className="glass-chip px-4 py-2 text-sm font-semibold text-primary-700">
                {getCategoryName(categorySlug, drug.categoryName)}
              </span>
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${availabilityClass(drug.availability)}`}
              >
                {getAvailabilityLabel(drug.availability)}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="metric-card">
                <p className="text-sm font-semibold text-slate-400">{text('الشركة', 'Company')}</p>
                <p className="mt-3 text-2xl font-bold text-primary-900">{drug.companyName}</p>
              </div>
              <div className="metric-card">
                <p className="text-sm font-semibold text-slate-400">{text('التصنيف', 'Category')}</p>
                <p className="mt-3 text-2xl font-bold text-primary-900">
                  {getCategoryName(categorySlug, drug.categoryName)}
                </p>
              </div>
              <div className="metric-card">
                <p className="text-sm font-semibold text-slate-400">{text('السعر', 'Price')}</p>
                <p className="mt-3 text-2xl font-bold text-primary-900">
                  {formatCurrency(drug.price, language)}
                </p>
              </div>
              <div className="metric-card">
                <p className="text-sm font-semibold text-slate-400">
                  {text('المخزون الظاهري', 'Visible stock')}
                </p>
                <p className="mt-3 text-2xl font-bold text-primary-900">{drug.stock}</p>
              </div>
            </div>

            <div className="mt-6 soft-panel p-5">
              <p className="text-sm font-semibold text-slate-400">
                {text('تنبيهات ووصف مختصر', 'Warnings and quick guidance')}
              </p>
              <ul className="mt-4 space-y-2 text-slate-600">
                {getDrugWarnings(drug).map((warning) => (
                  <li key={warning}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="soft-panel p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">
                {text('ملخص سريع', 'Quick snapshot')}
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-primary-50 p-4">
                  <p className="text-sm text-slate-500">{text('السعر الحالي', 'Current price')}</p>
                  <p className="mt-2 text-3xl font-bold text-primary-900">
                    {formatCurrency(drug.price, language)}
                  </p>
                </div>
                <div className="rounded-xl bg-primary-50 p-4">
                  <p className="text-sm text-slate-500">
                    {text('الجرعة الشكلية', 'Displayed dosage')}
                  </p>
                  <p className="mt-2 text-xl font-bold text-primary-900">{drug.dosage}</p>
                </div>
                <div className="rounded-xl bg-primary-50 p-4">
                  <p className="text-sm text-slate-500">{text('حالة التوفر', 'Availability')}</p>
                  <p className="mt-2 text-xl font-bold text-primary-900">
                    {getAvailabilityLabel(drug.availability)}
                  </p>
                </div>
              </div>
            </div>

            <div className="soft-panel p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">
                {text('الإجراءات', 'Actions')}
              </p>
              <div className="mt-6 space-y-4">
                <button
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 font-semibold text-white ${
                    justAdded ? 'bg-success' : 'bg-primary-500'
                  }`}
                  onClick={() => handleAddToCart(drug)}
                  disabled={justAdded}
                  type="button"
                >
                  {justAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      {text('تمت الإضافة', 'Added')}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      {text('إضافة إلى السلة', 'Add to Cart')}
                    </>
                  )}
                </button>
                <button
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-4 font-semibold ${
                    favorite
                      ? 'border-error/20 bg-error/5 text-error'
                      : 'border-primary-100 bg-white text-primary-700'
                  }`}
                  onClick={() => toggleFavorite(drug.id)}
                  type="button"
                >
                  <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
                  {favorite
                    ? text('إزالة من المفضلة', 'Remove from Favorites')
                    : text('إضافة إلى المفضلة', 'Add to Favorites')}
                </button>
                <Link
                  to={`/app/category/${categorySlug}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-primary-100 px-4 py-4 font-semibold text-primary-700"
                >
                  {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  {text('الرجوع إلى القسم', 'Back to category')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="portal-card p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-500">
          {text('خيارات مشابهة', 'Similar Picks')}
        </p>
        <h3 className="mt-3 text-3xl font-bold text-primary-900">
          {text('أدوية ذات صلة', 'Related therapies')}
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relatedDrugs.map((relatedDrug) => (
            <DrugCard key={relatedDrug.id} drug={relatedDrug} />
          ))}
        </div>
      </section>
    </div>
  )
}
