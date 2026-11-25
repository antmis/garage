import type { ServiceInterval, Vehicle } from '@/data'

/** Keyed on miles, not the interval id, so URLs read like the manual (/interval/30000). */
export function intervalPath(interval: ServiceInterval): string {
  return `/interval/${interval.miles}`
}

export function findIntervalByMiles(vehicle: Vehicle, miles: string | undefined): ServiceInterval | null {
  return vehicle.intervals.find((iv) => String(iv.miles) === miles) ?? null
}
