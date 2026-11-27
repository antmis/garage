import { DEFAULT_VEHICLE_ID, findVehicle, type VehicleId } from '@/data'
import { readStorage, writeStorage } from '@/lib/storage'

const KEY = 'garage:last-vehicle'

/** Falls back to the default when nothing is stored or the stored vehicle no longer exists. */
export function readLastVehicleId(): VehicleId {
  return findVehicle(readStorage(KEY))?.id ?? DEFAULT_VEHICLE_ID
}

export function writeLastVehicleId(id: VehicleId): void {
  writeStorage(KEY, id)
}
