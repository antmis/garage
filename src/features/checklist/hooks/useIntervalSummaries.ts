import { useMemo } from 'react'
import type { ServiceInterval } from '@/data'
import type { Progress } from '../types'
import { intervalProgress } from '../utils/progress'
import { useChecklist } from './ChecklistContext'

export interface IntervalSummary {
  interval: ServiceInterval
  progress: Progress
  complete: boolean
}

/** One entry per interval with its progress: the data behind the home table, sidebar and strip. */
export function useIntervalSummaries(): IntervalSummary[] {
  const { vehicle, done } = useChecklist()
  return useMemo(
    () =>
      vehicle.intervals.map((interval) => {
        const progress = intervalProgress(interval, done)
        return { interval, progress, complete: progress.total > 0 && progress.done === progress.total }
      }),
    [vehicle, done],
  )
}
