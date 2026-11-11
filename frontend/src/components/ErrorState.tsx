type ErrorStateProps = {
  message: string
  onRetry: () => void
  retrying?: boolean
}

/** Error message with a "try again" button (wired to TanStack Query's `refetch`). */
export function ErrorState({ message, onRetry, retrying = false }: ErrorStateProps) {
  return (
    <div role="alert" className="mt-4 flex flex-wrap items-center gap-3">
      <p className="text-slate-300">{message}</p>
      <button
        type="button"
        className="rounded-full border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10 disabled:text-slate-500"
        disabled={retrying}
        onClick={onRetry}
      >
        {retrying ? 'Ponawianie…' : 'Spróbuj ponownie'}
      </button>
    </div>
  )
}
