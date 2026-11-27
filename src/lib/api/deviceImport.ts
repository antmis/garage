import { vehicles as catalog, type VehicleId } from '@/data'
import { supabase } from '../supabase'
import { clearDeviceProgress, readDeviceProgress } from './deviceProgress'
import { fromKeys, toKeys } from './itemKeys'
import { queryClient } from './queryClient'
import type { VehicleRow } from './vehicles'

// Moving guest progress into an account after sign-in. Completions are only "done" ticks, so combining can't lose
// work; the person still decides when an existing account would gain items from this device.

export interface DeviceImportPlan {
  /** Per vehicle row: device items the account doesn't have yet. */
  additions: { vehicleRowId: string; itemIds: string[] }[]
  /** Total items in `additions`. */
  count: number
  /** No completions at all yet, e.g. a brand-new account: add without asking. */
  accountEmpty: boolean
}

/** Null when this device holds no guest progress. */
export async function planDeviceImport(rows: VehicleRow[]): Promise<DeviceImportPlan | null> {
  const device = catalog
    .map((v) => ({ vehicleId: v.id, rowId: rows.find((r) => r.catalog_key === v.id)?.id, ids: readDeviceProgress(v.id) }))
    .filter((d): d is { vehicleId: VehicleId; rowId: string; ids: string[] } => !!d.rowId && d.ids.length > 0)
  if (device.length === 0) return null

  const { data, error } = await supabase
    .from('maintenance_completions')
    .select('vehicle_id, interval_key, task_key')
    .in('vehicle_id', rows.map((r) => r.id))
  if (error) throw error

  const additions = device
    .map((d) => {
      const have = new Set(data.filter((r) => r.vehicle_id === d.rowId).map(fromKeys))
      return { vehicleRowId: d.rowId, itemIds: d.ids.filter((id) => !have.has(id)) }
    })
    .filter((a) => a.itemIds.length > 0)
  return { additions, count: additions.reduce((n, a) => n + a.itemIds.length, 0), accountEmpty: data.length === 0 }
}

/** Idempotent upsert, so a retry or a second device never duplicates anything. Clears the device copy after. */
export async function addDeviceProgress(plan: DeviceImportPlan): Promise<void> {
  for (const { vehicleRowId, itemIds } of plan.additions) {
    const { error } = await supabase.from('maintenance_completions').upsert(
      itemIds.flatMap((id) => {
        try {
          return [{ vehicle_id: vehicleRowId, ...toKeys(id) }]
        } catch {
          return [] // a malformed id isn't worth failing the import over
        }
      }),
      { onConflict: 'vehicle_id,task_key,interval_key', ignoreDuplicates: true },
    )
    if (error) throw error
  }
  discardDeviceProgress()
  await queryClient.invalidateQueries({ queryKey: ['completions'] })
}

export function discardDeviceProgress(): void {
  for (const v of catalog) clearDeviceProgress(v.id)
}
