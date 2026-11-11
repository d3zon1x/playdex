import { useCallback, useEffect, useRef } from 'react'

/**
 * Returns `run` (calls `callback` after `delay` ms of silence) and `cancel`
 * (drops the pending call — use it when the value is applied right away, e.g. on Enter).
 */
export function useDebouncedCallback<Args extends unknown[]>(callback: (...args: Args) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latest = useRef(callback)

  useEffect(() => {
    latest.current = callback
  }, [callback])

  useEffect(() => () => clearTimeout(timer.current), [])

  const run = useCallback(
    (...args: Args) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => latest.current(...args), delay)
    },
    [delay],
  )

  const cancel = useCallback(() => clearTimeout(timer.current), [])

  return { run, cancel }
}
