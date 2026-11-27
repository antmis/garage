import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Vehicle } from '@/data'
import { useSetCompletions } from '@/lib/api/completions'
import { setDeviceProgress } from '@/lib/api/deviceProgress'
import { ChecklistContext } from '../hooks/ChecklistContext'
import { useProgressSource } from '../hooks/useProgressSource'
import type { ItemFilter } from '../types'

interface ChecklistProviderProps {
  vehicle: Vehicle
  children: ReactNode
}

const EMPTY: ReadonlySet<string> = new Set()

export function ChecklistProvider({ vehicle, children }: ChecklistProviderProps) {
  const [filter, setFilter] = useState<ItemFilter>('all')
  const { guest, userId, rowId, data, failed, authLoading } = useProgressSource(vehicle.id)
  const { mutate } = useSetCompletions()

  const done = useMemo(() => (data ? new Set(data) : EMPTY), [data])
  // The persisted cache usually answers instantly; skeletons only on a first-ever account load.
  const loading = authLoading || (!data && !failed)

  const apply = useCallback(
    (itemIds: string[], value: boolean) => {
      if (itemIds.length === 0) return
      if (guest) setDeviceProgress(vehicle.id, itemIds, value)
      else if (userId && rowId) mutate({ userId, vehicleRowId: rowId, itemIds, done: value })
    },
    [guest, mutate, userId, rowId, vehicle.id],
  )

  const value = useMemo(
    () => ({
      vehicle,
      vehicleRowId: rowId,
      schedule: vehicle.schedule ?? null,
      done,
      loading,
      toggle: (itemId: string, v: boolean) => apply([itemId], v),
      setMany: apply,
      filter,
      setFilter,
    }),
    [vehicle, rowId, done, loading, apply, filter],
  )

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>
}
