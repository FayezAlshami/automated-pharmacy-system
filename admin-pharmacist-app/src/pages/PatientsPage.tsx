import { Plus, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { DataTable, TableEmptyState } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { PageHero } from '@/components/common/PageHero'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'
import type { CompanyPatientRecord } from '@/types/admin'
import { formatDate } from '@/utils/formatters'
import { matchesSearchQuery } from '@/utils/search'

type PatientForm = Omit<CompanyPatientRecord, 'patient_id' | 'created_at'>

const guarantorCompanyOptions = [
  'شركة الرعاية الطبية',
  'مؤسسة التأمين الحديثة',
  'شركة الأمان الصحي',
  'شبكة الضمان التخصصية',
  'برنامج الرعاية المؤسسية',
  'المظلة الطبية المتكاملة',
] as const

export function PatientsPage() {
  const { patients, addPatient, updatePatient, deletePatient } = useAdminStore()
  const { text } = useAdminLocale()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<CompanyPatientRecord | null>(null)
  const [form, setForm] = useState<PatientForm>({
    name_of_patients: '',
    nid: '',
    company_patients: '',
    hash_password: '',
    operation_id: '',
  })

  const filteredPatients = patients.filter((patient) =>
    matchesSearchQuery(search, [
      patient.patient_id,
      patient.name_of_patients,
      patient.nid,
      patient.company_patients,
      patient.operation_id,
      formatDate(patient.created_at),
    ]),
  )

  const resetForm = () => {
    setIsModalOpen(false)
    setEditingPatient(null)
    setForm({
      name_of_patients: '',
      nid: '',
      company_patients: '',
      hash_password: '',
      operation_id: '',
    })
  }

  const tableColumns = [
    { key: 'patient', label: text('المريض', 'Patient') },
    { key: 'nid', label: text('الرقم الوطني', 'National ID') },
    { key: 'company', label: text('الجهة الضامنة', 'Guarantor') },
    { key: 'operation', label: text('العملية', 'Operation') },
    { key: 'created', label: text('تاريخ الإضافة', 'Created At') },
    { key: 'actions', label: text('إجراءات', 'Actions') },
  ]

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={text('دليل المرضى', 'Patients Directory')}
        title={text('المرضى والمستفيدون', 'Patients and Beneficiaries')}
        description={text(
          'عرض أوضح لبيانات المرضى مع تسهيل الربط بالعمليات والجهة الضامنة والوصول السريع لتفاصيل كل سجل.',
          'A clearer patient view with better linkage to operations, guarantor entities, and quick record details.',
        )}
        action={
          <button
            className="button-primary"
            onClick={() => {
              resetForm()
              setIsModalOpen(true)
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            {text('إضافة مريض', 'Add Patient')}
          </button>
        }
        meta={
          <>
            <span className="summary-chip">
              {text('إجمالي المرضى', 'Total Patients')}: {patients.length}
            </span>
            <span className="summary-chip">
              {text('النتائج الحالية', 'Current Results')}: {filteredPatients.length}
            </span>
          </>
        }
      />

      <section className="toolbar-panel">
        <label className="relative block">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slateAdmin-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={text(
              'ابحث بالاسم أو الرقم الوطني أو الجهة أو رقم العملية',
              'Search by name, national ID, guarantor, or operation ID',
            )}
            className="field-input pr-12"
          />
        </label>
      </section>

      <DataTable columns={tableColumns} minWidthClassName="min-w-[1120px]">
        {filteredPatients.length === 0 ? (
          <TableEmptyState
            colSpan={tableColumns.length}
            title={text('لا توجد سجلات مرضى مطابقة', 'No matching patient records')}
            description={text(
              'تحقق من المصطلح المستخدم أو أضف سجلًا جديدًا.',
              'Check the current term or add a new patient record.',
            )}
          />
        ) : (
          filteredPatients.map((patient) => (
            <tr key={patient.patient_id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3 text-slateAdmin-700">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slateAdmin-950">{patient.name_of_patients}</p>
                    <p className="mt-1 text-xs text-slateAdmin-500">{patient.patient_id}</p>
                  </div>
                </div>
              </td>
              <td className="font-semibold text-slateAdmin-900">{patient.nid}</td>
              <td>
                <p className="font-semibold text-slateAdmin-900">{patient.company_patients}</p>
              </td>
              <td>
                <p className="font-semibold text-slateAdmin-900">{patient.operation_id}</p>
              </td>
              <td>{formatDate(patient.created_at)}</td>
              <td>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="button-secondary px-4 py-2.5 text-sm"
                    onClick={() => {
                      setEditingPatient(patient)
                      setForm({
                        name_of_patients: patient.name_of_patients,
                        nid: patient.nid,
                        company_patients: patient.company_patients,
                        hash_password: patient.hash_password,
                        operation_id: patient.operation_id,
                      })
                      setIsModalOpen(true)
                    }}
                    type="button"
                  >
                    {text('تعديل', 'Edit')}
                  </button>
                  <button
                    className="button-danger px-4 py-2.5 text-sm"
                    onClick={() => deletePatient(patient.patient_id)}
                    type="button"
                  >
                    {text('حذف', 'Delete')}
                  </button>
                  <Link
                    to={`/app/details/patient/${patient.patient_id}`}
                    className="button-secondary px-4 py-2.5 text-sm"
                  >
                    {text('صفحة التفاصيل', 'Details Page')}
                  </Link>
                </div>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      <Modal
        open={isModalOpen}
        title={editingPatient ? text('تعديل مريض', 'Edit Patient') : text('إضافة مريض', 'Add Patient')}
        onClose={resetForm}
        footer={
          <>
            <button className="button-secondary" onClick={resetForm} type="button">
              {text('إلغاء', 'Cancel')}
            </button>
            <button
              className="button-primary"
              onClick={() => {
                if (editingPatient) {
                  updatePatient({
                    ...editingPatient,
                    ...form,
                  })
                } else {
                  addPatient(form)
                }
                resetForm()
              }}
              type="button"
            >
              {text('حفظ', 'Save')}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slateAdmin-700">
              {text('اسم المريض', 'Patient Name')}
            </span>
            <input
              value={form.name_of_patients}
              onChange={(event) => setForm({ ...form, name_of_patients: event.target.value })}
              placeholder={text('أدخل اسم المريض الكامل', 'Enter the full patient name')}
              className="field-input"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slateAdmin-700">
              {text('الرقم الوطني', 'National ID')}
            </span>
            <input
              value={form.nid}
              onChange={(event) => setForm({ ...form, nid: event.target.value })}
              placeholder={text('أدخل الرقم الوطني', 'Enter the national ID')}
              className="field-input"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slateAdmin-700">
              {text('الجهة أو الشركة الضامنة', 'Guarantor Company')}
            </span>
            <select
              value={form.company_patients}
              onChange={(event) => setForm({ ...form, company_patients: event.target.value })}
              className="field-select"
            >
              <option value="">{text('اختر الجهة الضامنة', 'Select the guarantor')}</option>
              {guarantorCompanyOptions.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slateAdmin-700">
              {text('رقم العملية', 'Operation ID')}
            </span>
            <input
              value={form.operation_id}
              onChange={(event) => setForm({ ...form, operation_id: event.target.value })}
              placeholder={text('أدخل رقم العملية المرتبطة', 'Enter the linked operation ID')}
              className="field-input"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slateAdmin-700">
              {text('قيمة hash_password', 'hash_password Value')}
            </span>
            <input
              value={form.hash_password}
              onChange={(event) => setForm({ ...form, hash_password: event.target.value })}
              placeholder={text(
                'أدخل قيمة التحقق أو كلمة المرور المشفرة',
                'Enter the hash value or encrypted password',
              )}
              className="field-input"
            />
          </label>
        </div>
      </Modal>
    </div>
  )
}
