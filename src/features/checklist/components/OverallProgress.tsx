import { Progress, Skeleton, Typography, XStack } from '@/ui'
import { useChecklist } from '../hooks/ChecklistContext'
import { overallProgress, percent } from '../utils/progress'

export function OverallProgress() {
  const { vehicle, done, loading } = useChecklist()
  if (loading) return <Skeleton className="h-4 w-28" />
  const p = overallProgress(vehicle, done)
  return (
    <XStack align="center" gap={2} className="w-auto">
      <Progress value={percent(p)} label="Overall progress" className="w-16 sm:w-28" />
      <Typography variant="caption" className="whitespace-nowrap tabular-nums">
        {p.done} / {p.total}
      </Typography>
    </XStack>
  )
}
