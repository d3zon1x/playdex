import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '../components/ErrorState'
import { NotFound } from '../components/NotFound'
import { GameDetailSkeleton } from '../components/Skeleton'
import { useGame } from '../hooks/useGames'
import { useLibraryMembership } from '../hooks/useLibraryMembership'
import { apiErrorMessage, isNotFoundError } from '../lib/api'

const gameNotFound = {
  title: 'Nie znaleziono gry',
  message: 'Nie ma takiej gry w katalogu. Sprawdź adres albo wyszukaj ją na stronie głównej.',
}

export function GamePage() {
  const params = useParams()
  const rawgId = Number(params.id)
  const valid = Number.isInteger(rawgId) && rawgId > 0
  const membership = useLibraryMembership()
  const game = useGame(rawgId, valid)

  if (!valid || (game.isError && isNotFoundError(game.error))) {
    return <NotFound {...gameNotFound} />
  }

  const inLibrary = membership.ids.has(rawgId)
  const pending = membership.add.isPending && membership.add.variables === rawgId

  return (
    <section>
      <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
        Wróć do katalogu
      </Link>

      {game.isPending && <GameDetailSkeleton />}
      {game.isError && (
        <ErrorState
          message={apiErrorMessage(game.error, 'Nie udało się pobrać gry.')}
          retrying={game.isFetching}
          onRetry={() => void game.refetch()}
        />
      )}
      {game.isSuccess && (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
          {game.data.background_image ? (
            <img
              src={game.data.background_image}
              alt=""
              className="aspect-video w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-slate-900 text-slate-500">
              Brak okładki
            </div>
          )}
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{game.data.name}</h1>
            <p className="mt-3 text-slate-300">
              {game.data.released ?? 'Data wydania nieznana'}
              {game.data.rating == null ? '' : ` · RAWG ${game.data.rating.toFixed(1)}`}
              {game.data.metacritic == null ? '' : ` · Metacritic ${game.data.metacritic}`}
            </p>
            {game.data.esrb_rating && (
              <p className="mt-2 text-sm text-slate-400">Klasyfikacja wiekowa ESRB: {game.data.esrb_rating}</p>
            )}
            {game.data.genres.length > 0 && (
              <p className="mt-4 text-sm text-slate-300">
                {game.data.genres.map((genre) => genre.name).join(', ')}
              </p>
            )}
            {game.data.platforms.length > 0 && (
              <p className="mt-2 text-sm text-slate-400">
                {game.data.platforms.map((platform) => platform.name).join(', ')}
              </p>
            )}
            <button
              type="button"
              className="mt-6 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200 disabled:cursor-default disabled:bg-white/20 disabled:text-slate-300"
              disabled={membership.library.isPending || inLibrary || pending}
              onClick={() => membership.add.mutate(rawgId)}
            >
              {inLibrary ? 'W bibliotece' : pending ? 'Dodawanie…' : 'Dodaj do biblioteki'}
            </button>
            {membership.add.isError && (
              <p className="mt-3 text-sm text-rose-300">
                {apiErrorMessage(membership.add.error, 'Nie udało się dodać gry do biblioteki.')}
              </p>
            )}
            <p className="mt-6 max-w-3xl whitespace-pre-line leading-relaxed text-slate-300">
              {game.data.description || 'Brak opisu.'}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
