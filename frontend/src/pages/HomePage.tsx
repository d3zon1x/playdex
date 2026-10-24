import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type HealthResponse = {
  status: string
}

export function HomePage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>('/api/health')
      return data
    },
    retry: false,
  })

  const statusLabel = health.isPending
    ? 'Sprawdzanie połączenia…'
    : health.isError
      ? 'Backend niedostępny'
      : 'Backend działa'

  const statusClass = health.isSuccess
    ? 'bg-emerald-400'
    : health.isError
      ? 'bg-rose-400'
      : 'bg-amber-300'

  return (
    <section className="max-w-2xl">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Katalog gier</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Odkrywaj gry i zbieraj własną bibliotekę</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-300">
        Szukaj tytułów, przeglądaj opisy i oceny, a potem oznaczaj je jako „Do zagrania”, „W trakcie”
        albo „Ukończone”.
      </p>
      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300">
        <span className={`h-2 w-2 rounded-full ${statusClass}`} />
        {statusLabel}
      </div>
    </section>
  )
}
