import { Navigate, useParams } from 'react-router-dom'
import { IntervalDetail, findIntervalByMiles, useChecklist } from '@/features/checklist'
import { IntervalLayout } from '@/shared/layout'

export function Interval() {
  const { miles } = useParams()
  const { vehicle } = useChecklist()
  const interval = findIntervalByMiles(vehicle, miles)
  if (!interval) return <Navigate to="/" replace />
  return (
    <IntervalLayout currentId={interval.id}>
      <IntervalDetail interval={interval} />
    </IntervalLayout>
  )
}
