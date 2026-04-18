import { useAdminStore } from '@/store/useAdminStore'

/**
 * Lightweight locale helper used across the admin dashboard so the app can
 * switch between Arabic and English without introducing a full i18n library.
 */
export function useAdminLocale() {
  const { language, setLanguage, toggleLanguage, theme, setTheme, toggleTheme } = useAdminStore()
  const isArabic = language === 'ar'

  const text = (arabic: string, english: string) => (isArabic ? arabic : english)

  return {
    language,
    theme,
    isArabic,
    dir: isArabic ? 'rtl' : 'ltr',
    text,
    setLanguage,
    toggleLanguage,
    setTheme,
    toggleTheme,
  }
}
