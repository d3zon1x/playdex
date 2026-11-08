export type Genre = {
  id: number
  name: string
}

export type Platform = {
  id: number
  name: string
}

export type GameSummary = {
  id: number
  name: string
  slug: string
  released: string | null
  background_image: string | null
  rating: number | null
  ratings_count: number
  metacritic: number | null
  esrb_rating: string | null
  genres: Genre[]
  platforms: Platform[]
}

export type GameDetail = GameSummary & {
  description: string | null
}

export type GameList = {
  count: number
  page: number
  page_size: number
  results: GameSummary[]
}

export type LibraryStatus = 'backlog' | 'playing' | 'completed'

export type LibraryEntry = {
  id: string
  status: LibraryStatus
  user_rating: number | null
  game: GameSummary
}

export const libraryStatuses: LibraryStatus[] = ['backlog', 'playing', 'completed']

export const libraryStatusLabels: Record<LibraryStatus, string> = {
  backlog: 'Do zagrania',
  playing: 'W trakcie',
  completed: 'Ukończone',
}

export function isLibraryStatus(value: string): value is LibraryStatus {
  return libraryStatuses.some((status) => status === value)
}
