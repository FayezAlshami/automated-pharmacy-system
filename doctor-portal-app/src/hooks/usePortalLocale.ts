import { categoryMeta, specialtyOptions } from '@/constants/portalMetadata'
import { useDoctorPortalStore } from '@/store/useDoctorPortalStore'
import type { AvailabilityStatus, Drug, OrderStatus, PortalLanguage } from '@/types/doctor-portal'

/**
 * Lightweight locale helper for the doctor portal. It keeps the app bilingual
 * without introducing a full i18n library while the project is still front-end only.
 */
export function usePortalLocale() {
  const { language, setLanguage, toggleLanguage } = useDoctorPortalStore()
  const isArabic = language === 'ar'

  const text = (arabic: string, english: string) => (isArabic ? arabic : english)

  const getLocalizedValue = (
    entry: { ar: string; en: string } | undefined,
    fallback: string,
    lang: PortalLanguage = language,
  ) => entry?.[lang] ?? fallback

  const getSpecialtyLabel = (specialtyId: string) => {
    const specialty = specialtyOptions.find((option) => option.id === specialtyId)
    return specialty ? specialty.label[language] : specialtyId
  }

  const getCategoryName = (slug: string, fallback = '') =>
    getLocalizedValue(categoryMeta[slug as keyof typeof categoryMeta]?.name, fallback)

  const getCategoryDescription = (slug: string, fallback = '') =>
    getLocalizedValue(categoryMeta[slug as keyof typeof categoryMeta]?.description, fallback)

  const getCategoryWarnings = (slug: string, fallback: string[] = []) =>
    categoryMeta[slug as keyof typeof categoryMeta]?.warnings[language] ?? fallback

  const getDrugTitle = (drug: Drug) => (isArabic ? drug.name : drug.scientificName)

  const getDrugSubtitle = (drug: Drug) =>
    isArabic ? `${drug.scientificName} • ${drug.dosage}` : `${drug.name} • ${drug.dosage}`

  const getDrugDescription = (drug: Drug) => {
    if (isArabic) {
      return drug.description
    }

    const categorySlug = drug.id.split('-drug-')[0]
    const categoryName = getCategoryName(categorySlug, drug.categoryName)
    return `${drug.scientificName} is listed under ${categoryName} with fast access to dosage, availability, and manufacturer insight.`
  }

  const getDrugWarnings = (drug: Drug) => {
    const categorySlug = drug.id.split('-drug-')[0]
    return getCategoryWarnings(categorySlug, drug.warnings)
  }

  const getAvailabilityLabel = (status: AvailabilityStatus) => {
    switch (status) {
      case 'in_stock':
        return text('متوفر', 'Available')
      case 'limited':
        return text('مخزون محدود', 'Limited')
      default:
        return text('غير متوفر', 'Out of Stock')
    }
  }

  const getOrderStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return text('مكتمل', 'Completed')
      case 'pending':
        return text('معلق', 'Pending')
      default:
        return text('مراجعة', 'Review')
    }
  }

  return {
    language,
    isArabic,
    dir: isArabic ? 'rtl' : 'ltr',
    locale: isArabic ? 'ar-SY' : 'en-US',
    text,
    setLanguage,
    toggleLanguage,
    getSpecialtyLabel,
    getCategoryName,
    getCategoryDescription,
    getDrugTitle,
    getDrugSubtitle,
    getDrugDescription,
    getDrugWarnings,
    getAvailabilityLabel,
    getOrderStatusLabel,
    specialtyOptions: specialtyOptions.map((option) => ({
      value: option.id,
      label: option.label[language],
    })),
  }
}
