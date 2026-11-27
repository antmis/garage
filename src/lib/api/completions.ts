import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../supabase'
import { fromKeys, toKeys } from './itemKeys'
import { queryClient } from './queryClient'

export const completionKeys = {
  vehicle: (userId: string, vehicleRowId: string) => ['completions', userId, vehicleRowId] as const,
}

/** Completed item ids for one vehicle row. An array, not a Set, so the persisted cache round-trips. */
async function fetchCompletions(vehicleRowId: string): Promise<string[]> {
  // RLS scopes rows to the user; the vehicle_id filter is for correctness, not security.
  const { data, error } = await supabase
    .from('maintenance_completions')
    .select('interval_key, task_key')
    .eq('vehicle_id', vehicleRowId)
  if (error) throw error
  return data.map(fromKeys)
}

export function useCompletions(userId: string | null, vehicleRowId: string | null) {
  return useQuery({
    queryKey: completionKeys.vehicle(userId ?? '', vehicleRowId ?? ''),
    queryFn: () => fetchCompletions(vehicleRowId!),
    enabled: userId !== null && vehicleRowId !== null,
  })
}

export interface SetCompletionsVars {
  userId: string
  vehicleRowId: string
  itemIds: string[]
  done: boolean
}

async function writeCompletions({ vehicleRowId, itemIds, done }: SetCompletionsVars): Promise<void> {
  if (itemIds.length === 0) return
  if (done) {
    const { error } = await supabase
      .from('maintenance_completions')
      .upsert(itemIds.map((id) => ({ vehicle_id: vehicleRowId, ...toKeys(id) })), {
        onConflict: 'vehicle_id,task_key,interval_key',
        ignoreDuplicates: true,
      })
    if (error) throw error
    return
  }
  // One delete per interval: PostgREST can't filter on (interval_key, task_key) pairs in a single `in`.
  const byInterval = new Map<string, string[]>()
  for (const id of itemIds) {
    const { interval_key, task_key } = toKeys(id)
    byInterval.set(interval_key, [...(byInterval.get(interval_key) ?? []), task_key])
  }
  for (const [interval_key, tasks] of byInterval) {
    const { error } = await supabase
      .from('maintenance_completions')
      .delete()
      .eq('vehicle_id', vehicleRowId)
      .eq('interval_key', interval_key)
      .in('task_key', tasks)
    if (error) throw error
  }
}

const SET_COMPLETIONS = ['completions', 'set'] as const

// Registered on the client rather than in the hook: a change made offline is persisted and resumed after a
// reload, when no component's hook options exist, so the function and callbacks must be found by key.
queryClient.setMutationDefaults(SET_COMPLETIONS, {
  mutationFn: writeCompletions,
  // One queue for every checklist write, so toggling an item on then off offline replays in that order.
  scope: { id: 'completions' },
  onMutate: async ({ userId, vehicleRowId, itemIds, done }: SetCompletionsVars) => {
    const key = completionKeys.vehicle(userId, vehicleRowId)
    await queryClient.cancelQueries({ queryKey: key })
    const before = new Set(queryClient.getQueryData<string[]>(key) ?? [])
    const next = new Set(before)
    for (const id of itemIds) {
      if (done) next.add(id)
      else next.delete(id)
    }
    queryClient.setQueryData<string[]>(key, [...next])
    return { wasDone: itemIds.filter((id) => before.has(id)) }
  },
  onError: (_e, { userId, vehicleRowId, itemIds }: SetCompletionsVars, ctx) => {
    // Roll back only these ids so concurrent toggles on other rows survive.
    const wasDone = new Set((ctx as { wasDone: string[] } | undefined)?.wasDone ?? [])
    queryClient.setQueryData<string[]>(completionKeys.vehicle(userId, vehicleRowId), (cur = []) => {
      const reverted = new Set(cur)
      for (const id of itemIds) {
        if (wasDone.has(id)) reverted.add(id)
        else reverted.delete(id)
      }
      return [...reverted]
    })
    toast.error('Couldn’t save. Change undone.')
  },
  onSettled: (_d, _e, { userId, vehicleRowId }: SetCompletionsVars) => {
    // Refetch once the queue drains; refetching mid-queue would flash older server state over optimistic rows.
    if (queryClient.isMutating({ mutationKey: SET_COMPLETIONS }) === 1) {
      void queryClient.invalidateQueries({ queryKey: completionKeys.vehicle(userId, vehicleRowId) })
    }
  },
})

export function useSetCompletions() {
  return useMutation<void, Error, SetCompletionsVars>({ mutationKey: SET_COMPLETIONS })
}
