import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProgressRepository, VehicleId } from '../types'

const TABLE = 'maintenance_progress'

/**
 * TEMPORARY: rows are keyed by a typed, unverified email (`owner_email`) and the table's
 * RLS policies are open to `anon`. Replace with Supabase Auth by swapping `owner_email`
 * for `auth.uid()` in this file and in the migration's policies.
 */
export class SupabaseProgressRepository implements ProgressRepository {
  private client: SupabaseClient
  private ownerEmail: string
  private vehicleId: VehicleId

  constructor(client: SupabaseClient, ownerEmail: string, vehicleId: VehicleId) {
    this.client = client
    this.ownerEmail = ownerEmail
    this.vehicleId = vehicleId
  }

  async load() {
    const { data, error } = await this.client
      .from(TABLE)
      .select('item_id')
      .eq('owner_email', this.ownerEmail)
      .eq('vehicle_id', this.vehicleId)
    if (error) throw error
    return new Set((data ?? []).map((r) => r.item_id as string))
  }

  async set(itemId: string, done: boolean) {
    await this.setMany([itemId], done)
  }

  async setMany(itemIds: string[], done: boolean) {
    if (itemIds.length === 0) return
    if (done) {
      const { error } = await this.client.from(TABLE).upsert(
        itemIds.map((item_id) => ({ owner_email: this.ownerEmail, vehicle_id: this.vehicleId, item_id })),
        { onConflict: 'owner_email,vehicle_id,item_id', ignoreDuplicates: true },
      )
      if (error) throw error
      return
    }
    const { error } = await this.client
      .from(TABLE)
      .delete()
      .eq('owner_email', this.ownerEmail)
      .eq('vehicle_id', this.vehicleId)
      .in('item_id', itemIds)
    if (error) throw error
  }
}
