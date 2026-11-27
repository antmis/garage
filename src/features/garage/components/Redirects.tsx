import { Navigate, useParams } from 'react-router-dom'
import { DEFAULT_VEHICLE_ID } from '@/data'
import { vehiclePath } from '@/features/checklist'
import { readLastVehicleId } from '../utils/lastVehicle'

/** `/`: reopens the last vehicle viewed, so the home-screen app and old root links land on a checklist. */
export function LastVehicleRedirect() {
  return <Navigate to={vehiclePath(readLastVehicleId())} replace />
}

/** `/interval/:miles` predates multiple vehicles; every such link and bookmark was the Tacoma's. */
export function LegacyIntervalRedirect() {
  const { miles } = useParams()
  return <Navigate to={`${vehiclePath(DEFAULT_VEHICLE_ID)}/interval/${miles ?? ''}`} replace />
}
