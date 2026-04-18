import { Search } from 'lucide-react'
import type { FormEvent } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  actionLabel?: string
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'ابحث عن دواء أو شركة أو تصنيف...',
  actionLabel = 'بحث',
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form
      className="flex items-center gap-3 rounded-2xl border border-primary-100 bg-white px-4 py-3 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
        <Search className="h-5 w-5" />
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-none bg-transparent text-base text-primary-900 outline-none placeholder:text-slate-400"
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white"
      >
        {actionLabel}
      </button>
    </form>
  )
}
