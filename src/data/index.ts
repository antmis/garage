import { tacoma } from './tacoma'
import type { Vehicle } from './types'

export type * from './types'

const vehicles: Record<Vehicle['id'], Vehicle> = { 'tacoma-2024': tacoma }

export function getVehicle(id: Vehicle['id']): Vehicle {
  return vehicles[id]
}

export const DEFAULT_VEHICLE_ID: Vehicle['id'] = 'tacoma-2024'
