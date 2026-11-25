import { useState } from 'react'
import type { MaintenanceItem } from '@/data'
import { Skeleton, YStack } from '@/ui'
import { useChecklist } from '../hooks/ChecklistContext'
import type { ItemFilter } from '../types'
import { matchesFilter } from '../utils/progress'
import { FilterChips } from './FilterChips'
import { IntervalSection } from './IntervalSection'
import { ItemDetailSheet } from './ItemDetailSheet'

/** The interval that starts expanded. */
const DEFAULT_OPEN = ['30k']

export function Checklist() {
  const { vehicle, done, loading, toggle, setMany } = useChecklist()
  const [filter, setFilter] = useState<ItemFilter>('all')
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set(DEFAULT_OPEN))
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = (() => {
    for (const interval of vehicle.intervals) {
      const item = interval.items.find((i) => i.id === selectedId)
      if (item) return { item, interval }
    }
    return null
  })()

  function setOpen(id: string, open: boolean) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (open) next.add(id)
      else next.delete(id)
      return next
    })
  }

  if (loading) {
    return (
      <YStack gap={3}>
        <Skeleton className="h-11 w-60 rounded-full" />
        {vehicle.intervals.slice(0, 5).map((i) => <Skeleton key={i.id} className="h-20 w-full rounded-xl" />)}
      </YStack>
    )
  }

  return (
    <YStack gap={4}>
      <FilterChips value={filter} onChange={setFilter} />
      <YStack gap={3}>
        {vehicle.intervals
          // A filter that empties an interval hides it; with “All” every interval always shows.
          .filter((iv) => filter === 'all' || iv.items.some((i) => matchesFilter(i, done, filter)))
          .map((interval) => (
            <IntervalSection
              key={interval.id}
              interval={interval}
              conditionHeadings={vehicle.conditionHeadings}
              done={done}
              filter={filter}
              open={openIds.has(interval.id)}
              onOpenChange={(o) => setOpen(interval.id, o)}
              onToggle={toggle}
              onOpenItem={(item: MaintenanceItem) => setSelectedId(item.id)}
              onReset={(ids) => setMany(ids, false)}
            />
          ))}
      </YStack>
      <ItemDetailSheet
        item={selected?.item ?? null}
        interval={selected?.interval ?? null}
        done={selected ? done.has(selected.item.id) : false}
        onDoneChange={(v) => selected && toggle(selected.item.id, v)}
        onClose={() => setSelectedId(null)}
      />
    </YStack>
  )
}
