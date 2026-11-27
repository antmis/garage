import type { Schedule, ServiceInterval, Vehicle } from '@/data'

export function vehiclePath(vehicleId: Vehicle['id']): string {
  return `/${vehicleId}`
}

/** Miles where there are any, so URLs read like the manual (/tacoma-2024/interval/30000); time-only services use their id. */
function intervalKey(interval: ServiceInterval): string {
  return interval.miles !== undefined ? String(interval.miles) : interval.id
}

export function intervalPath(vehicleId: Vehicle['id'], interval: ServiceInterval): string {
  return `${vehiclePath(vehicleId)}/interval/${intervalKey(interval)}`
}

export function findInterval(schedule: Schedule | null, key: string | undefined): ServiceInterval | null {
  return schedule?.intervals.find((iv) => intervalKey(iv) === key) ?? null
}
