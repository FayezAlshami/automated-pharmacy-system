import { Building2, Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { DataTable, TableEmptyState } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { PageHero } from '@/components/common/PageHero'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'
import type { CompanyDrugRecord } from '@/types/admin'
import { formatDate } from '@/utils/formatters'
import { matchesSearchQuery } from '@/utils/search'

type CompanyFormState = Omit<CompanyDrugRecord, 'company_id' | 'created_at'>

export function CompaniesPage() {
  const { companies, categories, drugs, addCompany, updateCompany, deleteCompany } = useAdminStore()
  const { text } = useAdminLocale()
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CompanyDrugRecord | null>(null)
  const [form, setForm] = useState<CompanyFormState>({
    name_company: '',
    category_id: categories[0]?.category_id ?? '',
  })

  const categoryMap = new Map(categories.map((category) => [category.category_id, category]))

  const filteredCompanies = companies.filter((company) => {
    const category = categoryMap.get(company.category_id)
    const suppliedCount = drugs.filter((drug) => drug.company_id === company.company_id).length

    return matchesSearchQuery(search, [
      company.company_id,
      company.name_company,
      category?.name_category,
      suppliedCount,
      formatDate(company.created_at),
    ])
  })

  const resetForm = () => {
    setIsFormOpen(false)
    setEditingCompany(null)
    setForm({
      name_company: '',
      category_id: categories[0]?.category_id ?? '',
    })
  }

  const tableColumns = [
    { key: 'company', label: text('الشركة', 'Company') },
    { key: 'category', label: text('التصنيف المرتبط', 'Linked Category') },
    { key: 'supplied', label: text('الأدوية المرتبطة', 'Linked Drugs') },
    { key: 'created', label: text('تاريخ الإضافة', 'Created At') },
    { key: 'actions', label: text('إجراءات', 'Actions') },
  ]

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={text('شبكة الموردين', 'Suppliers Network')}
        title={text('إدارة الشركات', 'Companies Management')}
        description={text(
          'عرض أكثر احترافية للشركات المورّدة مع توضيح التصنيف المرتبط وعدد الأدوية التابعة لكل شركة.',
          'A more polished supplier view with clearer category linkage and drug counts for each company.',
        )}
        action={
          <button
            className="button-primary"
            onClick={() => {
              resetForm()
              setIsFormOpen(true)
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            {text('إضافة شركة', 'Add Company')}
          </button>
        }
        meta={
          <>
            <span className="summary-chip">
              {text('إجمالي الشركات', 'Total Companies')}: {companies.length}
            </span>
            <span className="summary-chip">
              {text('الشركات المعروضة', 'Visible Companies')}: {filteredCompanies.length}
            </span>
            <span className="summary-chip">
              {text('الأدوية المسجلة', 'Registered Drugs')}: {drugs.length}
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
              'ابحث باسم الشركة أو التصنيف أو تاريخ الإضافة',
              'Search by company, category, or created date',
            )}
            className="field-input pr-12"
          />
        </label>
      </section>

      <DataTable columns={tableColumns} minWidthClassName="min-w-[980px]">
        {filteredCompanies.length === 0 ? (
          <TableEmptyState
            colSpan={tableColumns.length}
            title={text('لا توجد شركات مطابقة', 'No matching companies')}
            description={text(
              'يمكنك تجربة اسم مختلف أو إضافة شركة جديدة.',
              'Try a different term or add a new company.',
            )}
          />
        ) : (
          filteredCompanies.map((company) => {
            const category = categoryMap.get(company.category_id)
            const suppliedCount = drugs.filter((drug) => drug.company_id === company.company_id).length

            return (
              <tr key={company.company_id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3 text-slateAdmin-700">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slateAdmin-950">{company.name_company}</p>
                      <p className="mt-1 text-xs text-slateAdmin-500">{company.company_id}</p>
                    </div>
                  </div>
                </td>
                <td className="font-semibold text-slateAdmin-900">{category?.name_category ?? '-'}</td>
                <td>
                  <p className="text-lg font-bold text-slateAdmin-950">{suppliedCount}</p>
                  <p className="mt-1 text-xs text-slateAdmin-500">
                    {text('دواء مسجل على هذه الشركة', 'drugs linked to this company')}
                  </p>
                </td>
                <td>
                  <p className="font-semibold text-slateAdmin-900">{formatDate(company.created_at)}</p>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="button-secondary px-4 py-2.5 text-sm"
                      onClick={() => {
                        setEditingCompany(company)
                        setIsFormOpen(true)
                        setForm({
                          name_company: company.name_company,
                          category_id: company.category_id,
                        })
                      }}
                      type="button"
                    >
                      {text('تعديل', 'Edit')}
                    </button>
                    <button
                      className="button-danger px-4 py-2.5 text-sm"
                      onClick={() => deleteCompany(company.company_id)}
                      type="button"
                    >
                      {text('حذف', 'Delete')}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })
        )}
      </DataTable>

      <Modal
        open={isFormOpen}
        title={editingCompany ? text('تعديل شركة', 'Edit Company') : text('إضافة شركة', 'Add Company')}
        onClose={resetForm}
        footer={
          <>
            <button className="button-secondary" onClick={resetForm} type="button">
              {text('إلغاء', 'Cancel')}
            </button>
            <button
              className="button-primary"
              onClick={() => {
                if (editingCompany) {
                  updateCompany({
                    ...editingCompany,
                    ...form,
                  })
                } else {
                  addCompany(form)
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
        <div className="grid gap-4">
          <input
            value={form.name_company}
            onChange={(event) => setForm({ ...form, name_company: event.target.value })}
            placeholder={text('اسم الشركة', 'Company Name')}
            className="field-input"
          />
          <select
            value={form.category_id}
            onChange={(event) => setForm({ ...form, category_id: event.target.value })}
            className="field-select"
          >
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name_category}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  )
}
