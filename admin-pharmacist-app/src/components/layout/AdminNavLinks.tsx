import { Link } from 'react-router-dom'

import { adminNavigation } from '@/constants/navigation'
import type { AdminLanguage } from '@/types/admin'

interface AdminNavLinksProps {
  pathname: string
  language: AdminLanguage
  onNavigate?: () => void
}

export function AdminNavLinks({ pathname, language, onNavigate }: AdminNavLinksProps) {
  return (
    <nav className="space-y-1">
      {adminNavigation.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            pathname === item.href
              ? 'bg-white text-slateAdmin-950 shadow-[0_8px_24px_rgba(26,42,58,0.18)]'
              : 'text-white/85 hover:bg-white/10 hover:text-white'
          }`}
        >
          <item.icon className="h-5 w-5 shrink-0 opacity-90" />
          <span>{item.label[language]}</span>
        </Link>
      ))}
    </nav>
  )
}
