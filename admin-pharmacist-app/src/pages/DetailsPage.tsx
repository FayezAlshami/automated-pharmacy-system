import { ArrowLeftCircle, FileSearch } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { PageHero } from '@/components/common/PageHero'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'
import type { DrugRecord } from '@/types/admin'
import { formatCurrency, formatDate } from '@/utils/formatters'

export function DetailsPage() {
  const { entity = '', id = '' } = useParams()
  const { text } = useAdminLocale()
  const { drugs, orders, doctors, patients, categories, companies } = useAdminStore()

  const entityTitles = {
    drug: text('تفاصيل الدواء', 'Drug Details'),
    order: text('تفاصيل الطلب', 'Order Details'),
    user: text('تفاصيل المستخدم', 'User Details'),
    patient: text('تفاصيل المريض', 'Patient Details'),
  } as const

  const fieldLabels: Record<string, string> = {
    drug_id: text('معرّف الدواء', 'Drug ID'),
    dname: text('اسم الدواء', 'Drug Name'),
    category_id: text('معرّف التصنيف', 'Category ID'),
    company_id: text('معرّف الشركة', 'Company ID'),
    price: text('السعر', 'Price'),
    amount: text('الكمية', 'Quantity'),
    pin: 'PIN',
    machine_column: text('الموقع', 'Location'),
    created_at: text('تاريخ الإنشاء', 'Created At'),
    order_id: text('رقم الطلب', 'Order ID'),
    doctor_id: text('معرّف الطبيب', 'Doctor ID'),
    status: text('الحالة', 'Status'),
    total_price: text('الإجمالي', 'Total'),
    is_pay: text('الدفع', 'Payment'),
    updated_at: text('آخر تحديث', 'Last Updated'),
    fname: text('الاسم', 'Name'),
    email: text('البريد الإلكتروني', 'Email'),
    phone: text('الهاتف', 'Phone'),
    role: text('الدور', 'Role'),
    patient_id: text('معرّف المريض', 'Patient ID'),
    name_of_patients: text('اسم المريض', 'Patient Name'),
    nid: text('الرقم الوطني', 'National ID'),
    company_patients: text('الجهة الضامنة', 'Guarantor'),
    hash_password: 'hash_password',
    operation_id: text('رقم العملية', 'Operation ID'),
  }

  const formatValue = (key: string, value: unknown) => {
    if (typeof value === 'number') {
      return key.includes('price') ? formatCurrency(value) : String(value)
    }

    if (typeof value === 'boolean') {
      return value ? text('نعم', 'Yes') : text('لا', 'No')
    }

    if (typeof value === 'string' && value.includes('T')) {
      return formatDate(value)
    }

    return String(value)
  }

  const entityRecord =
    (entity === 'drug' && drugs.find((item) => item.drug_id === id)) ||
    (entity === 'order' && orders.find((item) => item.order_id === id)) ||
    (entity === 'user' && doctors.find((item) => item.doctor_id === id)) ||
    (entity === 'patient' && patients.find((item) => item.patient_id === id))

  if (!entityRecord) {
    return <div className="dashboard-card p-8 text-lg text-slateAdmin-600">{text('العنصر غير موجود.', 'The item was not found.')}</div>
  }

  const drugRecord = entity === 'drug' ? (entityRecord as DrugRecord) : null
  const relatedCategory =
    drugRecord ? categories.find((category) => category.category_id === drugRecord.category_id) : null
  const relatedCompany =
    drugRecord ? companies.find((company) => company.company_id === drugRecord.company_id) : null

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={text('عرض تفصيلي', 'Detail View')}
        title={entityTitles[entity as keyof typeof entityTitles] ?? text('تفاصيل العنصر', 'Item Details')}
        description={text(
          'عرض منظم لجميع حقول السجل المحدد.',
          'Structured view of all fields for the selected record.',
        )}
        action={
          <Link to="/app/dashboard" className="button-secondary">
            <ArrowLeftCircle className="h-4 w-4" />
            {text('العودة للوحة التحكم', 'Back to Dashboard')}
          </Link>
        }
        meta={
          <>
            <span className="summary-chip">
              {text('المعرّف', 'Identifier')}: {id}
            </span>
            <span className="summary-chip">
              {text('نوع السجل', 'Entity Type')}: {entity}
            </span>
          </>
        }
      />

      <section className="dashboard-card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3 text-slateAdmin-700">
            <FileSearch className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slateAdmin-950">
              {text('البيانات الأساسية', 'Core Information')}
            </h3>
            <p className="mt-1 text-sm text-slateAdmin-500">
              {text(
                'كل الحقول المهمة معروضة في بطاقات منفصلة وواضحة.',
                'All important fields are displayed in clear, separate cards.',
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(entityRecord).map(([key, value]) => (
            <div key={key} className="dashboard-panel p-5">
              <p className="text-sm text-slateAdmin-500">{fieldLabels[key] ?? key}</p>
              <p className="mt-2 text-lg font-bold text-slateAdmin-950">{formatValue(key, value)}</p>
            </div>
          ))}

          {entity === 'drug' ? (
            <>
              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('التصنيف', 'Category')}</p>
                <p className="mt-2 text-lg font-bold text-slateAdmin-950">
                  {relatedCategory?.name_category ?? '-'}
                </p>
              </div>
              <div className="dashboard-panel p-5">
                <p className="text-sm text-slateAdmin-500">{text('الشركة', 'Company')}</p>
                <p className="mt-2 text-lg font-bold text-slateAdmin-950">
                  {relatedCompany?.name_company ?? '-'}
                </p>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
