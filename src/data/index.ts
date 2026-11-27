import { streetTriple } from './street-triple'
import { tacoma } from './tacoma'
import type { Vehicle } from './types'

export type * from './types'

/** Every vehicle, in garage order. Adding one is a data-only change: write its folder and list it here. */
export const vehicles: readonly Vehicle[] = [tacoma, streetTriple]

/** Takes a raw route param or stored value, so unknown ids resolve to null rather than throwing. */
export function findVehicle(id: string | null | undefined): Vehicle | null {
  return vehicles.find((v) => v.id === id) ?? null
}

/** Short display name for headers and lists: "2024 Tacoma". */
export function vehicleName(v: Vehicle): string {
  return `${v.year} ${v.model}`
}

/** Model and trim, without the year: "Tacoma TRD Off-Road". */
export function vehicleModelTrim(v: Vehicle): string {
  return `${v.model} ${v.trim}`
}

/** Everything, for alt text and accessible labels: "2024 Toyota Tacoma TRD Off-Road". */
export function vehicleFullName(v: Vehicle): string {
  return `${v.year} ${v.make} ${v.model} ${v.trim}`
}

/** Make and trim, the line under the short name: "Toyota · TRD Off-Road". */
export function vehicleSubtitle(v: Vehicle): string {
  return `${v.make} · ${v.trim}`
}

/** Opened when nothing has been picked yet, and the target of pre-multi-vehicle links. */
export const DEFAULT_VEHICLE_ID: Vehicle['id'] = 'tacoma-2024'
