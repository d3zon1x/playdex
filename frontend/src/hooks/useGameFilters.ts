import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { GameFilters, GameOrdering } from '../lib/types'

export const gameOrderings: { value: GameOrdering; label: string }[] = [
  { value: '', label: 'Trafność' },
  { value: '-added', label: 'Popularność' },
  { value: '-rating', label: 'Ocena RAWG' },
  { value: '-metacritic', label: 'Metacritic' },
  { value: '-released', label: 'Najnowsze' },
  { value: 'name', label: 'Nazwa A–Z' },
]

const filterKeys = ['genre', 'platform', 'yearFrom', 'yearTo'] as const satisfies (keyof GameFilters)[]

// Nazwy parametrów w URL: ?search=&genre=&platform=&from=&to=&sort=&page=
const urlKeys: Record<keyof GameFilters, string> = {
  search: 'search',
  genre: 'genre',
  platform: 'platform',
  yearFrom: 'from',
  yearTo: 'to',
  ordering: 'sort',
  page: 'page',
}

/**
 * Filters for the game search, stored in the URL so they survive a refresh,
 * can be shared as a link, and work with the browser's back button.
 */
export function useGameFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<GameFilters>(
    () => ({
      search: params.get(urlKeys.search)?.trim() ?? '',
      genre: positiveInt(params.get(urlKeys.genre)),
      platform: positiveInt(params.get(urlKeys.platform)),
      yearFrom: positiveInt(params.get(urlKeys.yearFrom)),
      yearTo: positiveInt(params.get(urlKeys.yearTo)),
      ordering: parseOrdering(params.get(urlKeys.ordering)),
      page: positiveInt(params.get(urlKeys.page)) ?? 1,
    }),
    [params],
  )

  /** Change filters. Any change except the page itself starts again from page 1. */
  const setFilters = useCallback(
    (patch: Partial<GameFilters>, options?: { replace?: boolean }) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(patch) as [keyof GameFilters, unknown][]) {
            const urlKey = urlKeys[key]
            if (value == null || value === '' || (key === 'page' && value === 1)) next.delete(urlKey)
            else next.set(urlKey, String(value))
          }
          if (!('page' in patch)) next.delete(urlKeys.page)
          return next
        },
        { replace: options?.replace },
      )
    },
    [setParams],
  )

  /** Clears genre/platform/years; search text and sorting stay. */
  const clearFilters = useCallback(
    () => setFilters({ genre: null, platform: null, yearFrom: null, yearTo: null }),
    [setFilters],
  )

  /** Back to the default view: no search, no filters, default sorting. */
  const resetAll = useCallback(() => setParams(new URLSearchParams()), [setParams])

  const activeCount = filterKeys.filter((key) => filters[key] != null).length

  return { filters, setFilters, clearFilters, resetAll, activeCount }
}

function positiveInt(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return null
  const number = Number(value)
  return number > 0 ? number : null
}

function parseOrdering(value: string | null): GameOrdering {
  return gameOrderings.find((option) => option.value === value)?.value ?? ''
}
