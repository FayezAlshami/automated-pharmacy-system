import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { DrugCard } from '@/components/features/DrugCard'
import { useDrugFilters } from '@/hooks/useDrugFilters'
import { usePortalLocale } from '@/hooks/usePortalLocale'
import { catalogService } from '@/services/catalogService'
import type { Category, Company, Drug } from '@/types/doctor-portal'
import { renderCategoryIcon } from '@/utils/iconMap'

const filterInputClass =
  'rounded-xl border border-primary-100 bg-white px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const { getCategoryDescription, getCategoryName, text } = usePortalLocale()
  const [category, setCategory] = useState<Category | null>(null)
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const { filters, filteredDrugs, setQuery, setAvailability, setCompanyId, setSortBy } =
    useDrugFilters(drugs)

  useEffect(() => {
    void (async () => {
      const [categoryData, drugsData, companiesData] = await Promise.all([
        catalogService.getCategoryBySlug(slug),
        catalogService.getDrugsByCategory(slug),
        catalogService.getCompanies(),
      ])

      setCategory(categoryData ?? null)
      setDrugs(drugsData)
      setCompanies(companiesData)
    })()
  }, [slug])

  if (!category) {
    return (
      <div className="portal-card p-8 text-lg text-slate-500">
        {text('جارٍ تحميل القسم...', 'Loading category...')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="portal-card hero-grid p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div
              className={`inline-flex rounded-[24px] bg-gradient-to-r p-4 text-white shadow-md ${category.accent}`}
            >
              {renderCategoryIcon(category.icon, 'h-8 w-8')}
            </div>
            <h2 className="mt-5 font-display text-4xl font-extrabold text-primary-900">
              {getCategoryName(category.slug, category.name)}
            </h2>
            <p className="mt-3 max-w-3xl leading-8 text-slate-600">
              {getCategoryDescription(category.slug, category.description)}
            </p>
          </div>
          <div className="metric-card min-w-[200px]">
            <p className="text-sm font-semibold text-slate-400">{text('عدد الأدوية', 'Drug count')}</p>
            <p className="mt-3 text-4xl font-bold text-primary-900">{category.drugCount}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={filters.query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text('ابحث داخل هذا القسم', 'Search inside this category')}
            className={filterInputClass}
          />
          <select
            value={filters.availability}
            onChange={(event) => setAvailability(event.target.value as typeof filters.availability)}
            className={filterInputClass}
          >
            <option value="all">{text('كل حالات التوفر', 'All availability')}</option>
            <option value="in_stock">{text('متوفر', 'Available')}</option>
            <option value="limited">{text('مخزون محدود', 'Limited')}</option>
            <option value="out_of_stock">{text('غير متوفر', 'Out of Stock')}</option>
          </select>
          <select
            value={filters.companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            className={filterInputClass}
          >
            <option value="all">{text('كل الشركات', 'All companies')}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            value={filters.sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof filters.sortBy)}
            className={filterInputClass}
          >
            <option value="popular">{text('الأكثر شيوعاً', 'Most popular')}</option>
            <option value="price_asc">{text('السعر تصاعدياً', 'Price ascending')}</option>
            <option value="price_desc">{text('السعر تنازلياً', 'Price descending')}</option>
            <option value="name">{text('الاسم', 'Name')}</option>
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDrugs.map((drug) => (
          <DrugCard key={drug.id} drug={drug} />
        ))}
      </section>
    </div>
  )
}
