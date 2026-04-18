import { Languages } from 'lucide-react'

import { usePortalLocale } from '@/hooks/usePortalLocale'

export function LanguageSwitch() {
  const { language, toggleLanguage, text } = usePortalLocale()

  return (
    <button
      className="inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-white px-4 py-2.5 text-sm font-semibold text-primary-800 shadow-sm"
      onClick={toggleLanguage}
      type="button"
    >
      <Languages className="h-4 w-4" />
      {language === 'ar' ? 'English' : 'العربية'}
      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-600">
        {text('AR', 'EN')}
      </span>
    </button>
  )
}
