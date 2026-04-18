import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { DrugCard } from '@/components/features/DrugCard'
import { useDrugFilters } from '@/hooks/useDrugFilters'
import { usePortalLocale } from '@/hooks/usePortalLocale'
import { catalogService } from '@/services/catalogService'
import type { Company, Drug } from '@/types/doctor-portal'

const filterInputClass =
  'rounded-xl border border-primary-100 bg-white px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

export function SearchResultsPage() {
  const { text } = usePortalLocale()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [results, setResults] = useState<Drug[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const { filters, filteredDrugs, setQuery, setAvailability, setCompanyId, setSortBy } =
    useDrugFilters(results)

  useEffect(() => {
    void (async () => {
      const [resultData, companyData] = await Promise.all([
        catalogService.searchDrugs(query),
        catalogService.getCompanies(),
      ])

      setResults(resultData)
      setCompanies(companyData)
      setQuery(query)
    })()
  }, [query, setQuery])

  return (
    <div className="space-y-6">
      <section className="portal-card hero-grid p-8">
        <h2 className="font-display text-4xl font-extrabold text-primary-900">
          {text('نتائج البحث العام', 'Global search results')}
        </h2>
        <p className="mt-3 leading-8 text-slate-600">
          {text('نتائج العبارة الحالية:', 'Results for the current phrase:')}{' '}
          <span className="font-semibold">{query || text('بدون كلمة مفتاحية', 'No keyword')}</span>
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={filters.query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={text('فلترة ضمن النتائج', 'Filter inside results')}
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
