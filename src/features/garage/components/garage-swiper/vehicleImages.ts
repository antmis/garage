import type { Vehicle, VehicleId } from '@/data'

/**
 * Tight transparent cutouts for the swiper: the bottom edge must be the tyres, since it sits on the floor line.
 * `vehicle.image` (padded, used by the cards and switcher) is the fallback for a vehicle missing here.
 */
const cutouts: Partial<Record<VehicleId, string>> = {
  'tacoma-2024': '/vehicles/tacoma.png',
  'street-triple-675r': '/vehicles/street-triple.png',
}

export function swiperImage(vehicle: Vehicle): string | undefined {
  return cutouts[vehicle.id] ?? (vehicle.image || undefined)
}
