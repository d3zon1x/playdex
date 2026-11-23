type StarRatingProps = {
  value: number | null
  disabled?: boolean
  onChange: (rating: number | null) => void
}

const stars = [1, 2, 3, 4, 5]

export function StarRating({ value, disabled = false, onChange }: StarRatingProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex" role="radiogroup" aria-label="Ocena od 1 do 5">
        {stars.map((star) => {
          const filled = value != null && star <= value
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} z 5`}
              disabled={disabled}
              onClick={() => onChange(star)}
              className={`px-0.5 text-lg leading-none disabled:opacity-50 ${
                filled ? 'text-amber-300' : 'text-slate-600 hover:text-amber-200'
              }`}
            >
              ★
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className="text-sm text-slate-400 hover:text-white disabled:text-slate-600"
        disabled={disabled || value == null}
        onClick={() => onChange(null)}
      >
        Usuń ocenę
      </button>
    </div>
  )
}
