import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { usePortalLocale } from '@/hooks/usePortalLocale'
import type { Category } from '@/types/doctor-portal'
import { renderCategoryIcon } from '@/utils/iconMap'

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { isArabic, getCategoryDescription, getCategoryName, text } = usePortalLocale()

  return (
    <Link
      to={`/app/category/${category.slug}`}
      className="soft-panel group relative block overflow-hidden p-5"
    >
      <div
        className={`absolute inset-x-4 top-4 h-20 rounded-[24px] bg-gradient-to-r opacity-20 blur-2xl ${category.accent}`}
      />
      <div
        className={`relative inline-flex rounded-[22px] bg-gradient-to-r p-3.5 text-white shadow-md ${category.accent}`}
      >
        {renderCategoryIcon(category.icon, 'h-6 w-6')}
      </div>
      <div className="relative mt-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-500">
              {text('قسم علاجي', 'Therapy Lane')}
            </p>
            <h3 className="mt-2 text-xl font-bold text-primary-900">
              {getCategoryName(category.slug, category.name)}
            </h3>
          </div>
          <span className="glass-chip px-3 py-1 text-xs font-semibold text-primary-700">
            {category.drugCount} {text('دواء', 'drugs')}
          </span>
        </div>
        <p className="min-h-[72px] leading-7 text-slate-600">
          {getCategoryDescription(category.slug, category.description)}
        </p>
        <div className="flex items-center justify-between text-sm font-semibold text-primary-600">
          <span>{text('استعراض القسم', 'Open category')}</span>
          {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </div>
      </div>
    </Link>
  )
}
