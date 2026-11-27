import { useMemo } from 'react'
import type { Vehicle } from '@/data'
import type { Progress } from '../types'
import { overallProgress } from '../utils/progress'
import { useProgressSource } from './useProgressSource'

/** Overall progress for screens outside a vehicle's checklist. Null without a schedule or before data arrives. */
export function useVehicleProgress(vehicle: Vehicle): Progress | null {
  const { data } = useProgressSource(vehicle.id)
  return useMemo(
    () => (vehicle.schedule && data ? overallProgress(vehicle.schedule, new Set(data)) : null),
    [vehicle.schedule, data],
  )
}
