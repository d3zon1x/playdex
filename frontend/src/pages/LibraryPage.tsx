import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type Game = {
  id: number
  name: string
  released: string | null
}

const statuses = ['Do zagrania', 'W trakcie', 'Ukończone']

export function LibraryPage() {
  const games = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data } = await api.get<Game[]>('/api/games')
      return data
    },
  })

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">Biblioteka</h1>
      <p className="mt-2 text-slate-400">Twoje kolekcje gier.</p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <li
            key={status}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300"
          >
            {status}
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        {games.isPending && <p className="text-slate-300">Ładowanie biblioteki…</p>}
        {games.isError && (
          <p className="text-slate-300">Nie udało się pobrać gier. Uruchom backend i odśwież stronę.</p>
        )}
        {games.isSuccess && games.data.length === 0 && (
          <p className="text-slate-300">
            Nie masz jeszcze żadnych gier. Wyszukaj tytuł i dodaj go do kolekcji.
          </p>
        )}
        {games.isSuccess && games.data.length > 0 && (
          <ul className="space-y-3">
            {games.data.map((game) => (
              <li key={game.id} className="text-slate-100">
                {game.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
