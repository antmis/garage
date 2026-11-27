import { Navigate, useParams } from 'react-router-dom'
import { IntervalDetail, findInterval, useChecklist, vehiclePath } from '@/features/checklist'
import { IntervalLayout } from '@/shared/layout'

export function Interval() {
  const { interval: key } = useParams()
  const { vehicle, schedule } = useChecklist()
  const interval = findInterval(schedule, key)
  if (!schedule || !interval) return <Navigate to={vehiclePath(vehicle.id)} replace />
  return (
    <IntervalLayout currentId={interval.id}>
      <IntervalDetail schedule={schedule} interval={interval} />
    </IntervalLayout>
  )
}
