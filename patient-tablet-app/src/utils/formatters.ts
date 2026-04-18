/**
 * ينسق المبالغ المالية بطريقة عربية واضحة للمريض.
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ar-SY', {
    style: 'currency',
    currency: 'SYP',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * يختصر عدد العناصر في الوصفة إلى نص سهل القراءة.
 */
export function formatItemCount(count: number) {
  if (count === 1) {
    return 'عنصر واحد'
  }

  if (count === 2) {
    return 'عنصران'
  }

  return `${count} عناصر`
}
