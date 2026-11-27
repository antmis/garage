import { useQuery } from '@tanstack/react-query'
import type { VehicleId } from '@/data'
import { readStorage, writeStorage } from '../storage'
import { queryClient } from './queryClient'

// Progress for people without an account: completed item ids per vehicle, in this device's localStorage only.
// Signing in moves it into the account (importDeviceProgress) and clears it here.

const storageKey = (vehicleId: VehicleId) => `garage:device-progress:${vehicleId}`
export const deviceProgressKey = (vehicleId: VehicleId) => ['completions', 'device', vehicleId] as const

export function readDeviceProgress(vehicleId: VehicleId): string[] {
  const raw = readStorage(storageKey(vehicleId))
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function clearDeviceProgress(vehicleId: VehicleId): void {
  writeStorage(storageKey(vehicleId), null)
  queryClient.removeQueries({ queryKey: deviceProgressKey(vehicleId) })
}

/** Reads through the query cache so device and account progress share one shape for components. */
export function useDeviceProgress(vehicleId: VehicleId, enabled: boolean) {
  return useQuery({
    queryKey: deviceProgressKey(vehicleId),
    queryFn: () => readDeviceProgress(vehicleId),
    enabled,
    networkMode: 'always',
    staleTime: Infinity,
  })
}

/** Synchronous: localStorage is the store, the cache update just re-renders. */
export function setDeviceProgress(vehicleId: VehicleId, itemIds: string[], done: boolean): void {
  const next = new Set(readDeviceProgress(vehicleId))
  for (const id of itemIds) {
    if (done) next.add(id)
    else next.delete(id)
  }
  const ids = [...next]
  writeStorage(storageKey(vehicleId), ids.length > 0 ? JSON.stringify(ids) : null)
  queryClient.setQueryData(deviceProgressKey(vehicleId), ids)
}
