import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ErrorState } from '../components/ErrorState'
import { GameCard } from '../components/GameCard'
import { GameFilters } from '../components/GameFilters'
import { GameGridSkeleton } from '../components/Skeleton'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback'
import { useGameFilters } from '../hooks/useGameFilters'
import { useGames } from '../hooks/useGames'
import { useLibraryMembership } from '../hooks/useLibraryMembership'
import { api, apiErrorMessage } from '../lib/api'

const SEARCH_DEBOUNCE_MS = 400

type HealthResponse = {
  status: string
}

export function HomePage() {
  const { filters, setFilters, clearFilters, resetAll, activeCount } = useGameFilters()
  const { search, page } = filters
  const membership = useLibraryMembership()

  // Tekst w polu wyszukiwania; do URL trafia dopiero po chwili bez pisania.
  const [draft, setDraft] = useState(search)
  const [syncedSearch, setSyncedSearch] = useState(search)
  if (search !== syncedSearch) {
    // URL zmienił się z zewnątrz (wstecz/dalej, „Wyczyść filtry”) — pokaż to w polu.
    setSyncedSearch(search)
    if (search !== draft.trim()) setDraft(search)
  }
  const debouncedSearch = useDebouncedCallback(
    (value: string) => setFilters({ search: value }, { replace: true }),
    SEARCH_DEBOUNCE_MS,
  )

  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>('/api/health')
      return data
    },
    retry: false,
  })

  const games = useGames(filters)

  const statusLabel = health.isPending
    ? 'Sprawdzanie połączenia…'
    : health.isError
      ? 'Backend niedostępny'
      : 'Backend działa'

  const statusClass = health.isSuccess ? 'bg-emerald-400' : health.isError ? 'bg-rose-400' : 'bg-amber-300'
  const canGoBack = page > 1
  const canGoForward = games.data ? games.data.page * games.data.page_size < games.data.count : false
  const totalPages = games.data ? Math.max(1, Math.ceil(games.data.count / games.data.page_size)) : null

  const goToPage = (next: number) => {
    setFilters({ page: next })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Katalog gier</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight">
        Odkrywaj gry i zbieraj własną bibliotekę
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
        Szukaj tytułów, przeglądaj opisy i oceny, a potem oznaczaj je jako „Do zagrania”, „W trakcie” albo
        „Ukończone”.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300">
        <span className={`h-2 w-2 rounded-full ${statusClass}`} />
        {statusLabel}
      </div>

      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          debouncedSearch.cancel()
          setFilters({ search: draft.trim() })
        }}
      >
        <label className="sr-only" htmlFor="game-search">
          Szukaj gry
        </label>
        <input
          id="game-search"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            debouncedSearch.run(event.target.value.trim())
          }}
          placeholder="Szukaj gry, np. Hades"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-white/30"
        />
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-slate-950 hover:bg-slate-200"
        >
          Szukaj
        </button>
      </form>

      <GameFilters filters={filters} activeCount={activeCount} onChange={setFilters} onClear={clearFilters} />

      <div className="mt-8">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 className="text-xl font-medium">
            {search ? `Wyniki dla „${search}”` : activeCount > 0 ? 'Gry według filtrów' : 'Popularne gry'}
          </h2>
          {games.data && <span className="text-sm text-slate-400">{games.data.count.toLocaleString('pl-PL')} gier</span>}
        </div>
        {games.isPending && games.isFetching && <GameGridSkeleton />}
        {games.isError && (
          <ErrorState
            message={apiErrorMessage(games.error, 'Nie udało się pobrać gier z katalogu.')}
            retrying={games.isFetching}
            onRetry={() => void games.refetch()}
          />
        )}
        {membership.add.isError && (
          <p className="mt-4 text-rose-300">
            {apiErrorMessage(membership.add.error, 'Nie udało się dodać gry do biblioteki.')}
          </p>
        )}
        {games.isSuccess && games.data.results.length === 0 && games.data.count > 0 && (
          // np. stary link z ?page=5, a wyników jest teraz mniej
          <p className="mt-4 text-slate-300">
            Ta strona jest pusta.
            <button type="button" onClick={() => goToPage(1)} className="ml-2 underline hover:text-white">
              Wróć do pierwszej strony
            </button>
          </p>
        )}
        {games.isSuccess && games.data.count === 0 && (
          <p className="mt-4 text-slate-300">
            Brak gier dla tego zapytania.
            {(activeCount > 0 || search) && (
              <button type="button" onClick={resetAll} className="ml-2 underline hover:text-white">
                Wyczyść wyszukiwanie i filtry
              </button>
            )}
          </p>
        )}
        {games.data && games.data.results.length > 0 && (
          <div
            aria-busy={games.isPlaceholderData}
            className={`mt-4 grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
              games.isPlaceholderData ? 'opacity-50' : ''
            }`}
          >
            {games.data.results.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                inLibrary={membership.ids.has(game.id)}
                disabled={membership.library.isPending}
                pending={membership.add.isPending && membership.add.variables === game.id}
                onAdd={(rawgId) => membership.add.mutate(rawgId)}
              />
            ))}
          </div>
        )}
        {games.data && games.data.count > games.data.page_size && (
          <div className="mt-6 flex items-center gap-3 text-sm">
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1.5 disabled:text-slate-600"
              disabled={!canGoBack}
              onClick={() => goToPage(page - 1)}
            >
              Poprzednia
            </button>
            <span className="text-slate-400">
              Strona {page}
              {totalPages ? ` z ${totalPages.toLocaleString('pl-PL')}` : ''}
            </span>
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1.5 disabled:text-slate-600"
              disabled={!canGoForward}
              onClick={() => goToPage(page + 1)}
            >
              Następna
            </button>
          </div>
        )}
      </div>
    </section>
  )
}