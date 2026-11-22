import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export type HealthResponse = {
  status: string
  /** "mock" = backend serves sample data instead of RAWG (RAWG_MOCK=true). */
  catalog?: 'rawg' | 'mock'
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get<HealthResponse>('/api/health')
      return data
    },
    retry: false,
  })
}
