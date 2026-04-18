import { Plus, Search, Stethoscope } from 'lucide-react'
import { useState } from 'react'

import { DataTable, TableEmptyState } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { PageHero } from '@/components/common/PageHero'
import { StatusPill } from '@/components/common/StatusPill'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'
import type { DoctorRecord } from '@/types/admin'
import { formatDate } from '@/utils/formatters'
import { matchesSearchQuery } from '@/utils/search'

type DoctorForm = Omit<DoctorRecord, 'doctor_id' | 'created_at' | 'updated_at'>

export function UsersPage() {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useAdminStore()
  const { text } = useAdminLocale()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'doctor' | 'assistant'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<DoctorRecord | null>(null)
  const [form, setForm] = useState<DoctorForm>({
    fname: '',
    email: '',
    phone: '',
    role: 'doctor',
  })

  const roleLabels = {
    doctor: text('طبيب', 'Doctor'),
    assistant: text('مساعد', 'Assistant'),
  } as const

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = matchesSearchQuery(search, [
      doctor.doctor_id,
      doctor.fname,
      doctor.email,
      doctor.phone,
      doctor.role,
      roleLabels[doctor.role],
      formatDate(doctor.updated_at),
    ])

    const matchesRole = roleFilter === 'all' || doctor.role === roleFilter
    return matchesSearch && matchesRole
  })

  const resetForm = () => {
    setIsModalOpen(false)
    setEditingDoctor(null)
    setForm({
      fname: '',
      email: '',
      phone: '',
      role: 'doctor',
    })
  }

  const tableColumns = [
    { key: 'name', label: text('المستخدم', 'User') },
    { key: 'email', label: text('البريد الإلكتروني', 'Email') },
    { key: 'phone', label: text('الهاتف', 'Phone') },
    { key: 'role', label: text('الدور', 'Role') },
    { key: 'updated', label: text('آخر تحديث', 'Last Updated') },
    { key: 'actions', label: text('إجراءات', 'Actions') },
  ]

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={text('إدارة الوصول', 'Access Management')}
        title={text('إدارة المستخدمين', 'Users Management')}
        description={text(
          'سجلات الأطباء والمساعدين مع بحث وتصفية وتعديل من مكان واحد.',
          'Doctor and assistant records with search, filters, and editing in one place.',
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
            {text('إضافة مستخدم', 'Add User')}
          </button>
        }
        meta={
          <>
            <span className="summary-chip">
              {text('إجمالي المستخدمين', 'Total Users')}: {doctors.length}
            </span>
            <span className="summary-chip">
              {text('الأطباء', 'Doctors')}: {doctors.filter((doctor) => doctor.role === 'doctor').length}
            </span>
            <span className="summary-chip">
              {text('المساعدون', 'Assistants')}: {doctors.filter((doctor) => doctor.role === 'assistant').length}
            </span>
            <span className="summary-chip">
              {text('الحسابات المعتمدة تظهر هنا بعد قبولها', 'Approved accounts appear here after acceptance')}
            </span>
          </>
        }
      />

      <section className="toolbar-panel">
        <div className="grid gap-4 lg:grid-cols-[1.45fr_0.75fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slateAdmin-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={text(
                'ابحث بالاسم أو البريد أو الهاتف أو الدور',
                'Search by name, email, phone, or role',
              )}
              className="field-input pr-12"
            />
          </label>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
            className="field-select"
          >
            <option value="all">{text('كل الأدوار', 'All Roles')}</option>
            <option value="doctor">{text('طبيب', 'Doctor')}</option>
            <option value="assistant">{text('مساعد', 'Assistant')}</option>
          </select>
        </div>
      </section>

      <DataTable columns={tableColumns} minWidthClassName="min-w-[1120px]">
        {filteredDoctors.length === 0 ? (
          <TableEmptyState
            colSpan={tableColumns.length}
            title={text('لا توجد نتائج مطابقة', 'No matching results')}
            description={text(
              'جرّب تغيير مصطلح البحث أو اختيار دور آخر.',
              'Try a different search term or another role filter.',
            )}
          />
        ) : (
          filteredDoctors.map((doctor) => (
            <tr key={doctor.doctor_id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3 text-slateAdmin-700">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slateAdmin-950">{doctor.fname}</p>
                    <p className="mt-1 text-xs text-slateAdmin-500">{doctor.doctor_id}</p>
                  </div>
                </div>
              </td>
              <td className="font-semibold text-slateAdmin-900">{doctor.email}</td>
              <td className="font-semibold text-slateAdmin-900">{doctor.phone}</td>
              <td>
                <StatusPill
                  tone={doctor.role === 'doctor' ? 'success' : 'neutral'}
                  label={roleLabels[doctor.role]}
                />
              </td>
              <td>{formatDate(doctor.updated_at)}</td>
              <td>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="button-secondary px-4 py-2.5 text-sm"
                    onClick={() => {
                      setEditingDoctor(doctor)
                      setForm({
                        fname: doctor.fname,
                        email: doctor.email,
                        phone: doctor.phone,
                        role: doctor.role,
                      })
                      setIsModalOpen(true)
                    }}
                    type="button"
                  >
                    {text('تعديل', 'Edit')}
                  </button>
                  <button
                    className="button-danger px-4 py-2.5 text-sm"
                    onClick={() => deleteDoctor(doctor.doctor_id)}
                    type="button"
                  >
                    {text('حذف', 'Delete')}
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </DataTable>

      <Modal
        open={isModalOpen}
        title={editingDoctor ? text('تعديل مستخدم', 'Edit User') : text('إضافة مستخدم', 'Add User')}
        onClose={resetForm}
        footer={
          <>
            <button className="button-secondary" onClick={resetForm} type="button">
              {text('إلغاء', 'Cancel')}
            </button>
            <button
              className="button-primary"
              onClick={() => {
                if (editingDoctor) {
                  updateDoctor({
                    ...editingDoctor,
                    ...form,
                    updated_at: new Date().toISOString(),
                  })
                } else {
                  addDoctor(form)
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
          <input
            value={form.fname}
            onChange={(event) => setForm({ ...form, fname: event.target.value })}
            placeholder={text('الاسم', 'Name')}
            className="field-input"
          />
          <input
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder={text('البريد الإلكتروني', 'Email')}
            className="field-input"
          />
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder={text('الهاتف', 'Phone')}
            className="field-input"
          />
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value as DoctorForm['role'] })}
            className="field-select"
          >
            <option value="doctor">{text('طبيب', 'Doctor')}</option>
            <option value="assistant">{text('مساعد', 'Assistant')}</option>
          </select>
        </div>
      </Modal>
    </div>
  )
}
