import { Progress, Skeleton, Typography, XStack } from '@/ui'
import { useChecklist } from '../hooks/ChecklistContext'
import { overallProgress, percent } from '../utils/progress'

export function OverallProgress() {
  const { vehicle, done, loading } = useChecklist()
  if (loading) return <Skeleton className="h-4 w-full" />
  const p = overallProgress(vehicle, done)
  return (
    <XStack align="center" gap={3}>
      <Progress value={percent(p)} label="Overall progress" className="flex-1" />
      <Typography variant="caption" className="whitespace-nowrap tabular-nums">
        {p.done} / {p.total} done
      </Typography>
    </XStack>
  )
}
