import { useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import type { ItemGroup, MaintenanceItem, ServiceInterval, Vehicle } from '@/data'
import {
  Button, ChecklistRow, Collapsible, CollapsibleContent, CollapsibleTrigger, ConfirmDialog, ListGroup,
  Progress, Typography, XStack, YStack,
} from '@/ui'
import { cn } from '@/lib/utils'
import type { ItemFilter } from '../types'
import { intervalProgress, matchesFilter, percent } from '../utils/progress'
import { ItemBadges } from './ItemBadges'

const GROUP_ORDER: ItemGroup[] = ['scheduled', 'inspect', 'dusty', 'towing', 'idling']

interface IntervalSectionProps {
  interval: ServiceInterval
  conditionHeadings: Vehicle['conditionHeadings']
  done: ReadonlySet<string>
  filter: ItemFilter
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggle: (itemId: string, done: boolean) => void
  onOpenItem: (item: MaintenanceItem) => void
  onReset: (itemIds: string[]) => void
}

export function IntervalSection({
  interval, conditionHeadings, done, filter, open, onOpenChange, onToggle, onOpenItem, onReset,
}: IntervalSectionProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const progress = intervalProgress(interval, done)
  const complete = progress.total > 0 && progress.done === progress.total
  const visible = interval.items.filter((i) => matchesFilter(i, done, filter))
  const checkedIds = interval.items.filter((i) => done.has(i.id)).map((i) => i.id)

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="overflow-hidden rounded-xl border bg-card">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="h-auto w-full justify-between gap-3 rounded-none px-4 py-4 text-left">
          <span className="flex min-w-0 flex-col gap-0.5">
            <Typography as="span" variant="heading" className="text-lg">
              {interval.miles.toLocaleString('en-US')} miles
            </Typography>
            <Typography as="span" variant="small">or {interval.months} months</Typography>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <Typography as="span" variant="amount" color={complete ? 'success' : 'default'}>
              {progress.done} / {progress.total} done
            </Typography>
            <ChevronDown className={cn('size-5 text-muted-foreground transition-transform', open && 'rotate-180')} />
          </span>
        </Button>
      </CollapsibleTrigger>
      <div className="px-4 pb-4">
        <Progress value={percent(progress)} label={`${interval.label} progress`} />
      </div>

      <CollapsibleContent>
        <YStack gap={0} className="border-t">
          {interval.notes?.map((n, i) => (
            <Typography key={i} variant="small" className="border-b px-4 py-3">{n}</Typography>
          ))}

          {visible.length === 0 && (
            <Typography variant="muted" className="px-4 py-6 text-center">Nothing to show with this filter.</Typography>
          )}

          {GROUP_ORDER.map((group) => {
            const items = visible.filter((i) => i.group === group)
            if (items.length === 0) return null
            const heading =
              group === 'scheduled' ? 'Service' : group === 'inspect' ? 'Inspect the following' : `If ${conditionHeadings[group].charAt(0).toLowerCase()}${conditionHeadings[group].slice(1)}`
            return (
              <YStack key={group} gap={0}>
                <Typography variant="meta" className="bg-muted/50 px-4 py-2">{heading}</Typography>
                <ListGroup>
                  {items.map((item) => {
                    const isDone = done.has(item.id)
                    return (
                      <ChecklistRow
                        key={item.id}
                        title={item.name}
                        meta={<ItemBadges item={item} />}
                        checked={isDone}
                        onCheckedChange={(v) => onToggle(item.id, v)}
                        onOpen={() => onOpenItem(item)}
                        checkLabel={`${item.name}, ${interval.label}`}
                        openLabel={`Open details for ${item.name}`}
                      />
                    )
                  })}
                </ListGroup>
              </YStack>
            )
          })}

          <XStack justify="end" className="border-t px-3 py-2">
            <Button variant="ghost" size="lg" disabled={checkedIds.length === 0} onClick={() => setConfirmOpen(true)}>
              <RotateCcw /> Reset this interval
            </Button>
          </XStack>
        </YStack>
      </CollapsibleContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reset this interval?"
        description={`Uncheck all ${checkedIds.length} completed item${checkedIds.length === 1 ? '' : 's'} in ${interval.label}. This can’t be undone.`}
        confirmLabel="Reset"
        onConfirm={() => onReset(checkedIds)}
      />
    </Collapsible>
  )
}
