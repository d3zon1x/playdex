import { api } from './api'
import type { GameDetail, GameList, LibraryEntry, LibraryStatus } from './types'

export async function searchGames(search: string, page: number) {
  const { data } = await api.get<GameList>('/api/games', {
    params: {
      page,
      page_size: 12,
      ...(search ? { search } : {}),
    },
  })
  return data
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
