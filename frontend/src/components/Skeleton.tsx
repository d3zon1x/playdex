/** Grey placeholder blocks shown while data is loading. Purely visual, hidden from screen readers. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-white/10 ${className}`} />
}

/** Same shape as `GameCard`, so the grid does not jump when the data arrives. */
export function GameCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <Skeleton className="h-44 rounded-none" />
      <div className="flex flex-1 flex-col p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-3 h-4 w-2/3" />
        <Skeleton className="mt-4 h-8 rounded-full" />
      </div>
    </div>
  )
}

export function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Ładowanie gier…</span>
      {Array.from({ length: count }, (_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  )
}

/** Same layout as the details section of `GamePage`. */
export function GameDetailSkeleton() {
  return (
    <div role="status" className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <span className="sr-only">Ładowanie gry…</span>
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-5 w-1/2" />
        <Skeleton className="mt-5 h-4 w-1/3" />
        <Skeleton className="mt-2 h-4 w-2/5" />
        <Skeleton className="mt-6 h-9 w-44 rounded-full" />
        <div className="mt-6 max-w-3xl space-y-2">
          <Skeleton className="h-4" />
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  )
}

/** Same shape as one row of the library list. */
export function LibraryListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status">
      <span className="sr-only">Ładowanie biblioteki…</span>
      <ul className="space-y-4">
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            aria-hidden="true"
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row"
          >
            <Skeleton className="h-28 w-full rounded-xl sm:w-44" />
            <div className="flex flex-1 flex-col">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="mt-2 h-4 w-1/4" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
