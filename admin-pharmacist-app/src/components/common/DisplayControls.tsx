import { Languages, MoonStar, SunMedium } from 'lucide-react'

import { useAdminLocale } from '@/hooks/useAdminLocale'

export function DisplayControls() {
  const { language, theme, toggleLanguage, toggleTheme, text } = useAdminLocale()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="button-secondary px-4 py-2.5 text-sm" onClick={toggleLanguage} type="button">
        <Languages className="h-4 w-4" />
        {language === 'ar' ? 'English' : 'العربية'}
      </button>
      <button className="button-secondary px-4 py-2.5 text-sm" onClick={toggleTheme} type="button">
        {theme === 'light' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
        {theme === 'light' ? text('دارك مود', 'Dark Mode') : text('لايت مود', 'Light Mode')}
      </button>
    </div>
  )
}
