import type { MaintenanceItem, ServiceInterval, Vehicle } from '@/data'
import type { ItemFilter, Progress } from '../types'

/**
 * Only unconditional items count toward progress. Special-condition items and
 * region-specific ones (e.g. Hawaii-only) stay checkable but never gate “done”.
 */
export function isCounted(item: MaintenanceItem): boolean {
  return (item.group === 'scheduled' || item.group === 'inspect') && !item.condition
}

export function intervalProgress(interval: ServiceInterval, done: ReadonlySet<string>): Progress {
  const counted = interval.items.filter(isCounted)
  return { total: counted.length, done: counted.filter((i) => done.has(i.id)).length }
}

export function overallProgress(vehicle: Vehicle, done: ReadonlySet<string>): Progress {
  return vehicle.intervals.reduce<Progress>(
    (acc, iv) => {
      const p = intervalProgress(iv, done)
      return { done: acc.done + p.done, total: acc.total + p.total }
    },
    { done: 0, total: 0 },
  )
}

export function matchesFilter(item: MaintenanceItem, done: ReadonlySet<string>, filter: ItemFilter): boolean {
  if (filter === 'all') return true
  return filter === 'done' ? done.has(item.id) : !done.has(item.id)
}

export function percent({ done, total }: Progress): number {
  return total === 0 ? 0 : Math.round((done / total) * 100)
}
