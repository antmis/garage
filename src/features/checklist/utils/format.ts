/** Compacts a catalog time estimate for a one-line row: "About 30 minutes at a shop" → "~30 min". */
export function shortTime(time: string): string {
  return time
    .replace(/^about\s+/i, '~')
    .replace(/\s+at a shop$/i, '')
    .replace(/\s*minutes?\b/i, ' min')
    .replace(/\s*hours?\b/i, ' hr')
}
