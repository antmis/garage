import { createContext, useContext } from 'react'
import type { Schedule, Vehicle } from '@/data'
import type { ItemFilter } from '../types'

export interface ChecklistState {
  vehicle: Vehicle
  /** This user's `vehicles.id` for the vehicle; null when signed out (device progress) or still loading. */
  vehicleRowId: string | null
  /** Null until the vehicle's schedule is written; screens show a “coming soon” state. */
  schedule: Schedule | null
  done: ReadonlySet<string>
  /** True only on a first-ever account load; device progress and the persisted cache paint immediately. */
  loading: boolean
  toggle: (itemId: string, done: boolean) => void
  setMany: (itemIds: string[], done: boolean) => void
  /** Shared by the home table and every interval page, so it survives navigating between them. */
  filter: ItemFilter
  setFilter: (filter: ItemFilter) => void
}

export const ChecklistContext = createContext<ChecklistState | null>(null)

export function useChecklist(): ChecklistState {
  const ctx = useContext(ChecklistContext)
  if (!ctx) throw new Error('useChecklist must be used within ChecklistProvider')
  return ctx
}
