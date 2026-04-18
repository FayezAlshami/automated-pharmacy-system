/**
 * Simulates network latency while running in mock mode so screens
 * behave closer to a real asynchronous environment.
 */
export function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
