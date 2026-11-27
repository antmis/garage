import { Navigate, Outlet, useParams } from 'react-router-dom'
import { findVehicle } from '@/data'
import { ChecklistProvider } from '@/features/checklist'
import { useRememberVehicle } from '@/features/garage'

/** Everything under `/:vehicleId`: resolves the vehicle and scopes the checklist to it. */
export function VehicleScope() {
  const { vehicleId } = useParams()
  const vehicle = findVehicle(vehicleId)
  useRememberVehicle(vehicle?.id)
  if (!vehicle) return <Navigate to="/garage" replace />
  // Keyed so switching vehicles starts from that vehicle's saved progress instead of carrying the last one's.
  return (
    <ChecklistProvider key={vehicle.id} vehicle={vehicle}>
      <Outlet />
    </ChecklistProvider>
  )
}
