/**
 * يولّد معرف جلسة أو عملية بصيغة قصيرة مناسبة للعرض داخل الواجهة.
 */
export function createDisplayIdentifier(prefix: string) {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${randomPart}`
}
