import { useState } from 'react'

import type { Drug, SearchFilterState } from '@/types/doctor-portal'

const initialFilters: SearchFilterState = {
  query: '',
  availability: 'all',
  companyId: 'all',
  sortBy: 'popular',
}

/**
 * Centralises local catalog filtering so category and search pages
 * can reuse the same search, availability, company, and sorting logic.
 */
export function useDrugFilters(drugs: Drug[]) {
  const [filters, setFilters] = useState<SearchFilterState>(initialFilters)

  const filteredDrugs = [...drugs]
    .filter((drug) => {
      const matchesQuery = [drug.name, drug.scientificName, drug.categoryName, drug.companyName]
        .join(' ')
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase())

      const matchesAvailability =
        filters.availability === 'all' || drug.availability === filters.availability

      const matchesCompany =
        filters.companyId === 'all' || drug.companyId === filters.companyId

      return matchesQuery && matchesAvailability && matchesCompany
    })
    .sort((left, right) => {
      switch (filters.sortBy) {
        case 'price_asc':
          return left.price - right.price
        case 'price_desc':
          return right.price - left.price
        case 'name':
          return left.name.localeCompare(right.name, 'ar')
        default:
          return Number(right.popular) - Number(left.popular)
      }
    })

  return {
    filters,
    filteredDrugs,
    setQuery: (query: string) => setFilters((current) => ({ ...current, query })),
    setAvailability: (availability: SearchFilterState['availability']) =>
      setFilters((current) => ({ ...current, availability })),
    setCompanyId: (companyId: string) => setFilters((current) => ({ ...current, companyId })),
    setSortBy: (sortBy: SearchFilterState['sortBy']) =>
      setFilters((current) => ({ ...current, sortBy })),
  }
}
