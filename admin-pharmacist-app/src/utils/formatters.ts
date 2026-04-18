import type { AdminLanguage } from '@/types/admin'

function resolveLanguage(language?: AdminLanguage) {
  if (language) {
    return language
  }

  if (typeof document !== 'undefined') {
    return document.documentElement.lang === 'en' ? 'en' : 'ar'
  }

  return 'ar'
}

/**
 * Formats monetary values according to the current admin locale.
 */
export function formatCurrency(value: number, language?: AdminLanguage) {
  const resolvedLanguage = resolveLanguage(language)

  return new Intl.NumberFormat(resolvedLanguage === 'ar' ? 'ar-SY' : 'en-US', {
    style: 'currency',
    currency: 'SYP',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formats ISO-like date strings for concise dashboard display.
 */
export function formatDate(value: string, language?: AdminLanguage) {
  const resolvedLanguage = resolveLanguage(language)

  return new Intl.DateTimeFormat(resolvedLanguage === 'ar' ? 'ar-SY' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(value))
}
