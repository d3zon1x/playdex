import { Link } from 'react-router-dom'
import type { GameSummary } from '../lib/types'

type GameCardProps = {
  game: GameSummary
  inLibrary: boolean
  disabled: boolean
  pending: boolean
  onAdd: (rawgId: number) => void
}

export function GameCard({ game, inLibrary, disabled, pending, onAdd }: GameCardProps) {
  const year = game.released?.slice(0, 4)
  const meta = [year, game.genres.slice(0, 2).map((genre) => genre.name).join(', ')]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <Link to={`/games/${game.id}`} className="block">
        {game.background_image ? (
          <img src={game.background_image} alt="" className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center bg-slate-900 text-sm text-slate-500">
            Brak okładki
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/games/${game.id}`} className="font-medium hover:text-white">
          {game.name}
        </Link>
        <p className="mt-1 text-sm text-slate-400">{meta || 'Brak daty wydania'}</p>
        <p className="mt-2 text-sm text-slate-300">
          Ocena RAWG: {game.rating == null ? '—' : game.rating.toFixed(1)}
          {game.metacritic == null ? '' : ` · Metacritic ${game.metacritic}`}
        </p>
        <button
          type="button"
          className="mt-4 rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10 disabled:cursor-default disabled:text-slate-500 disabled:hover:bg-transparent"
          disabled={disabled || pending || inLibrary}
          onClick={() => onAdd(game.id)}
        >
          {inLibrary ? 'W bibliotece' : pending ? 'Dodawanie…' : 'Dodaj do biblioteki'}
        </button>
      </div>
    </article>
  )
}