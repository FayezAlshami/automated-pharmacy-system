import type {
  AdminSessionUser,
  CompanyDrugRecord,
  CompanyPatientRecord,
  DoctorRecord,
  DoctorSignupRequestRecord,
  DrugCategoryRecord,
  DrugRecord,
  OrderDetailRecord,
  OrderRecord,
} from '@/types/admin'

const categoryNames = [
  'مسكنات',
  'أدوية سكر',
  'أدوية قلب',
  'مضادات حيوية',
  'أدوية أطفال',
  'فيتامينات',
  'جهاز هضمي',
  'نسائية',
  'جلدية',
  'تنفسية',
  'أعصاب',
  'حساسية',
]

const companyNames = [
  'Nova Health',
  'Pure Pharma',
  'LifeMed',
  'CardioLab',
  'EndoCare',
  'Respira',
  'Allergy Plus',
  'DigestWell',
  'Sun Care',
  'DermaCore',
]

export const mockAdminUsers: AdminSessionUser[] = [
  {
    id: 'admin-01',
    name: 'fayez',
    email: 'admin@admin.com',
    password: 'fayez',
    role: 'admin',
  },
  {
    id: 'pharm-01',
    name: 'fayez',
    email: 'pharmacist@admin.com',
    password: 'fayez',
    role: 'pharmacist',
  },
]

export const mockCategories: DrugCategoryRecord[] = categoryNames.map((name, index) => ({
  category_id: `CAT-${String(index + 1).padStart(2, '0')}`,
  name_category: name,
}))

export const mockCompanies: CompanyDrugRecord[] = companyNames.map((name, index) => ({
  company_id: `CMP-${String(index + 1).padStart(2, '0')}`,
  name_company: name,
  category_id: mockCategories[index % mockCategories.length].category_id,
  created_at: `2025-0${(index % 8) + 1}-10`,
}))

export const mockDoctors: DoctorRecord[] = Array.from({ length: 10 }, (_, index) => ({
  doctor_id: `DOC-${String(index + 1).padStart(3, '0')}`,
  fname: `مستخدم ${index + 1}`,
  email: `user${index + 1}@automed.test`,
  phone: `+963944100${String(index + 1).padStart(3, '0')}`,
  role: index % 4 === 0 ? 'assistant' : 'doctor',
  created_at: `2025-0${(index % 9) + 1}-12`,
  updated_at: `2026-03-${String((index % 20) + 1).padStart(2, '0')}`,
}))

const specialties = [
  'الطب الباطني',
  'طب الأطفال',
  'أمراض القلب',
  'الأمراض الجلدية',
  'الأعصاب',
  'الغدد الصم',
  'الحساسية والمناعة',
  'الأمراض التنفسية',
]

const clinics = [
  'عيادة الرعاية التخصصية',
  'مركز الشفاء الطبي',
  'مجمع النور السريري',
  'عيادة الأسرة الحديثة',
  'مركز القلب والباطنة',
  'مجمع الأطفال المتقدم',
]

export const mockDoctorSignupRequests: DoctorSignupRequestRecord[] = Array.from(
  { length: 9 },
  (_, index) => ({
    request_id: `REQ-${String(index + 1).padStart(3, '0')}`,
    full_name: `طبيب متقدم ${index + 1}`,
    email: `doctor.request${index + 1}@automed.test`,
    phone: `+963955300${String(index + 1).padStart(3, '0')}`,
    specialty: specialties[index % specialties.length],
    clinic_name: clinics[index % clinics.length],
    requested_role: 'doctor',
    source_app: 'doctor-portal-app',
    status:
      index < 4
        ? 'pending'
        : index < 6
          ? 'under_review'
          : index === 6
            ? 'approved'
            : 'rejected',
    submitted_at: `2026-03-${String(index + 7).padStart(2, '0')}T0${(index % 4) + 8}:20:00`,
    reviewed_at:
      index < 4
        ? undefined
        : `2026-03-${String(index + 10).padStart(2, '0')}T13:10:00`,
    reviewed_by: index < 4 ? undefined : index % 2 === 0 ? 'Maha Admin' : 'Omar Pharmacist',
    review_note:
      index < 4
        ? 'بانتظار التحقق من بيانات الطبيب واعتماد الحساب.'
        : index < 6
          ? 'تمت المراجعة الأولية، بانتظار التأكيد النهائي من الإدارة.'
          : index === 6
            ? 'تم قبول الطلب ونقل الحساب إلى قائمة المستخدمين.'
            : 'تم رفض الطلب لعدم اكتمال بيانات العيادة أو لتكرار البريد الإلكتروني.',
  }),
)

const drugNames = ['Alpha', 'Beta', 'Care', 'Prime']

export const mockDrugs: DrugRecord[] = mockCategories.flatMap((category, categoryIndex) =>
  drugNames.map((label, drugIndex) => ({
    drug_id: `DRG-${String(categoryIndex * 4 + drugIndex + 1).padStart(3, '0')}`,
    dname: `${category.name_category} ${label}`,
    category_id: category.category_id,
    company_id: mockCompanies[(categoryIndex + drugIndex) % mockCompanies.length].company_id,
    price: 12000 + categoryIndex * 1800 + drugIndex * 950,
    amount: ((categoryIndex + 2) * (drugIndex + 3) * 2) % 38,
    pin: `PIN-${categoryIndex + 1}${drugIndex + 1}`,
    machine_column: `C${(categoryIndex % 6) + 1}-S${drugIndex + 1}`,
    created_at: `2025-0${(categoryIndex % 8) + 1}-15`,
  })),
)

export const mockOrders: OrderRecord[] = Array.from({ length: 18 }, (_, index) => ({
  order_id: `ORD-${String(index + 1).padStart(4, '0')}`,
  doctor_id: mockDoctors[index % mockDoctors.length].doctor_id,
  status: index % 5 === 0 ? 'rejected' : index % 2 === 0 ? 'success' : 'pending',
  total_price: 42000 + index * 8500,
  is_pay: index % 3 !== 0,
  created_at: `2026-03-${String((index % 20) + 1).padStart(2, '0')}T09:00:00`,
  updated_at: `2026-03-${String((index % 20) + 1).padStart(2, '0')}T14:20:00`,
}))

export const mockOrderDetails: OrderDetailRecord[] = mockOrders.flatMap((order, index) =>
  [0, 1].map((detailIndex) => {
    const drug = mockDrugs[(index + detailIndex) % mockDrugs.length]
    return {
      order_detail_id: `DET-${index + 1}-${detailIndex + 1}`,
      order_id: order.order_id,
      drug_id: drug.drug_id,
      number_of_drug: detailIndex + 1,
      price_of_one_drug: drug.price,
    }
  }),
)

export const mockPatients: CompanyPatientRecord[] = Array.from({ length: 16 }, (_, index) => ({
  patient_id: `PAT-${String(index + 1).padStart(3, '0')}`,
  name_of_patients: `مريض تجريبي ${index + 1}`,
  nid: `99887${String(index + 1000)}`,
  company_patients: index % 2 === 0 ? 'شركة الرعاية الطبية' : 'مؤسسة التأمين الحديثة',
  hash_password: `hash-demo-${index + 1}`,
  operation_id: mockOrders[index % mockOrders.length].order_id,
  created_at: `2025-11-${String((index % 20) + 1).padStart(2, '0')}`,
}))
