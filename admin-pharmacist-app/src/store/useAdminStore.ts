import { create } from 'zustand'

import { authService } from '@/services/authService'
import { doctorSignupRequestService } from '@/services/doctorSignupRequestService'
import { inventoryService } from '@/services/inventoryService'
import { orderService } from '@/services/orderService'
import { patientService } from '@/services/patientService'
import { userService } from '@/services/userService'
import type {
  AdminLanguage,
  AdminSessionUser,
  AdminTheme,
  CompanyDrugRecord,
  CompanyPatientRecord,
  DoctorRecord,
  DoctorSignupRequestRecord,
  DoctorSignupRequestStatus,
  DrugCategoryRecord,
  DrugRecord,
  OrderDetailRecord,
  OrderRecord,
  OrderStatus,
} from '@/types/admin'
import { appConfig } from '@/config/appConfig'
import { createId } from '@/utils/identifiers'
import {
  readAdminLanguage,
  readAdminSession,
  readAdminTheme,
  readAuthToken,
  writeAdminLanguage,
  writeAdminSession,
  writeAdminTheme,
  writeAuthToken,
} from '@/utils/storage'

/**
 * Central admin dashboard state containing the current session and
 * all locally editable entities used by the management screens.
 */
interface AdminState {
  sessionUser?: AdminSessionUser
  loginError?: string
  isAuthLoading: boolean
  language: AdminLanguage
  theme: AdminTheme
  categories: DrugCategoryRecord[]
  companies: CompanyDrugRecord[]
  drugs: DrugRecord[]
  doctors: DoctorRecord[]
  doctorSignupRequests: DoctorSignupRequestRecord[]
  orders: OrderRecord[]
  orderDetails: OrderDetailRecord[]
  patients: CompanyPatientRecord[]
  initialise: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setLanguage: (language: AdminLanguage) => void
  toggleLanguage: () => void
  setTheme: (theme: AdminTheme) => void
  toggleTheme: () => void
  addCategory: (name_category: string) => void
  updateCategory: (category: DrugCategoryRecord) => void
  deleteCategory: (categoryId: string) => void
  addCompany: (company: Omit<CompanyDrugRecord, 'company_id' | 'created_at'>) => void
  updateCompany: (company: CompanyDrugRecord) => void
  deleteCompany: (companyId: string) => void
  addDrug: (drug: Omit<DrugRecord, 'drug_id' | 'created_at'>) => void
  updateDrug: (drug: DrugRecord) => void
  deleteDrug: (drugId: string) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  addDoctor: (doctor: Omit<DoctorRecord, 'doctor_id' | 'created_at' | 'updated_at'>) => void
  updateDoctor: (doctor: DoctorRecord) => void
  deleteDoctor: (doctorId: string) => void
  setDoctorSignupRequestStatus: (
    requestId: string,
    status: DoctorSignupRequestStatus,
    reviewNote?: string,
  ) => void
  addPatient: (
    patient: Omit<CompanyPatientRecord, 'patient_id' | 'created_at'>,
  ) => void
  updatePatient: (patient: CompanyPatientRecord) => void
  deletePatient: (patientId: string) => void
}

/**
 * Admin store responsible for session hydration, initial data loading,
 * and all front-end-only CRUD interactions.
 */
export const useAdminStore = create<AdminState>((set, get) => ({
  sessionUser: undefined,
  loginError: undefined,
  isAuthLoading: false,
  language: 'ar',
  theme: 'light',
  categories: [],
  companies: [],
  drugs: [],
  doctors: [],
  doctorSignupRequests: [],
  orders: [],
  orderDetails: [],
  patients: [],
  async initialise() {
    const storedUserId = readAdminSession()
    const storedLanguage = readAdminLanguage()
    const storedTheme = readAdminTheme()

    const emptyLists = {
      categories: [] as DrugCategoryRecord[],
      companies: [] as CompanyDrugRecord[],
      drugs: [] as DrugRecord[],
      orders: [] as OrderRecord[],
      orderDetails: [] as OrderDetailRecord[],
      doctors: [] as DoctorRecord[],
      doctorSignupRequests: [] as DoctorSignupRequestRecord[],
      patients: [] as CompanyPatientRecord[],
    }

    /*
     * وضع API: كل واجهات /admin/* تتطلب Bearer JWT.
     * صفحة /login تُحمَّل بدون توكن — استدعاء البيانات هنا يُرجع 401 ويرفض Promise.all
     * فيبقى PublicOutlet في حالة skeleton إلى الأبد.
     * الحل: لا نطلب البيانات إلا عند وجود توكن (أو في وضع المحاكاة).
     */
    if (!appConfig.useMock && !readAuthToken()) {
      set({
        ...emptyLists,
        language: storedLanguage,
        theme: storedTheme,
        sessionUser: undefined,
      })
      return
    }

    try {
      const [inventoryBundle, orderBundle, doctorData, doctorSignupRequestData, patientData, sessionUser] =
        await Promise.all([
          inventoryService.getInventoryBundle(),
          orderService.getOrderBundle(),
          userService.getDoctors(),
          doctorSignupRequestService.getDoctorSignupRequests(),
          patientService.getPatients(),
          storedUserId ? authService.getUserById(storedUserId) : Promise.resolve(undefined),
        ])

      set({
        categories: inventoryBundle.categories,
        companies: inventoryBundle.companies,
        drugs: inventoryBundle.drugs,
        language: storedLanguage,
        theme: storedTheme,
        orders: orderBundle.orders,
        orderDetails: orderBundle.orderDetails,
        doctors: doctorData,
        doctorSignupRequests: doctorSignupRequestData,
        patients: patientData,
        sessionUser,
      })
    } catch {
      writeAuthToken(null)
      writeAdminSession(null)
      set({
        ...emptyLists,
        language: storedLanguage,
        theme: storedTheme,
        sessionUser: undefined,
      })
    }
  },
  async login(email, password) {
    set({ isAuthLoading: true, loginError: undefined })

    try {
      const user = await authService.login(email, password)
      writeAdminSession(user.id)
      set({ sessionUser: user, isAuthLoading: false })
      return true
    } catch (error) {
      set({
        isAuthLoading: false,
        loginError: error instanceof Error ? error.message : 'فشل تسجيل الدخول.',
      })
      return false
    }
  },
  logout() {
    writeAuthToken(null)
    writeAdminSession(null)
    set({ sessionUser: undefined, loginError: undefined })
  },
  setLanguage(language) {
    writeAdminLanguage(language)
    set({ language })
  },
  toggleLanguage() {
    const nextLanguage = get().language === 'ar' ? 'en' : 'ar'
    writeAdminLanguage(nextLanguage)
    set({ language: nextLanguage })
  },
  setTheme(theme) {
    writeAdminTheme(theme)
    set({ theme })
  },
  toggleTheme() {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light'
    writeAdminTheme(nextTheme)
    set({ theme: nextTheme })
  },
  addCategory(name_category) {
    set({
      categories: [
        ...get().categories,
        {
          category_id: createId('CAT'),
          name_category,
        },
      ],
    })
  },
  updateCategory(category) {
    set({
      categories: get().categories.map((item) =>
        item.category_id === category.category_id ? category : item,
      ),
    })
  },
  deleteCategory(categoryId) {
    set({
      categories: get().categories.filter((item) => item.category_id !== categoryId),
    })
  },
  addCompany(company) {
    set({
      companies: [
        ...get().companies,
        {
          ...company,
          company_id: createId('CMP'),
          created_at: new Date().toISOString(),
        },
      ],
    })
  },
  updateCompany(company) {
    set({
      companies: get().companies.map((item) =>
        item.company_id === company.company_id ? company : item,
      ),
    })
  },
  deleteCompany(companyId) {
    set({
      companies: get().companies.filter((item) => item.company_id !== companyId),
    })
  },
  addDrug(drug) {
    set({
      drugs: [
        ...get().drugs,
        {
          ...drug,
          drug_id: createId('DRG'),
          created_at: new Date().toISOString(),
        },
      ],
    })
  },
  updateDrug(drug) {
    set({
      drugs: get().drugs.map((item) => (item.drug_id === drug.drug_id ? drug : item)),
    })
  },
  deleteDrug(drugId) {
    set({
      drugs: get().drugs.filter((item) => item.drug_id !== drugId),
    })
  },
  updateOrderStatus(orderId, status) {
    set({
      orders: get().orders.map((order) =>
        order.order_id === orderId
          ? { ...order, status, updated_at: new Date().toISOString() }
          : order,
      ),
    })
  },
  addDoctor(doctor) {
    set({
      doctors: [
        ...get().doctors,
        {
          ...doctor,
          doctor_id: createId('DOC'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })
  },
  updateDoctor(doctor) {
    set({
      doctors: get().doctors.map((item) =>
        item.doctor_id === doctor.doctor_id ? doctor : item,
      ),
    })
  },
  deleteDoctor(doctorId) {
    set({
      doctors: get().doctors.filter((item) => item.doctor_id !== doctorId),
    })
  },
  setDoctorSignupRequestStatus(requestId, status, reviewNote) {
    const request = get().doctorSignupRequests.find((item) => item.request_id === requestId)

    if (!request) {
      return
    }

    const reviewedAt = new Date().toISOString()
    const reviewedBy = get().sessionUser?.name ?? 'مستخدم إداري'

    set({
      doctorSignupRequests: get().doctorSignupRequests.map((item) =>
        item.request_id === requestId
          ? {
              ...item,
              status,
              reviewed_at: reviewedAt,
              reviewed_by: reviewedBy,
              review_note: reviewNote?.trim() || item.review_note,
            }
          : item,
      ),
      doctors:
        status === 'approved' && !get().doctors.some((doctor) => doctor.email === request.email)
          ? [
              ...get().doctors,
              {
                doctor_id: createId('DOC'),
                fname: request.full_name,
                email: request.email,
                phone: request.phone,
                role: request.requested_role,
                created_at: reviewedAt,
                updated_at: reviewedAt,
              },
            ]
          : get().doctors,
    })
  },
  addPatient(patient) {
    set({
      patients: [
        ...get().patients,
        {
          ...patient,
          patient_id: createId('PAT'),
          created_at: new Date().toISOString(),
        },
      ],
    })
  },
  updatePatient(patient) {
    set({
      patients: get().patients.map((item) =>
        item.patient_id === patient.patient_id ? patient : item,
      ),
    })
  },
  deletePatient(patientId) {
    set({
      patients: get().patients.filter((item) => item.patient_id !== patientId),
    })
  },
}))
