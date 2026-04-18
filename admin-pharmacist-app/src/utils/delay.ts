/**
 * Simulates network latency in mock mode so loading states remain realistic.
 */
export function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
