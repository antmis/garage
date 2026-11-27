import type { ServiceInterval } from '@/data'

/** Compacts a catalog time estimate for a one-line row: "About 30 minutes at a shop" → "~30 min". */
export function shortTime(time: string): string {
  return time
    .replace(/^about\s+/i, '~')
    .replace(/\s+at a shop$/i, '')
    .replace(/\s*minutes?\b/i, ' min')
    .replace(/\s*hours?\b/i, ' hr')
}

const miles = (n: number) => n.toLocaleString('en-US')

/** "30,000 miles", or the label of a time-only service ("Annual service"). */
export function intervalTitle(interval: ServiceInterval): string {
  return interval.miles !== undefined ? `${miles(interval.miles)} miles` : interval.label
}

/** Compact form for the nav and table: "30,000", or the label of a time-only service. */
export function intervalShortTitle(interval: ServiceInterval): string {
  return interval.miles !== undefined ? miles(interval.miles) : interval.label
}

/** "or 36 months" beside a mileage, "every 12 months" on its own, null when the service has no time limit. */
export function intervalTiming(interval: ServiceInterval): string | null {
  if (interval.months === undefined) return null
  const span = `${interval.months} month${interval.months === 1 ? '' : 's'}`
  return interval.miles !== undefined ? `or ${span}` : `every ${span}`
}
