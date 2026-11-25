import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import type { Vehicle } from '@/data'
import { supabase } from '@/lib/supabase'
import { readStorage, writeStorage } from '@/lib/storage'
import { useIdentity } from '@/features/identity'
import { ChecklistContext } from '../hooks/ChecklistContext'
import type { ItemFilter } from '../types'
import { readLocalProgress, writeLocalProgress } from '../utils/localRepository'
import { SupabaseProgressRepository } from '../utils/supabaseRepository'

interface ChecklistProviderProps {
  vehicle: Vehicle
  children: ReactNode
}

export function ChecklistProvider({ vehicle, children }: ChecklistProviderProps) {
  const { email } = useIdentity()
  const [filter, setFilter] = useState<ItemFilter>('all')
  const [done, setDone] = useState<ReadonlySet<string>>(() => readLocalProgress(vehicle.id))
  // Which remote the current `done` has been reconciled with; loading = a remote exists and isn't reconciled yet.
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const remote = useMemo(
    () => (email && supabase ? new SupabaseProgressRepository(supabase, email, vehicle.id) : null),
    [email, vehicle.id],
  )
  const remoteKey = remote ? `${email}:${vehicle.id}` : null
  const loading = remoteKey !== null && loadedFor !== remoteKey

  useEffect(() => {
    if (!remote || !remoteKey) return
    let cancelled = false
    const syncedFlag = `garage:synced:${remoteKey}`

    remote
      .load()
      .then(async (remoteDone) => {
        let next = remoteDone
        // First sync for this email: union both sides instead of letting either overwrite the other.
        if (readStorage(syncedFlag) === null) {
          const local = readLocalProgress(vehicle.id)
          await remote.setMany([...local].filter((id) => !remoteDone.has(id)), true)
          next = new Set([...remoteDone, ...local])
          writeStorage(syncedFlag, '1')
        }
        if (cancelled) return
        writeLocalProgress(vehicle.id, next)
        setDone(next)
      })
      .catch(() => {
        if (!cancelled) toast.error('Couldn’t reach sync. Showing what’s saved on this device.')
      })
      .finally(() => {
        if (!cancelled) setLoadedFor(remoteKey)
      })

    return () => {
      cancelled = true
    }
  }, [remote, remoteKey, vehicle.id])

  const apply = useCallback(
    (ids: string[], value: boolean) => {
      if (ids.length === 0) return
      const before = done
      const next = new Set(done)
      for (const id of ids) {
        if (value) next.add(id)
        else next.delete(id)
      }
      setDone(next)
      writeLocalProgress(vehicle.id, next)

      remote?.setMany(ids, value).catch(() => {
        // Roll back only these ids so concurrent toggles on other rows survive.
        setDone((cur) => {
          const reverted = new Set(cur)
          for (const id of ids) {
            if (before.has(id)) reverted.add(id)
            else reverted.delete(id)
          }
          writeLocalProgress(vehicle.id, reverted)
          return reverted
        })
        toast.error('Couldn’t save to sync. Change undone.')
      })
    },
    [done, remote, vehicle.id],
  )

  const value = useMemo(
    () => ({
      vehicle,
      done,
      loading,
      toggle: (itemId: string, v: boolean) => apply([itemId], v),
      setMany: apply,
      filter,
      setFilter,
    }),
    [vehicle, done, loading, apply, filter],
  )

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>
}
