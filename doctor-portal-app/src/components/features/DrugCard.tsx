import { Check, Heart, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { usePortalLocale } from '@/hooks/usePortalLocale'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'
import { useToastStore } from '@/store/useToastStore'
import type { Drug } from '@/types/doctor-portal'
import { formatCurrency } from '@/utils/formatters'

interface DrugCardProps {
  drug: Drug
}

function availabilityClass(status: Drug['availability']) {
  if (status === 'in_stock') return 'bg-success/10 text-success'
  if (status === 'limited') return 'bg-warning/10 text-warning'
  return 'bg-error/10 text-error'
}

export function DrugCard({ drug }: DrugCardProps) {
  const { addToCart, isFavorite, toggleFavorite, language } = useDoctorPortalStore()
  const { addToast } = useToastStore()
  const { getAvailabilityLabel, getDrugDescription, getDrugSubtitle, getDrugTitle, text } =
    usePortalLocale()

  const [justAdded, setJustAdded] = useState(false)
  const favorite = isFavorite(drug.id)

  const handleAddToCart = () => {
    addToCart(drug)
    setJustAdded(true)
    addToast(
      getDrugTitle(drug),
      'تمت الإضافة إلى السلة',
      'Added to cart',
    )
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <article className="soft-panel flex h-full flex-col justify-between overflow-hidden p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {drug.categoryName}
            </p>
            <h3 className="mt-3 text-2xl font-bold text-primary-900">{getDrugTitle(drug)}</h3>
            <p className="mt-2 text-sm text-slate-500">{getDrugSubtitle(drug)}</p>
          </div>
          <button
            className={`rounded-full border p-2.5 ${
              favorite
                ? 'border-error/20 bg-error/5 text-error'
                : 'border-primary-100 bg-white text-slate-400'
            }`}
            onClick={() => toggleFavorite(drug.id)}
            type="button"
          >
            <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <p className="mt-5 min-h-[96px] leading-7 text-slate-600">{getDrugDescription(drug)}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
            {drug.companyName}
          </span>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${availabilityClass(drug.availability)}`}
          >
            {getAvailabilityLabel(drug.availability)}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">{text('السعر', 'Price')}</span>
          <span className="text-2xl font-bold text-primary-900">
            {formatCurrency(drug.price, language)}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold text-white ${
              justAdded ? 'bg-success' : 'bg-primary-500'
            }`}
            onClick={handleAddToCart}
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
          <Link
            to={`/app/drug/${drug.id}`}
            className="rounded-xl border border-primary-100 px-4 py-3.5 font-semibold text-primary-700"
          >
            {text('تفاصيل', 'Details')}
          </Link>
        </div>
      </div>
    </article>
  )
}
