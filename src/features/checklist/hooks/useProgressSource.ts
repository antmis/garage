import type { VehicleId } from '@/data'
import { useIdentity } from '@/features/identity'
import { useCompletions } from '@/lib/api/completions'
import { useDeviceProgress } from '@/lib/api/deviceProgress'
import { useGarage } from '@/lib/api/vehicles'

/**
 * Where a vehicle's progress lives: this device when signed out, the account when signed in. One place decides, so
 * the checklist and the garage cards can't disagree.
 */
export function useProgressSource(vehicleId: VehicleId) {
  const { userId, status } = useIdentity()
  const guest = status === 'signedOut'
  const garage = useGarage(userId)
  const rowId = garage.data?.find((r) => r.catalog_key === vehicleId)?.id ?? null
  const account = useCompletions(userId, rowId)
  const device = useDeviceProgress(vehicleId, guest)

  return {
    guest,
    userId,
    rowId,
    data: guest ? device.data : account.data,
    /** Failed to load (e.g. offline with nothing cached); callers stop showing skeletons. */
    failed: !guest && (garage.isError || account.isError),
    authLoading: status === 'loading',
  }
}
