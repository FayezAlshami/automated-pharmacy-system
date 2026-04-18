import type { PortalLanguage } from '@/types/doctor-portal'

/**
 * Formats monetary values for the selected portal language.
 */
export function formatCurrency(value: number, language: PortalLanguage = 'ar') {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-SY' : 'en-US', {
    style: 'currency',
    currency: 'SYP',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Formats ISO-like date strings for concise UI presentation.
 */
export function formatDate(date: string, language: PortalLanguage = 'ar') {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SY' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(date))
}
