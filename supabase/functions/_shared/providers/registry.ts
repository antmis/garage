import { nhtsaRecalls } from './nhtsa-recalls.ts'
import { nhtsaVpic } from './nhtsa-vpic.ts'
import type { Kind, VehicleDataProvider } from './types.ts'

/** Adding a provider: one import above, one entry here. Earlier entries win as the default for a kind. */
const providers: readonly VehicleDataProvider[] = [nhtsaVpic, nhtsaRecalls]

/** The named provider if it supports `kind`, else the first registered one that does. */
export function resolveProvider(kind: Kind, id?: string): VehicleDataProvider | null {
  if (id) return providers.find((p) => p.id === id && p.capabilities.includes(kind)) ?? null
  return providers.find((p) => p.capabilities.includes(kind)) ?? null
}
