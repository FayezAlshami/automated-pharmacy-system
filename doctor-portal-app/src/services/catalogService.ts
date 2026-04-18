import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import {
  mockCategories,
  mockCompanies,
  mockDrugs,
  mockSearchSuggestions,
} from '@/mocks/data/catalog'
import type { AvailabilityStatus, Category, Company, Drug } from '@/types/doctor-portal'
import { delay } from '@/utils/delay'

/** استجابة GET /doctor/catalog/dashboard — أسماء الحقول من FastAPI/Pydantic */
interface ApiDashboardResponse {
  popularDrugs: ApiDrugResponse[]
  featuredDrugs: ApiDrugResponse[]
  recentCategories: ApiCategoryResponse[]
  totalDrugs?: number
  totalCategories?: number
  totalCompanies?: number
}

interface ApiCategoryResponse {
  id: string
  slug: string
  name: string
  nameEn?: string
  descriptionAr?: string
  descriptionEn?: string
  icon: string
  accent: string
  drugCount: number
}

interface ApiDrugResponse {
  id: string
  name: string
  nameEn?: string
  scientificName: string
  categoryId: string
  categorySlug?: string
  companyId: string
  price: number
  stock: number
  availability: string
  dosage: string
  description: string
  warnings: string[]
  isPopular: boolean
  isFeatured: boolean
  pin?: string
  machineColumn?: string
  imageUrl?: string | null
}

function normalizeCategoryAccent(accent: string): string {
  if (accent?.startsWith('#')) {
    return 'from-sky-500 via-cyan-400 to-teal-300'
  }
  return accent || 'from-sky-500 via-cyan-400 to-teal-300'
}

function mapApiCategoryToCategory(api: ApiCategoryResponse): Category {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    description: api.descriptionAr || api.descriptionEn || '',
    icon: api.icon,
    accent: normalizeCategoryAccent(api.accent),
    drugCount: api.drugCount,
  }
}

function mapApiDrugToDrug(api: ApiDrugResponse): Drug {
  const availability = api.availability as AvailabilityStatus
  return {
    id: api.id,
    name: api.name,
    scientificName: api.scientificName,
    categoryId: api.categoryId,
    categoryName: api.categorySlug ?? api.categoryId,
    companyId: api.companyId,
    companyName: '',
    dosage: api.dosage,
    description: api.description,
    price: api.price,
    stock: api.stock,
    availability: ['in_stock', 'limited', 'out_of_stock'].includes(availability)
      ? availability
      : 'in_stock',
    warnings: api.warnings ?? [],
    popular: api.isPopular,
    featured: api.isFeatured,
    tags: [api.categorySlug, api.scientificName, api.name].filter(Boolean) as string[],
  }
}

function normalizeDashboardResponse(data: ApiDashboardResponse): DashboardSnapshot {
  const categories = (data.recentCategories ?? []).map(mapApiCategoryToCategory)
  return {
    categories,
    featuredDrugs: (data.featuredDrugs ?? []).map(mapApiDrugToDrug),
    popularDrugs: (data.popularDrugs ?? []).map(mapApiDrugToDrug),
    companies: [],
    searchSuggestions: [],
  }
}

/**
 * Combined payload used by the doctor dashboard to avoid multiple
 * UI-specific joins inside the page component.
 */
export interface DashboardSnapshot {
  categories: Category[]
  featuredDrugs: Drug[]
  popularDrugs: Drug[]
  companies: Company[]
  searchSuggestions: string[]
}

/**
 * Contract for all catalog reads. The UI depends on this interface,
 * not on whether data comes from mock files or an HTTP backend.
 */
export interface CatalogService {
  getDashboardSnapshot: () => Promise<DashboardSnapshot>
  getCategories: () => Promise<Category[]>
  getCategoryBySlug: (slug: string) => Promise<Category | undefined>
  getDrugsByCategory: (slug: string) => Promise<Drug[]>
  getDrugById: (drugId: string) => Promise<Drug | undefined>
  searchDrugs: (query: string) => Promise<Drug[]>
  getCompanies: () => Promise<Company[]>
  getAllDrugs: () => Promise<Drug[]>
}

const mockCatalogService: CatalogService = {
  async getDashboardSnapshot() {
    await delay(600)
    return {
      categories: mockCategories,
      featuredDrugs: mockDrugs.filter((drug) => drug.featured).slice(0, 8),
      popularDrugs: mockDrugs.filter((drug) => drug.popular).slice(0, 8),
      companies: mockCompanies,
      searchSuggestions: mockSearchSuggestions,
    }
  },
  async getCategories() {
    await delay(300)
    return mockCategories
  },
  async getCategoryBySlug(slug) {
    await delay(250)
    return mockCategories.find((category) => category.slug === slug)
  },
  async getDrugsByCategory(slug) {
    await delay(450)
    return mockDrugs.filter((drug) => drug.id.startsWith(`${slug}-`))
  },
  async getDrugById(drugId) {
    await delay(320)
    return mockDrugs.find((drug) => drug.id === drugId)
  },
  async searchDrugs(query) {
    await delay(420)
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return mockDrugs
    }

    return mockDrugs.filter((drug) =>
      [drug.name, drug.scientificName, drug.categoryName, drug.companyName, drug.description, ...drug.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  },
  async getCompanies() {
    await delay(250)
    return mockCompanies
  },
  async getAllDrugs() {
    await delay(320)
    return mockDrugs
  },
}

const apiCatalogService: CatalogService = {
  async getDashboardSnapshot() {
    const response = await apiClient.get<ApiDashboardResponse>('/doctor/catalog/dashboard')
    return normalizeDashboardResponse(response.data)
  },
  async getCategories() {
    const response = await apiClient.get<Category[]>('/doctor/catalog/categories')
    return response.data
  },
  async getCategoryBySlug(slug) {
    const response = await apiClient.get<Category>(`/doctor/catalog/categories/${slug}`)
    return response.data
  },
  async getDrugsByCategory(slug) {
    const response = await apiClient.get<Drug[]>(`/doctor/catalog/categories/${slug}/drugs`)
    return response.data
  },
  async getDrugById(drugId) {
    const response = await apiClient.get<Drug>(`/doctor/catalog/drugs/${drugId}`)
    return response.data
  },
  async searchDrugs(query) {
    const response = await apiClient.get<Drug[]>('/doctor/catalog/search', {
      params: { q: query },
    })
    return response.data
  },
  async getCompanies() {
    const response = await apiClient.get<Company[]>('/doctor/catalog/companies')
    return response.data
  },
  async getAllDrugs() {
    const response = await apiClient.get<Drug[]>('/doctor/catalog/drugs')
    return response.data
  },
}

/**
 * Catalog gateway used by pages to retrieve categories, drugs,
 * search results, favourites, and dashboard-ready data.
 */
export const catalogService = appConfig.useMock ? mockCatalogService : apiCatalogService
