import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { GameCard } from '../components/GameCard'
import { useLibraryMembership } from '../hooks/useLibraryMembership'
import { api, apiErrorMessage } from '../lib/api'
import { searchGames } from '../lib/games'

type HealthResponse = {
  status: string
}

export function HomePage() {
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const membership = useLibraryMembership()

  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>('/api/health')
      return data
    },
    retry: false,
  })

  const games = useQuery({
    queryKey: ['games', search, page],
    queryFn: () => searchGames(search, page),
    placeholderData: keepPreviousData,
    retry: false,
  })

  const statusLabel = health.isPending
    ? 'Sprawdzanie połączenia…'
    : health.isError
      ? 'Backend niedostępny'
      : 'Backend działa'

  const statusClass = health.isSuccess ? 'bg-emerald-400' : health.isError ? 'bg-rose-400' : 'bg-amber-300'
  const canGoBack = page > 1
  const canGoForward = games.data ? games.data.page * games.data.page_size < games.data.count : false

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
          setPage(1)
          setSearch(draft.trim())
        }}
      >
        <label className="sr-only" htmlFor="game-search">
          Szukaj gry
        </label>
        <input
          id="game-search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
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

      <div className="mt-8">
        <h2 className="text-xl font-medium">{search ? `Wyniki dla „${search}”` : 'Popularne gry'}</h2>
        {games.isFetching && <p className="mt-2 text-sm text-slate-400">Szukanie…</p>}
        {games.isError && (
          <p className="mt-4 text-slate-300">
            {apiErrorMessage(games.error, 'Nie udało się pobrać gier z katalogu.')}
          </p>
        )}
        {membership.add.isError && (
          <p className="mt-4 text-rose-300">
            {apiErrorMessage(membership.add.error, 'Nie udało się dodać gry do biblioteki.')}
          </p>
        )}
        {games.isSuccess && games.data.results.length === 0 && (
          <p className="mt-4 text-slate-300">Brak gier dla tego zapytania.</p>
        )}
        {games.data && games.data.results.length > 0 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              onClick={() => setPage((current) => current - 1)}
            >
              Poprzednia
            </button>
            <span className="text-slate-400">Strona {page}</span>
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1.5 disabled:text-slate-600"
              disabled={!canGoForward}
              onClick={() => setPage((current) => current + 1)}
            >
              Następna
            </button>
          </div>
        )}
      </div>
    </section>
  )
}