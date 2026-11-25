import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ListItem, Progress, Typography, XStack, YStack } from '@/ui'
import { useIntervalSummaries } from '../hooks/useIntervalSummaries'
import { percent } from '../utils/progress'
import { intervalPath } from '../utils/routes'

interface IntervalNavProps {
  /** Id of the interval being shown; highlighted and scrolled into view. */
  currentId: string
}

/** Interval-to-interval menu: the body of the interval sidebar on desktop and in the mobile sheet. */
export function IntervalNav({ currentId }: IntervalNavProps) {
  const summaries = useIntervalSummaries()
  const currentRef = useRef<HTMLAnchorElement>(null)

  // Runs on mount too, so the current row is in view when the mobile sheet opens.
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'nearest' })
  }, [currentId])

  return (
    <nav aria-label="Intervals" className="flex flex-col">
      {summaries.map(({ interval, progress, complete }) => {
        const current = interval.id === currentId
        return (
          // `role={undefined}` drops ListItem's listitem role so the link keeps its own.
          <ListItem key={interval.id} asChild pressable selected={current} role={undefined} className="px-4">
            <Link ref={current ? currentRef : undefined} to={intervalPath(interval)} aria-current={current ? 'page' : undefined}>
              <YStack gap={2}>
                <XStack align="start" justify="between" gap={2}>
                  <YStack gap={0.5} className="w-auto">
                    <Typography as="span" variant="amount" className="text-base">
                      {interval.miles.toLocaleString('en-US')} mi
                    </Typography>
                    <Typography as="span" variant="small">or {interval.months} months</Typography>
                  </YStack>
                  <Typography as="span" variant="caption" numeric color={complete ? 'success' : 'muted'}>
                    {progress.done}/{progress.total}
                  </Typography>
                </XStack>
                <Progress value={percent(progress)} label={`${interval.label} progress`} className="h-1" />
              </YStack>
            </Link>
          </ListItem>
        )
      })}
    </nav>
  )
}
