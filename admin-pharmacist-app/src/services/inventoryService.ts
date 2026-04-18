import { apiClient } from '@/config/axios'
import { appConfig } from '@/config/appConfig'
import { mockCategories, mockCompanies, mockDrugs } from '@/mocks/data/adminData'
import type { CompanyDrugRecord, DrugCategoryRecord, DrugRecord } from '@/types/admin'
import { delay } from '@/utils/delay'

/**
 * Bootstrap inventory payload used to initialise the admin dashboard.
 */
export interface InventoryBundle {
  categories: DrugCategoryRecord[]
  companies: CompanyDrugRecord[]
  drugs: DrugRecord[]
}

const mockInventoryService = {
  async getInventoryBundle(): Promise<InventoryBundle> {
    await delay(350)
    return {
      categories: mockCategories,
      companies: mockCompanies,
      drugs: mockDrugs,
    }
  },
}

const apiInventoryService = {
  async getInventoryBundle(): Promise<InventoryBundle> {
    const response = await apiClient.get<InventoryBundle>('/admin/inventory/bootstrap')
    return response.data
  },
}

/**
 * Inventory gateway for categories, companies, and drugs.
 */
export const inventoryService = appConfig.useMock
  ? mockInventoryService
  : apiInventoryService
