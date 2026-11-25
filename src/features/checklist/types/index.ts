import type { Vehicle } from '@/data'

export type VehicleId = Vehicle['id']

export interface ProgressRepository {
  /** Ids of every completed item for the vehicle. */
  load(): Promise<Set<string>>
  set(itemId: string, done: boolean): Promise<void>
  /** Batch form of `set`, used by “reset this interval” and the first-sync merge. */
  setMany(itemIds: string[], done: boolean): Promise<void>
}

export type ItemFilter = 'all' | 'todo' | 'done'

export interface Progress {
  done: number
  total: number
}
