import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addToLibrary, fetchLibrary } from '../lib/games'

export function useLibraryMembership() {
  const queryClient = useQueryClient()
  const library = useQuery({
    queryKey: ['library', 'all'],
    queryFn: () => fetchLibrary(),
  })
  const add = useMutation({
    mutationFn: addToLibrary,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['library'] })
    },
  })
  const ids = new Set(library.data?.map((entry) => entry.game.id))

  return { library, add, ids }
}
