/**
 * Generates lightweight temporary identifiers for front-end-only CRUD flows.
 */
export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}
