import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchGame, fetchGenres, fetchPlatforms, searchGames } from '../lib/games'
import type { GameFilters } from '../lib/types'

export function useGames(filters: GameFilters) {
  return useQuery({
    queryKey: ['games', filters],
    queryFn: () => searchGames(filters),
    placeholderData: keepPreviousData,
    retry: false,
  })
}

export function useGame(rawgId: number, enabled = true) {
  return useQuery({
    queryKey: ['game', rawgId],
    queryFn: () => fetchGame(rawgId),
    enabled,
    retry: false,
  })
}

// Gatunki i platformy prawie się nie zmieniają — nie odpytujemy ich ponownie w trakcie sesji.
export function useGenres() {
  return useQuery({ queryKey: ['genres'], queryFn: fetchGenres, staleTime: Infinity, retry: false })
}

export function usePlatforms() {
  return useQuery({ queryKey: ['platforms'], queryFn: fetchPlatforms, staleTime: Infinity, retry: false })
}
