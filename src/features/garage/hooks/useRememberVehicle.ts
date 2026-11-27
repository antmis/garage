import { useEffect } from 'react'
import type { VehicleId } from '@/data'
import { writeLastVehicleId } from '../utils/lastVehicle'

/** Records the vehicle being viewed so `/` reopens it next time. */
export function useRememberVehicle(id: VehicleId | undefined): void {
  useEffect(() => {
    if (id) writeLastVehicleId(id)
  }, [id])
}
