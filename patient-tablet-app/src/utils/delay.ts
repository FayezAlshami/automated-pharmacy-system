/**
 * يضيف تأخيراً زمنياً بسيطاً لمحاكاة زمن استجابة الخادم أو الجهاز.
 */
export function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
