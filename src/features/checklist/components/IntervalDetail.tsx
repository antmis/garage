import { useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Schedule, ServiceInterval } from '@/data'
import { useStickyOffset } from '@/lib/useStickyOffset'
import { Button, ChecklistRow, ConfirmDialog, ListGroup, Progress, Skeleton, Typography, XStack, YStack } from '@/ui'
import { useChecklist } from '../hooks/ChecklistContext'
import { intervalTiming, intervalTitle, shortTime } from '../utils/format'
import { intervalProgress, matchesFilter, percent } from '../utils/progress'
import { FilterChips } from './FilterChips'
import { ItemDetailSheet } from './ItemDetailSheet'

interface IntervalDetailProps {
  /** The vehicle's schedule; supplies the group order and headings. */
  schedule: Schedule
  interval: ServiceInterval
}

/** Body of an interval page: header, filter and the grouped task rows. Same component for every interval. */
export function IntervalDetail({ schedule, interval }: IntervalDetailProps) {
  const { done, loading, toggle, setMany, filter, setFilter } = useChecklist()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Group headings stick right below this pinned header, so they need its height.
  const headerRef = useRef<HTMLDivElement>(null)
  useStickyOffset(headerRef, '--interval-header-h')

  const progress = intervalProgress(schedule, interval, done)
  const timing = intervalTiming(interval)
  const complete = progress.total > 0 && progress.done === progress.total
  const visible = interval.items.filter((i) => matchesFilter(i, done, filter))
  const checkedIds = interval.items.filter((i) => done.has(i.id)).map((i) => i.id)
  const selected = interval.items.find((i) => i.id === selectedId) ?? null

  return (
    <YStack gap={0}>
      {/* Header and filter stay pinned under the top bar; the task groups scroll behind them.
          Its bottom padding is the only gap above the first card, so that card's heading starts already pinned. */}
      <div
        ref={headerRef}
        className="sticky top-[var(--app-header-h,0px)] z-20 -mx-4 -mt-5 grid gap-3 bg-background px-4 pb-4 pt-5 lg:-mx-8 lg:-mt-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8 lg:pt-8"
      >
        <XStack align="baseline" gap={2} wrap className="min-w-0">
          <Typography as="h1" variant="heading" className="text-2xl">
            {intervalTitle(interval)}
          </Typography>
          <Typography as="span" variant="muted">
            {timing && `${timing} · `}
            <Typography as="span" numeric color={complete ? 'success' : 'muted'}>
              {progress.done} / {progress.total} done
            </Typography>
          </Typography>
        </XStack>
        {/* Last on mobile (below the bar); beside the title on desktop. */}
        <div className="order-last lg:order-none">
          <FilterChips value={filter} onChange={setFilter} />
        </div>
        <Progress value={percent(progress)} label={`${interval.label} progress`} className="h-1.5 lg:col-span-2" />
      </div>

      {interval.notes?.map((n, i) => (
        <Typography key={i} variant="small" className="mb-3">{n}</Typography>
      ))}

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <YStack gap={3}>
          {visible.length === 0 && (
            <Typography variant="muted" className="py-6 text-center">Nothing to show with this filter.</Typography>
          )}

          {schedule.groups.map(({ id, heading }) => {
            const items = visible.filter((i) => i.group === id)
            if (items.length === 0) return null
            return (
              // overflow-clip, not hidden: hidden makes a scroll container and the heading would stop sticking.
              <section key={id} className="overflow-clip rounded-xl border bg-card">
                {/* Pins 1px down, where it already sits below the card's top border, so it pins with no scroll.
                    The top shadow fills that 1px once the border has scrolled away. */}
                <Typography
                  variant="meta"
                  className="sticky top-[calc(var(--app-header-h,0px)+var(--interval-header-h,0px)+1px)] z-10 border-b shadow-[0_-1px_0_hsl(var(--border))] bg-muted px-4 py-2"
                >
                  {heading}
                </Typography>
                <ListGroup>
                  {items.map((item) => (
                    <ChecklistRow
                      key={item.id}
                      title={item.name}
                      note={item.condition}
                      aside={item.time && shortTime(item.time)}
                      checked={done.has(item.id)}
                      onCheckedChange={(v) => toggle(item.id, v)}
                      onOpen={() => setSelectedId(item.id)}
                      checkLabel={`${item.name}, ${interval.label}`}
                      openLabel={`Open details for ${item.name}`}
                    />
                  ))}
                </ListGroup>
              </section>
            )
          })}

          <XStack justify="end">
            <Button variant="ghost" size="lg" disabled={checkedIds.length === 0} onClick={() => setConfirmOpen(true)}>
              <RotateCcw /> Reset this interval
            </Button>
          </XStack>
        </YStack>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reset this interval?"
        description={`Uncheck all ${checkedIds.length} completed item${checkedIds.length === 1 ? '' : 's'} in ${interval.label}. This can’t be undone.`}
        confirmLabel="Reset"
        onConfirm={() => setMany(checkedIds, false)}
      />
      <ItemDetailSheet
        item={selected}
        interval={selected ? interval : null}
        done={selected ? done.has(selected.id) : false}
        onDoneChange={(v) => selected && toggle(selected.id, v)}
        onClose={() => setSelectedId(null)}
      />
    </YStack>
  )
}
