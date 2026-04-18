function normalizeSearchValue(value: unknown) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export function matchesSearchQuery(query: string, values: unknown[]) {
  const normalizedQuery = normalizeSearchValue(query)

  if (!normalizedQuery) {
    return true
  }

  const searchTokens = normalizedQuery.split(' ').filter(Boolean)
  const haystack = values.map((value) => normalizeSearchValue(value)).join(' ')

  return searchTokens.every((token) => haystack.includes(token))
}
