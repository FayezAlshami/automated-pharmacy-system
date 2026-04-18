export type AdminRole = 'admin' | 'pharmacist'
export type DoctorRole = 'doctor' | 'assistant'
export type OrderStatus = 'pending' | 'success' | 'rejected' | 'review'
export type DoctorSignupRequestStatus = 'pending' | 'under_review' | 'approved' | 'rejected'
export type AdminLanguage = 'ar' | 'en'
export type AdminTheme = 'light' | 'dark'

/**
 * Session user allowed to access the admin dashboard.
 */
export interface AdminSessionUser {
  id: string
  name: string
  email: string
  /** Present in mock mode; API may omit after login. */
  password?: string
  role: AdminRole
}

/**
 * Doctor or assistant record shaped after the conceptual doctors table.
 */
export interface DoctorRecord {
  doctor_id: string
  fname: string
  email: string
  phone: string
  role: DoctorRole
  created_at: string
  updated_at: string
}

/**
 * Doctor account creation request coming from the doctor portal and awaiting
 * admin or pharmacist review before final activation.
 */
export interface DoctorSignupRequestRecord {
  request_id: string
  full_name: string
  email: string
  phone: string
  specialty: string
  clinic_name: string
  requested_role: Extract<DoctorRole, 'doctor'>
  source_app: 'doctor-portal-app'
  status: DoctorSignupRequestStatus
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  review_note?: string
}

/**
 * Drug category record shaped after the conceptual drug_category table.
 */
export interface DrugCategoryRecord {
  category_id: string
  name_category: string
}

/**
 * Company record linked to a category.
 */
export interface CompanyDrugRecord {
  company_id: string
  name_company: string
  category_id: string
  created_at: string
}

/**
 * Inventory drug record shaped after the conceptual drugs table.
 */
export interface DrugRecord {
  drug_id: string
  dname: string
  category_id: string
  company_id: string
  price: number
  amount: number
  pin: string
  machine_column: string
  created_at: string
}

/**
 * Order header record shaped after the conceptual orders table.
 */
export interface OrderRecord {
  order_id: string
  doctor_id: string
  status: OrderStatus
  total_price: number
  is_pay: boolean
  created_at: string
  updated_at: string
}

/**
 * Order line record shaped after the conceptual details_order table.
 */
export interface OrderDetailRecord {
  order_detail_id: string
  order_id: string
  drug_id: string
  number_of_drug: number
  price_of_one_drug: number
}

/**
 * Patient or beneficiary record shaped after the conceptual company_patients table.
 */
export interface CompanyPatientRecord {
  patient_id: string
  name_of_patients: string
  nid: string
  company_patients: string
  hash_password: string
  operation_id: string
  created_at: string
}

/**
 * Aggregated metrics displayed on the dashboard home screen.
 */
export interface DashboardStats {
  totalDrugs: number
  totalOrders: number
  pendingOrders: number
  lowStock: number
  successfulOrders: number
  failedOrders: number
}
