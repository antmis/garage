import { Progress, Skeleton, Typography, XStack } from '@/ui'
import { useChecklist } from '../hooks/ChecklistContext'
import { overallProgress, percent } from '../utils/progress'

interface OverallProgressProps {
  /** Count only, no bar: for the interval page's sidebar and top bar. */
  compact?: boolean
}

export function OverallProgress({ compact = false }: OverallProgressProps) {
  const { schedule, done, loading } = useChecklist()
  if (!schedule) return null
  if (loading) return <Skeleton className={compact ? 'h-4 w-20' : 'h-4 w-full'} />
  const p = overallProgress(schedule, done)
  const count = (
    <Typography variant="caption" className="whitespace-nowrap tabular-nums">
      {p.done} / {p.total} done
    </Typography>
  )
  if (compact) return count
  return (
    <XStack align="center" gap={3}>
      <Progress value={percent(p)} label="Overall progress" className="flex-1" />
      {count}
    </XStack>
  )
}
