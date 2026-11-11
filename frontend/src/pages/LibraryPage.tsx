import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { LibraryListSkeleton } from '../components/Skeleton'
import { apiErrorMessage } from '../lib/api'
import { fetchLibrary, removeFromLibrary, updateLibraryEntry } from '../lib/games'
import {
  isLibraryStatus,
  libraryStatusLabels,
  libraryStatuses,
  type LibraryStatus,
} from '../lib/types'

const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function LibraryPage() {
  const [status, setStatus] = useState<LibraryStatus | 'all'>('all')
  const queryClient = useQueryClient()
  const library = useQuery({
    queryKey: ['library', status],
    queryFn: () => fetchLibrary(status === 'all' ? undefined : status),
  })

  const update = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: { status?: LibraryStatus; user_rating?: number | null }
    }) => updateLibraryEntry(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['library'] })
    },
  })

  const remove = useMutation({
    mutationFn: removeFromLibrary,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['library'] })
    },
  })

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Biblioteka</h1>
      <p className="mt-2 text-slate-400">Twoje kolekcje gier.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterButton active={status === 'all'} onClick={() => setStatus('all')}>
          Wszystkie
        </FilterButton>
        {libraryStatuses.map((value) => (
          <FilterButton key={value} active={status === value} onClick={() => setStatus(value)}>
            {libraryStatusLabels[value]}
          </FilterButton>
        ))}
      </div>

      {update.isError && (
        <p className="mt-4 text-rose-300">
          {apiErrorMessage(update.error, 'Nie udało się zapisać zmian.')}
        </p>
      )}

      <div className="mt-8">
        {library.isPending && <LibraryListSkeleton />}
        {library.isError && (
          <ErrorState
            message={apiErrorMessage(library.error, 'Nie udało się pobrać biblioteki.')}
            retrying={library.isFetching}
            onRetry={() => void library.refetch()}
          />
        )}
        {library.isSuccess && library.data.length === 0 && (
          <p className="text-slate-300">
            {status === 'all'
              ? 'Nie masz jeszcze żadnych gier. Wyszukaj tytuł i dodaj go do kolekcji.'
              : 'Brak gier z tym statusem.'}
          </p>
        )}
        {library.isSuccess && library.data.length > 0 && (
          <ul className="space-y-4">
            {library.data.map((entry) => {
              const busy =
                (update.isPending && update.variables?.id === entry.id) ||
                (remove.isPending && remove.variables === entry.id)
              return (
                <li
                  key={entry.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row"
                >
                  <Link to={`/games/${entry.game.id}`} className="shrink-0">
                    {entry.game.background_image ? (
                      <img
                        src={entry.game.background_image}
                        alt=""
                        className="h-28 w-full rounded-xl object-cover sm:w-44"
                      />
                    ) : (
                      <div className="flex h-28 items-center justify-center rounded-xl bg-slate-900 text-sm text-slate-500 sm:w-44">
                        Brak okładki
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link to={`/games/${entry.game.id}`} className="text-lg font-medium hover:text-white">
                      {entry.game.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-400">
                      {libraryStatusLabels[entry.status]}
                      {entry.game.released ? ` · ${entry.game.released.slice(0, 4)}` : ''}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <label className="text-sm text-slate-400" htmlFor={`status-${entry.id}`}>
                        Status
                      </label>
                      <select
                        id={`status-${entry.id}`}
                        className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-sm"
                        value={entry.status}
                        disabled={busy}
                        onChange={(event) => {
                          const value = event.target.value
                          if (!isLibraryStatus(value)) return
                          update.mutate({ id: entry.id, body: { status: value } })
                        }}
                      >
                        {libraryStatuses.map((value) => (
                          <option key={value} value={value}>
                            {libraryStatusLabels[value]}
                          </option>
                        ))}
                      </select>
                      <label className="text-sm text-slate-400" htmlFor={`rating-${entry.id}`}>
                        Ocena
                      </label>
                      <select
                        id={`rating-${entry.id}`}
                        className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-sm"
                        value={entry.user_rating ?? ''}
                        disabled={busy}
                        onChange={(event) => {
                          const value = event.target.value
                          update.mutate({
                            id: entry.id,
                            body: { user_rating: value ? Number(value) : null },
                          })
                        }}
                      >
                        <option value="">Brak</option>
                        {ratings.map((rating) => (
                          <option key={rating} value={rating}>
                            {rating}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:text-white disabled:text-slate-600"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm(`Usunąć „${entry.game.name}” z biblioteki?`)) {
                            remove.mutate(entry.id)
                          }
                        }}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-full bg-white px-3 py-1 text-sm text-slate-950'
          : 'rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300'
      }
    >
      {children}
    </button>
  )
}
