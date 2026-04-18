import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { DataTable, TableEmptyState } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { PageHero } from '@/components/common/PageHero'
import { StatusPill } from '@/components/common/StatusPill'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'
import type { DrugRecord } from '@/types/admin'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { matchesSearchQuery } from '@/utils/search'

type DrugFormState = Omit<DrugRecord, 'drug_id' | 'created_at'>

export function DrugsPage() {
  const { drugs, categories, companies, addDrug, updateDrug, deleteDrug } = useAdminStore()
  const { text } = useAdminLocale()
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDrug, setEditingDrug] = useState<DrugRecord | null>(null)
  const [selectedDrug, setSelectedDrug] = useState<DrugRecord | null>(null)
  const [form, setForm] = useState<DrugFormState>({
    dname: '',
    category_id: '',
    company_id: '',
    price: 0,
    amount: 0,
    pin: '',
    machine_column: '',
  })

  const categoryMap = new Map(categories.map((category) => [category.category_id, category]))
  const companyMap = new Map(companies.map((company) => [company.company_id, company]))

  const filteredDrugs = drugs.filter((drug) => {
    const category = categoryMap.get(drug.category_id)
    const company = companyMap.get(drug.company_id)
    const stockLabel =
      drug.amount === 0 ? 'نفد المخزون' : drug.amount < 10 ? 'مخزون منخفض' : 'متوفر'

    const matchesSearch = matchesSearchQuery(search, [
      drug.drug_id,
      drug.dname,
      drug.pin,
      drug.machine_column,
      category?.name_category,
      company?.name_company,
      drug.price,
      formatCurrency(drug.price),
      drug.amount,
      stockLabel,
      formatDate(drug.created_at),
    ])

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && drug.amount > 0 && drug.amount < 10) ||
      (stockFilter === 'out' && drug.amount === 0)

    return matchesSearch && matchesStock
  })

  const resetForm = () => {
    setIsFormOpen(false)
    setEditingDrug(null)
    setForm({
      dname: '',
      category_id: categories[0]?.category_id ?? '',
      company_id: companies[0]?.company_id ?? '',
      price: 0,
      amount: 0,
      pin: '',
      machine_column: '',
    })
  }

  const tableColumns = [
    { key: 'drug', label: 'الدواء' },
    { key: 'category', label: 'التصنيف' },
    { key: 'company', label: 'الشركة' },
    { key: 'price', label: 'السعر' },
    { key: 'amount', label: 'الكمية' },
    { key: 'location', label: 'الموقع' },
    { key: 'actions', label: 'إجراءات' },
  ]

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={text('المخزون', 'Inventory')}
        title={text('إدارة الأدوية', 'Drug inventory')}
        description={text(
          'بحث وتصفية على مستوى السجل مع جدول واضح للكميات والمواقع.',
          'Search and filter across records with clear quantities and storage locations.',
        )}
        action={
          <button
            className="button-primary"
            onClick={() => {
              resetForm()
              setIsFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            إضافة دواء
          </button>
        }
        meta={
          <>
            <span className="summary-chip">إجمالي الأصناف: {drugs.length}</span>
            <span className="summary-chip">النتائج الحالية: {filteredDrugs.length}</span>
            <span className="summary-chip">
              منخفض أو نافد: {drugs.filter((drug) => drug.amount < 10).length}
            </span>
          </>
        }
      />

      <section className="toolbar-panel">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.75fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slateAdmin-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث بأي معلومة: الاسم، PIN، الموقع، الشركة، التصنيف، السعر..."
              className="field-input pr-12"
            />
          </label>

          <select
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value as typeof stockFilter)}
            className="field-select"
          >
            <option value="all">كل حالات المخزون</option>
            <option value="low">مخزون منخفض</option>
            <option value="out">نفد المخزون</option>
          </select>
        </div>
      </section>

      <DataTable columns={tableColumns} minWidthClassName="min-w-[1120px]">
        {filteredDrugs.length === 0 ? (
          <TableEmptyState
            colSpan={tableColumns.length}
            title="لا توجد نتائج مطابقة"
            description="جرّب توسيع البحث أو تغيير فلتر المخزون لعرض سجلات أكثر."
          />
        ) : (
          filteredDrugs.map((drug) => {
            const category = categoryMap.get(drug.category_id)
            const company = companyMap.get(drug.company_id)
            const stockTone = drug.amount === 0 ? 'danger' : drug.amount < 10 ? 'warning' : 'success'

            return (
              <tr key={drug.drug_id}>
                <td>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slateAdmin-950">{drug.dname}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slateAdmin-500">
                      <span>PIN: {drug.pin}</span>
                      <span>أضيف: {formatDate(drug.created_at)}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="space-y-1">
                    <p className="font-semibold text-slateAdmin-900">{category?.name_category ?? '-'}</p>
                    <p className="text-xs text-slateAdmin-500">{drug.drug_id}</p>
                  </div>
                </td>
                <td className="font-semibold text-slateAdmin-900">{company?.name_company ?? '-'}</td>
                <td>
                  <p className="font-bold text-slateAdmin-950">{formatCurrency(drug.price)}</p>
                  <p className="mt-1 text-xs text-slateAdmin-500">سعر الوحدة</p>
                </td>
                <td>
                  <div className="space-y-2">
                    <StatusPill tone={stockTone} label={`${drug.amount} عبوة`} />
                    <p className="text-xs text-slateAdmin-500">
                      {drug.amount === 0
                        ? 'يتطلب إعادة تعبئة مباشرة'
                        : drug.amount < 10
                          ? 'قريب من حد التنبيه'
                          : 'المخزون مستقر'}
                    </p>
                  </div>
                </td>
                <td>
                  <div className="space-y-1">
                    <p className="font-semibold text-slateAdmin-900">{drug.machine_column}</p>
                    <p className="text-xs text-slateAdmin-500">عمود التخزين الآلي</p>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button className="button-secondary px-4 py-2.5 text-sm" onClick={() => setSelectedDrug(drug)}>
                      تفاصيل
                    </button>
                    <button
                      className="button-secondary px-4 py-2.5 text-sm"
                      onClick={() => {
                        setEditingDrug(drug)
                        setIsFormOpen(true)
                        setForm({
                          dname: drug.dname,
                          category_id: drug.category_id,
                          company_id: drug.company_id,
                          price: drug.price,
                          amount: drug.amount,
                          pin: drug.pin,
                          machine_column: drug.machine_column,
                        })
                      }}
                    >
                      تعديل
                    </button>
                    <button className="button-danger px-4 py-2.5 text-sm" onClick={() => deleteDrug(drug.drug_id)}>
                      حذف
                    </button>
                    <Link
                      to={`/app/details/drug/${drug.drug_id}`}
                      className="button-secondary px-4 py-2.5 text-sm"
                    >
                      صفحة التفاصيل
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })
        )}
      </DataTable>

      <Modal
        open={isFormOpen}
        title={editingDrug ? 'تعديل دواء' : 'إضافة دواء جديد'}
        onClose={resetForm}
        footer={
          <>
            <button className="button-secondary" onClick={resetForm}>
              إلغاء
            </button>
            <button
              className="button-primary"
              onClick={() => {
                if (editingDrug) {
                  updateDrug({
                    ...editingDrug,
                    ...form,
                  })
                } else {
                  addDrug(form)
                }
                resetForm()
              }}
            >
              حفظ
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.dname}
            onChange={(event) => setForm({ ...form, dname: event.target.value })}
            placeholder="اسم الدواء"
            className="field-input"
          />
          <input
            value={form.pin}
            onChange={(event) => setForm({ ...form, pin: event.target.value })}
            placeholder="PIN"
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
          <select
            value={form.company_id}
            onChange={(event) => setForm({ ...form, company_id: event.target.value })}
            className="field-select"
          >
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.name_company}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
            placeholder="السعر"
            className="field-input"
          />
          <input
            type="number"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
            placeholder="الكمية"
            className="field-input"
          />
          <input
            value={form.machine_column}
            onChange={(event) => setForm({ ...form, machine_column: event.target.value })}
            placeholder="الموقع أو العمود الآلي"
            className="field-input md:col-span-2"
          />
        </div>
      </Modal>

      <Modal open={Boolean(selectedDrug)} title="تفاصيل الدواء" onClose={() => setSelectedDrug(null)}>
        {selectedDrug ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="dashboard-panel p-5">
              <p className="text-sm text-slateAdmin-500">الاسم التجاري</p>
              <p className="mt-2 text-xl font-bold text-slateAdmin-950">{selectedDrug.dname}</p>
            </div>
            <div className="dashboard-panel p-5">
              <p className="text-sm text-slateAdmin-500">السعر</p>
              <p className="mt-2 text-xl font-bold text-slateAdmin-950">
                {formatCurrency(selectedDrug.price)}
              </p>
            </div>
            <div className="dashboard-panel p-5">
              <p className="text-sm text-slateAdmin-500">الموقع</p>
              <p className="mt-2 text-xl font-bold text-slateAdmin-950">
                {selectedDrug.machine_column}
              </p>
            </div>
            <div className="dashboard-panel p-5">
              <p className="text-sm text-slateAdmin-500">حالة المخزون</p>
              <div className="mt-3">
                <StatusPill
                  tone={
                    selectedDrug.amount === 0
                      ? 'danger'
                      : selectedDrug.amount < 10
                        ? 'warning'
                        : 'success'
                  }
                  label={`${selectedDrug.amount} عبوة`}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
