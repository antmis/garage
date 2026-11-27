import { describe, expect, it } from 'vitest'
import { vehicles } from '@/data'
import { fromKeys, toKeys } from './itemKeys'

describe('item id <-> (interval_key, task_key)', () => {
  it('splits at the first colon only', () => {
    expect(toKeys('30k:dusty:tighten-nuts-bolts')).toEqual({ interval_key: '30k', task_key: 'dusty:tighten-nuts-bolts' })
  })
  it('round-trips every shipped item id', () => {
    const ids = vehicles.flatMap((v) => v.schedule?.intervals.flatMap((iv) => iv.items.map((i) => i.id)) ?? [])
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) expect(fromKeys(toKeys(id))).toBe(id)
  })
})
