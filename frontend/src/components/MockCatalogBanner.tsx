import { useHealth } from '../hooks/useHealth'

/** Shown while the backend runs with RAWG_MOCK=true (no RAWG key, or RAWG is down). */
export function MockCatalogBanner() {
  const health = useHealth()
  if (health.data?.catalog !== 'mock') return null

  return (
    <div role="status" className="border-b border-amber-300/20 bg-amber-300/10">
      <p className="mx-auto max-w-6xl px-6 py-2.5 text-sm text-amber-100">
        <strong className="font-medium">Dane przykładowe.</strong> Katalog działa bez RAWG API i pokazuje listę 50
        popularnych gier zapisaną w aplikacji. Wyszukiwanie i filtry działają tylko w jej obrębie, a oceny i daty są
        przybliżone.
      </p>
    </div>
  )
}
