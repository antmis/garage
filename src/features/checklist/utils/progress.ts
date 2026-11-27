import type { MaintenanceItem, Schedule, ServiceInterval } from '@/data'
import type { ItemFilter, Progress } from '../types'

/**
 * Only unconditional items count toward progress. Items in a conditional group (special driving
 * conditions) and items with their own condition (e.g. Hawaii-only) stay checkable but never gate “done”.
 */
export function isCounted(schedule: Schedule, item: MaintenanceItem): boolean {
  return !item.condition && !schedule.groups.find((g) => g.id === item.group)?.conditional
}

export function intervalProgress(schedule: Schedule, interval: ServiceInterval, done: ReadonlySet<string>): Progress {
  const counted = interval.items.filter((i) => isCounted(schedule, i))
  return { total: counted.length, done: counted.filter((i) => done.has(i.id)).length }
}

export function overallProgress(schedule: Schedule, done: ReadonlySet<string>): Progress {
  return schedule.intervals.reduce<Progress>(
    (acc, iv) => {
      const p = intervalProgress(schedule, iv, done)
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
