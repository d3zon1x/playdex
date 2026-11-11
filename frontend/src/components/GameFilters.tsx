import type { ReactNode } from 'react'
import { gameOrderings } from '../hooks/useGameFilters'
import { useGenres, usePlatforms } from '../hooks/useGames'
import type { FilterOption, GameFilters as Filters, GameOrdering } from '../lib/types'

type GameFiltersProps = {
  filters: Filters
  activeCount: number
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear + 1 - 1980 + 1 }, (_, index) => currentYear + 1 - index)

export function GameFilters({ filters, activeCount, onChange, onClear }: GameFiltersProps) {
  const genres = useGenres()
  const platforms = usePlatforms()

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <OptionSelect
        id="filter-genre"
        label="Gatunek"
        value={filters.genre}
        options={genres.data}
        loading={genres.isPending}
        failed={genres.isError}
        onChange={(genre) => onChange({ genre })}
      />
      <OptionSelect
        id="filter-platform"
        label="Platforma"
        value={filters.platform}
        options={platforms.data}
        loading={platforms.isPending}
        failed={platforms.isError}
        onChange={(platform) => onChange({ platform })}
      />
      <Field id="filter-year-from" label="Rok od">
        <select
          id="filter-year-from"
          className={selectClass}
          value={filters.yearFrom ?? ''}
          onChange={(event) => onChange({ yearFrom: toNumber(event.target.value) })}
        >
          <option value="">Dowolny</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </Field>
      <Field id="filter-year-to" label="Rok do">
        <select
          id="filter-year-to"
          className={selectClass}
          value={filters.yearTo ?? ''}
          onChange={(event) => onChange({ yearTo: toNumber(event.target.value) })}
        >
          <option value="">Dowolny</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </Field>
      <Field id="filter-ordering" label="Sortuj według">
        <select
          id="filter-ordering"
          className={selectClass}
          value={filters.ordering}
          onChange={(event) => onChange({ ordering: event.target.value as GameOrdering })}
        >
          {gameOrderings.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      {activeCount > 0 && (
        <div className="sm:col-span-2 lg:col-span-5">
          <button type="button" onClick={onClear} className="text-sm text-slate-400 underline hover:text-slate-200">
            Wyczyść filtry ({activeCount})
          </button>
        </div>
      )}
    </div>
  )
}

const selectClass =
  'w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-white/30 disabled:text-slate-500'

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
    </div>
  )
}

function OptionSelect({
  id,
  label,
  value,
  options,
  loading,
  failed,
  onChange,
}: {
  id: string
  label: string
  value: number | null
  options: FilterOption[] | undefined
  loading: boolean
  failed: boolean
  onChange: (value: number | null) => void
}) {
  const placeholder = loading ? 'Ładowanie…' : failed ? 'Niedostępne' : 'Wszystkie'
  return (
    <Field id={id} label={label}>
      <select
        id={id}
        className={selectClass}
        value={value ?? ''}
        disabled={!options}
        onChange={(event) => onChange(toNumber(event.target.value))}
      >
        <option value="">{placeholder}</option>
        {options?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </Field>
  )
}

function toNumber(value: string) {
  return value ? Number(value) : null
}
