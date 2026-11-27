import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Progress, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography, YStack,
} from '@/ui'
import { useChecklist } from '../hooks/ChecklistContext'
import { useIntervalSummaries } from '../hooks/useIntervalSummaries'
import { intervalShortTitle } from '../utils/format'
import { matchesFilter, percent } from '../utils/progress'
import { intervalPath } from '../utils/routes'

/** Home view: one dense row per interval, each row a link to its interval page. */
export function IntervalTable() {
  const { vehicle, done, filter, loading } = useChecklist()
  const summaries = useIntervalSummaries()

  if (loading) {
    return (
      <YStack gap={2}>
        {summaries.slice(0, 6).map(({ interval }) => <Skeleton key={interval.id} className="h-12 w-full" />)}
      </YStack>
    )
  }

  // A filter that empties an interval hides it; with “All” every interval always shows.
  const rows = summaries.filter(
    ({ interval }) => filter === 'all' || interval.items.some((i) => matchesFilter(i, done, filter)),
  )

  return (
    // overflow-clip, not hidden/auto: those make a scroll container and the sticky header would stick to it, not the page.
    <div className="overflow-clip rounded-xl border bg-card">
      <Table containerClassName="overflow-x-clip">
        <TableHeader className="[&_th]:sticky [&_th]:top-[var(--app-header-h,0px)] [&_th]:z-20 [&_th]:bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4"><Typography as="span" variant="meta">Miles</Typography></TableHead>
            <TableHead><Typography as="span" variant="meta">Months</Typography></TableHead>
            <TableHead><Typography as="span" variant="meta">Done</Typography></TableHead>
            <TableHead className="w-full"><Typography as="span" variant="meta">Progress</Typography></TableHead>
            <TableHead className="pr-4"><span className="sr-only">Open</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ interval, progress, complete }) => (
            // `relative` + the link's `after:` overlay makes the whole row the link target; z-10 lifts it over the positioned Progress.
            <TableRow key={interval.id} className="relative">
              <TableCell className="py-3 pl-4">
                <Link
                  to={intervalPath(vehicle.id, interval)}
                  aria-label={`${interval.label}, ${progress.done} of ${progress.total} done`}
                  className="rounded-sm outline-none after:absolute after:inset-0 after:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <Typography as="span" variant="amount" className="text-base">
                    {intervalShortTitle(interval)}
                  </Typography>
                </Link>
              </TableCell>
              <TableCell><Typography as="span" variant="muted">{interval.months !== undefined ? `${interval.months} mo` : '—'}</Typography></TableCell>
              <TableCell>
                <Typography as="span" variant="body" numeric color={complete ? 'success' : 'muted'}>
                  {progress.done}/{progress.total}
                </Typography>
              </TableCell>
              <TableCell>
                <Progress value={percent(progress)} label={`${interval.label} progress`} className="h-1 min-w-12" />
              </TableCell>
              <TableCell className="pr-4">
                <ChevronRight className="size-5 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {rows.length === 0 && (
        <Typography variant="muted" className="px-4 py-6 text-center">Nothing to show with this filter.</Typography>
      )}
    </div>
  )
}
