import { createContext, useContext } from 'react'
import type { Vehicle } from '@/data'

export interface ChecklistState {
  vehicle: Vehicle
  done: ReadonlySet<string>
  /** True only while remote progress is first loading; local progress is always shown immediately. */
  loading: boolean
  toggle: (itemId: string, done: boolean) => void
  setMany: (itemIds: string[], done: boolean) => void
}

export const ChecklistContext = createContext<ChecklistState | null>(null)

export function useChecklist(): ChecklistState {
  const ctx = useContext(ChecklistContext)
  if (!ctx) throw new Error('useChecklist must be used within ChecklistProvider')
  return ctx
}
