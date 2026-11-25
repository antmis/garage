import { readStorage, writeStorage } from '@/lib/storage'
import type { ProgressRepository, VehicleId } from '../types'

export const localProgressKey = (vehicleId: VehicleId) => `garage:progress:${vehicleId}`

function read(vehicleId: VehicleId): Set<string> {
  const raw = readStorage(localProgressKey(vehicleId))
  if (!raw) return new Set()
  try {
    const parsed: unknown = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [])
  } catch {
    return new Set()
  }
}

/** Default repository: works with zero setup. Synchronous underneath; async only to match the interface. */
export class LocalProgressRepository implements ProgressRepository {
  private vehicleId: VehicleId

  constructor(vehicleId: VehicleId) {
    this.vehicleId = vehicleId
  }

  async load() {
    return read(this.vehicleId)
  }

  async set(itemId: string, done: boolean) {
    await this.setMany([itemId], done)
  }

  async setMany(itemIds: string[], done: boolean) {
    const current = read(this.vehicleId)
    for (const id of itemIds) {
      if (done) current.add(id)
      else current.delete(id)
    }
    writeStorage(localProgressKey(this.vehicleId), JSON.stringify([...current]))
  }
}

export function readLocalProgress(vehicleId: VehicleId): Set<string> {
  return read(vehicleId)
}

export function writeLocalProgress(vehicleId: VehicleId, ids: ReadonlySet<string>): void {
  writeStorage(localProgressKey(vehicleId), JSON.stringify([...ids]))
}
