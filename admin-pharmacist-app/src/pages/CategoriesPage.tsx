import { Plus, Search, Shapes } from 'lucide-react'
import { useState } from 'react'

import { DataTable, TableEmptyState } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { PageHero } from '@/components/common/PageHero'
import { useAdminLocale } from '@/hooks/useAdminLocale'
import { useAdminStore } from '@/store/useAdminStore'
import { matchesSearchQuery } from '@/utils/search'

export function CategoriesPage() {
  const { categories, companies, drugs, addCategory, updateCategory, deleteCategory } = useAdminStore()
  const { text } = useAdminLocale()
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const filteredCategories = categories.filter((category) =>
    matchesSearchQuery(search, [
      category.category_id,
      category.name_category,
      drugs.filter((drug) => drug.category_id === category.category_id).length,
      companies.filter((company) => company.category_id === category.category_id).length,
    ]),
  )

  const tableColumns = [
    { key: 'category', label: text('التصنيف', 'Category') },
    { key: 'drugs', label: text('عدد الأدوية', 'Drugs Count') },
    { key: 'companies', label: text('عدد الشركات', 'Companies Count') },
    { key: 'actions', label: text('إجراءات', 'Actions') },
  ]

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={text('مركز التصنيفات', 'Classification Hub')}
        title={text('إدارة التصنيفات', 'Categories Management')}
        description={text(
          'عرض أوضح للتصنيفات المستخدمة داخل المخزون مع إبراز ارتباط كل تصنيف بعدد الأدوية والشركات.',
          'A clearer view of inventory categories with visible linkage to related drugs and companies.',
        )}
        action={
          <button
            className="button-primary"
            onClick={() => {
              setEditingId('new')
              setName('')
            }}
            type="button"
          >
            <Plus className="h-4 w-4" />
            {text('إضافة تصنيف', 'Add Category')}
          </button>
        }
        meta={
          <>
            <span className="summary-chip">
              {text('إجمالي التصنيفات', 'Total Categories')}: {categories.length}
            </span>
            <span className="summary-chip">
              {text('الشركات المرتبطة', 'Linked Companies')}: {companies.length}
            </span>
            <span className="summary-chip">
              {text('عدد النتائج', 'Visible Results')}: {filteredCategories.length}
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
              'ابحث باسم التصنيف أو بعدد الأدوية أو عدد الشركات',
              'Search by category name, drugs count, or companies count',
            )}
            className="field-input pr-12"
          />
        </label>
      </section>

      <DataTable columns={tableColumns} minWidthClassName="min-w-[840px]">
        {filteredCategories.length === 0 ? (
          <TableEmptyState
            colSpan={tableColumns.length}
            title={text('لا توجد تصنيفات مطابقة', 'No matching categories')}
            description={text(
              'جرّب كتابة اسم مختلف أو أزل جزءًا من البحث.',
              'Try a different name or loosen the search term.',
            )}
          />
        ) : (
          filteredCategories.map((category) => {
            const drugCount = drugs.filter((drug) => drug.category_id === category.category_id).length
            const companyCount = companies.filter(
              (company) => company.category_id === category.category_id,
            ).length

            return (
              <tr key={category.category_id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-slateAdmin-200 bg-slateAdmin-50 p-3 text-slateAdmin-700">
                      <Shapes className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slateAdmin-950">{category.name_category}</p>
                      <p className="mt-1 text-xs text-slateAdmin-500">{category.category_id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="text-lg font-bold text-slateAdmin-950">{drugCount}</p>
                  <p className="mt-1 text-xs text-slateAdmin-500">
                    {text('أدوية ضمن هذا التصنيف', 'drugs under this category')}
                  </p>
                </td>
                <td>
                  <p className="text-lg font-bold text-slateAdmin-950">{companyCount}</p>
                  <p className="mt-1 text-xs text-slateAdmin-500">
                    {text('شركات مرتبطة', 'linked companies')}
                  </p>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="button-secondary px-4 py-2.5 text-sm"
                      onClick={() => {
                        setEditingId(category.category_id)
                        setName(category.name_category)
                      }}
                      type="button"
                    >
                      {text('تعديل', 'Edit')}
                    </button>
                    <button
                      className="button-danger px-4 py-2.5 text-sm"
                      onClick={() => deleteCategory(category.category_id)}
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
        open={editingId !== null}
        title={editingId === 'new' ? text('إضافة تصنيف', 'Add Category') : text('تعديل تصنيف', 'Edit Category')}
        onClose={() => setEditingId(null)}
        footer={
          <>
            <button className="button-secondary" onClick={() => setEditingId(null)} type="button">
              {text('إلغاء', 'Cancel')}
            </button>
            <button
              className="button-primary"
              onClick={() => {
                if (editingId === 'new') {
                  addCategory(name)
                } else if (editingId) {
                  updateCategory({ category_id: editingId, name_category: name })
                }
                setEditingId(null)
              }}
              type="button"
            >
              {text('حفظ', 'Save')}
            </button>
          </>
        }
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={text('اسم التصنيف', 'Category Name')}
          className="field-input"
        />
      </Modal>
    </div>
  )
}
