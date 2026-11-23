import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { LibraryListSkeleton } from '../components/Skeleton'
import { StarRating } from '../components/StarRating'
import { useLibraryMembership } from '../hooks/useLibraryMembership'
import { apiErrorMessage } from '../lib/api'
import {
  isLibraryStatus,
  libraryStatusLabels,
  libraryStatuses,
  type LibraryEntry,
  type LibraryStatus,
} from '../lib/types'

export function LibraryPage() {
  const [params, setParams] = useSearchParams()
  const rawStatus = params.get('status')
  const status: LibraryStatus | 'all' = rawStatus && isLibraryStatus(rawStatus) ? rawStatus : 'all'
  const membership = useLibraryMembership()
  const { library, update, remove, entries } = membership

  const counts = useMemo(() => {
    const next: Record<LibraryStatus | 'all', number> = {
      all: entries.length,
      backlog: 0,
      playing: 0,
      completed: 0,
    }
    for (const entry of entries) next[entry.status] += 1
    return next
  }, [entries])

  const visible = status === 'all' ? entries : entries.filter((entry) => entry.status === status)
  const average = useMemo(() => averageRating(entries), [entries])

  const setStatus = (next: LibraryStatus | 'all') => {
    setParams(
      (current) => {
        const updated = new URLSearchParams(current)
        if (next === 'all') updated.delete('status')
        else updated.set('status', next)
        return updated
      },
      { replace: false },
    )
  }

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Biblioteka</h1>
      <p className="mt-2 text-slate-400">Twoje kolekcje gier.</p>
      {library.isSuccess && (
        <p className="mt-2 text-sm text-slate-300">
          {average == null
            ? 'Brak własnych ocen.'
            : `Średnia własna ocena: ${average.toLocaleString('pl-PL', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}`}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterButton active={status === 'all'} count={library.isSuccess ? counts.all : null} onClick={() => setStatus('all')}>
          Wszystkie
        </FilterButton>
        {libraryStatuses.map((value) => (
          <FilterButton
            key={value}
            active={status === value}
            count={library.isSuccess ? counts[value] : null}
            onClick={() => setStatus(value)}
          >
            {libraryStatusLabels[value]}
          </FilterButton>
        ))}
      </div>

      {update.isError && (
        <p className="mt-4 text-rose-300">
          {apiErrorMessage(update.error, 'Nie udało się zapisać zmian.')}
        </p>
      )}
      {remove.isError && (
        <p className="mt-4 text-rose-300">
          {apiErrorMessage(remove.error, 'Nie udało się usunąć gry z biblioteki.')}
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
        {library.isSuccess && visible.length === 0 && (
          <p className="text-slate-300">
            {status === 'all'
              ? 'Nie masz jeszcze żadnych gier. Wyszukaj tytuł i dodaj go do kolekcji.'
              : 'Brak gier z tym statusem.'}
          </p>
        )}
        {library.isSuccess && visible.length > 0 && (
          <ul className="space-y-4">
            {visible.map((entry) => {
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
                    <div className="mt-4 flex flex-wrap items-center gap-3">
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
                      <span className="text-sm text-slate-400">Ocena</span>
                      <StarRating
                        value={entry.user_rating}
                        disabled={busy}
                        onChange={(rating) => update.mutate({ id: entry.id, body: { user_rating: rating } })}
                      />
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

function averageRating(entries: LibraryEntry[]) {
  const ratings = entries.flatMap((entry) => (entry.user_rating == null ? [] : [entry.user_rating]))
  if (ratings.length === 0) return null
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
}

function FilterButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean
  count: number | null
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
      {count == null ? '' : ` (${count})`}
    </button>
  )
}
