import clsx from 'clsx'
import type { PropsWithChildren, ReactNode } from 'react'

interface DataTableColumn {
  key: string
  label: ReactNode
  className?: string
}

interface DataTableProps extends PropsWithChildren {
  columns: DataTableColumn[]
  minWidthClassName?: string
  className?: string
}

interface TableEmptyStateProps {
  colSpan: number
  title: string
  description: string
}

export function DataTable({
  columns,
  children,
  minWidthClassName = 'min-w-[980px]',
  className,
}: DataTableProps) {
  return (
    <section
      className={clsx(
        'overflow-hidden rounded-[28px] border border-slateAdmin-200 bg-white shadow-[0_8px_40px_rgba(26,42,58,0.06)]',
        className,
      )}
    >
      <div className="overflow-x-auto p-4 sm:p-6">
        <table className={clsx('dashboard-table', minWidthClassName)}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  )
}

export function TableEmptyState({ colSpan, title, description }: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="!bg-transparent !px-0 !py-6">
        <div className="table-empty-state">
          <p className="text-lg font-bold text-slateAdmin-900">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-slateAdmin-500">{description}</p>
        </div>
      </td>
    </tr>
  )
}
