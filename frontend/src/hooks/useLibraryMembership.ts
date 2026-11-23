import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { addToLibrary, fetchLibrary, removeFromLibrary, updateLibraryEntry } from '../lib/games'
import type { LibraryStatus } from '../lib/types'

export function useLibraryMembership() {
  const queryClient = useQueryClient()
  const library = useQuery({
    queryKey: ['library'],
    queryFn: () => fetchLibrary(),
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['library'] })
  }

  const add = useMutation({
    mutationFn: addToLibrary,
    onSuccess: refresh,
  })

  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: { status?: LibraryStatus; user_rating?: number | null }
    }) => updateLibraryEntry(id, body),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: removeFromLibrary,
    onSuccess: refresh,
  })

  const entries = useMemo(() => library.data ?? [], [library.data])
  const ids = useMemo(() => new Set(entries.map((entry) => entry.game.id)), [entries])
  const byGameId = useMemo(() => new Map(entries.map((entry) => [entry.game.id, entry])), [entries])

  return { library, add, update, remove, entries, ids, byGameId }
}
