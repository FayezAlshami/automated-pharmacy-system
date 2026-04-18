export type PortalLanguage = 'ar' | 'en'
export type DoctorRole = 'doctor' | 'assistant'
export type AvailabilityStatus = 'in_stock' | 'limited' | 'out_of_stock'
export type OrderStatus = 'completed' | 'pending' | 'review'

/**
 * Canonical doctor account shape used across authentication,
 * header rendering, and persisted session restoration.
 */
/** حالة الحساب عند الربط بالـ API (الموافقة الإدارية) */
export type DoctorAccountStatus = 'pending' | 'active' | 'rejected'

export interface DoctorAccount {
  id: string
  fullName: string
  email: string
  password: string
  specialty: string
  phone: string
  clinicName: string
  licenseNumber: string
  role: DoctorRole
  joinedAt: string
  /** من الخادم عند التسجيل/الموافقة؛ غائب في وضع المحاكاة = يُعامل كـ active */
  status?: DoctorAccountStatus
}

/**
 * Login payload shared by mock and API authentication flows.
 */
export interface AuthPayload {
  email: string
  password: string
}

/**
 * Registration payload for new doctor accounts.
 */
export interface SignupPayload extends AuthPayload {
  fullName: string
  specialty: string
  phone: string
  clinicName: string
}

/**
 * Visual category card shown on the dashboard and category listings.
 */
export interface Category {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  accent: string
  drugCount: number
}

/**
 * Manufacturer record used by filters and catalog metadata.
 */
export interface Company {
  id: string
  name: string
  country: string
  categoryIds: string[]
}

/**
 * Primary catalog entity returned to listing, search, and details pages.
 */
export interface Drug {
  id: string
  name: string
  scientificName: string
  categoryId: string
  categoryName: string
  companyId: string
  companyName: string
  dosage: string
  description: string
  price: number
  stock: number
  availability: AvailabilityStatus
  warnings: string[]
  popular: boolean
  featured: boolean
  tags: string[]
}

/**
 * Lightweight order summary displayed in the dashboard and order records page.
 */
export interface RecentOrder {
  id: string
  doctorId: string
  createdAt: string
  status: OrderStatus
  totalPrice: number
  itemCount: number
}

/**
 * Item model persisted inside the doctor cart store.
 */
export interface CartItem {
  drug: Drug
  quantity: number
}

/**
 * Local filter model shared by category and search result experiences.
 */
export interface SearchFilterState {
  query: string
  availability: 'all' | AvailabilityStatus
  companyId: 'all' | string
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'name'
}

/**
 * Returned after a successful checkout to drive QR code generation.
 */
export interface CheckoutResult {
  orderId: number
  operationId: string
  totalPrice: number
  itemCount: number
  createdAt: string
}
