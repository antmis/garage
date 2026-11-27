// Item ids are `<interval>:<slug>` or `<interval>:<group>:<slug>`; the database stores them split at the first
// ':' as (interval_key, task_key). Both directions must stay exact inverses or saved progress is lost.

export function toKeys(itemId: string): { interval_key: string; task_key: string } {
  const i = itemId.indexOf(':')
  if (i <= 0 || i === itemId.length - 1) throw new Error(`Malformed item id: ${itemId}`)
  return { interval_key: itemId.slice(0, i), task_key: itemId.slice(i + 1) }
}

export function fromKeys(row: { interval_key: string; task_key: string }): string {
  return `${row.interval_key}:${row.task_key}`
}
