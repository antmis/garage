import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const WEEK = 1000 * 60 * 60 * 24 * 7

export const queryClient = new QueryClient({
  defaultOptions: {
    // gcTime must be at least the persister's maxAge, or restored queries are collected before they're used.
    queries: { staleTime: 30_000, gcTime: WEEK, retry: 2 },
  },
})

function safeLocalStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined // private mode or disabled: the persister becomes a no-op
  }
}

/**
 * The query cache, and any changes made while offline, persisted to localStorage: instant first paint and
 * checklist edits that survive a reload before they reach the server. The database stays the source of truth.
 */
export const persistOptions = {
  persister: createSyncStoragePersister({ storage: safeLocalStorage(), key: 'garage:cache' }),
  maxAge: WEEK,
  // Bump when a cached query's shape changes, so old caches are dropped instead of misread.
  buster: 'v2',
  dehydrateOptions: {
    // Device progress already lives in localStorage; a persisted copy could only be an older snapshot of it.
    shouldDehydrateQuery: (q: Parameters<typeof defaultShouldDehydrateQuery>[0]) =>
      defaultShouldDehydrateQuery(q) && q.queryKey[1] !== 'device',
  },
}
