import { useMutation, useQuery } from '@tanstack/react-query'
import { vehicles as catalog } from '@/data'
import type { Tables, TablesUpdate } from '../database.types'
import { supabase } from '../supabase'
import { queryClient } from './queryClient'

export type VehicleRow = Tables<'vehicles'>

export const vehicleKeys = {
  garage: (userId: string) => ['vehicles', userId] as const,
}

/**
 * The user's vehicle rows. Seeds one row per built-in vehicle the first time it's missing (idempotent: unique on
 * (user_id, catalog_key)), so every built-in vehicle always has a row to hang completions and details on.
 */
async function fetchGarage(userId: string): Promise<VehicleRow[]> {
  const select = () => supabase.from('vehicles').select('*').eq('user_id', userId).order('created_at')
  const { data, error } = await select()
  if (error) throw error

  const have = new Set(data.map((r) => r.catalog_key))
  const missing = catalog.filter((v) => !have.has(v.id))
  if (missing.length === 0) return data

  const { error: seedError } = await supabase.from('vehicles').upsert(
    missing.map((v) => ({
      user_id: userId,
      catalog_key: v.id,
      vehicle_type: v.vehicleType,
      model_year: v.year,
      make: v.make,
      model: v.model,
      trim: v.trim,
    })),
    { onConflict: 'user_id,catalog_key', ignoreDuplicates: true },
  )
  if (seedError) throw seedError
  const again = await select()
  if (again.error) throw again.error
  return again.data
}

export function useGarage(userId: string | null) {
  return useQuery({
    queryKey: vehicleKeys.garage(userId ?? ''),
    queryFn: () => fetchGarage(userId!),
    enabled: userId !== null,
  })
}

export function useUpdateVehicle(userId: string | null) {
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<'vehicles'> }) => {
      const { data, error } = await supabase.from('vehicles').update(patch).eq('id', id).select('*').single()
      if (error) throw new Error(error.code === '23505' ? 'Another vehicle already has this VIN' : 'Couldn’t save')
      return data
    },
    onSuccess: (row) => {
      if (!userId) return
      queryClient.setQueryData<VehicleRow[]>(vehicleKeys.garage(userId), (rows) =>
        rows?.map((r) => (r.id === row.id ? row : r)),
      )
    },
  })
}
