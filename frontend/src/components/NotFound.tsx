import { Link } from 'react-router-dom'

type NotFoundProps = {
  title?: string
  message?: string
}

export function NotFound({
  title = 'Nie znaleziono strony',
  message = 'Ta strona nie istnieje albo została przeniesiona.',
}: NotFoundProps) {
  return (
    <section className="py-16 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Błąd 404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-slate-400">{message}</p>
      <div className="mt-8 flex justify-center gap-3 text-sm">
        <Link to="/" className="rounded-full bg-white px-4 py-2 font-medium text-slate-950 hover:bg-slate-200">
          Przeglądaj gry
        </Link>
        <Link to="/library" className="rounded-full border border-white/15 px-4 py-2 hover:bg-white/10">
          Moja biblioteka
        </Link>
      </div>
    </section>
  )
}
