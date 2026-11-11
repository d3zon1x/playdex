import { api } from './api'
import type {
  FilterOption,
  GameDetail,
  GameFilters,
  GameList,
  LibraryEntry,
  LibraryStatus,
} from './types'

export const GAMES_PAGE_SIZE = 12

export async function searchGames(filters: GameFilters) {
  const params: Record<string, string | number> = { page: filters.page, page_size: GAMES_PAGE_SIZE }
  if (filters.search) params.search = filters.search
  if (filters.genre != null) params.genres = filters.genre
  if (filters.platform != null) params.parent_platforms = filters.platform
  if (filters.ordering) params.ordering = filters.ordering
  const dates = releaseWindow(filters.yearFrom, filters.yearTo)
  if (dates) params.dates = dates

  const { data } = await api.get<GameList>('/api/games', { params })
  return data
}

export async function fetchGenres() {
  const { data } = await api.get<FilterOption[]>('/api/genres')
  return data
}

export async function fetchPlatforms() {
  const { data } = await api.get<FilterOption[]>('/api/platforms')
  return data
}

/** RAWG wants `YYYY-MM-DD,YYYY-MM-DD`; an open end becomes a wide bound. */
function releaseWindow(from: number | null, to: number | null) {
  if (from == null && to == null) return null
  let start = from ?? 1970
  let end = to ?? new Date().getFullYear() + 5
  if (start > end) [start, end] = [end, start]
  return `${start}-01-01,${end}-12-31`
}

export async function fetchGame(id: number) {
  const { data } = await api.get<GameDetail>(`/api/games/${id}`)
  return data
}

export async function fetchLibrary(status?: LibraryStatus) {
  const { data } = await api.get<LibraryEntry[]>('/api/library', {
    params: status ? { status } : undefined,
  })
  return data
}

export async function addToLibrary(rawgId: number) {
  const { data } = await api.post<LibraryEntry>('/api/library', { rawg_id: rawgId })
  return data
}

export async function updateLibraryEntry(
  id: string,
  body: { status?: LibraryStatus; user_rating?: number | null },
) {
  const { data } = await api.patch<LibraryEntry>(`/api/library/${id}`, body)
  return data
}

export async function removeFromLibrary(id: string) {
  await api.delete(`/api/library/${id}`)
}
