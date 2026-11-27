// The canonical shapes every provider maps into. Nothing outside providers/ knows a provider's own field names.
// Pure types: the browser imports this file too (src/lib/vehicle-data.ts).

/** Free text so a new kind needs no schema change. The ones the app understands today: */
export type Kind = 'vin_decode' | 'recalls' | (string & {})

export type SnapshotStatus = 'ok' | 'partial' | 'error'

export interface ProviderResult<T> {
  /** 'partial' keeps a usable result with the provider's warning in errorCode/errorText. */
  status: SnapshotStatus
  normalized: T | null
  /** The provider's untouched response, stored so we can re-map later without re-calling. */
  raw: unknown
  errorCode?: string
  errorText?: string
}

/**
 * A decoded vehicle in the `vehicles` table's vocabulary (VCdb/vPIC concepts). Null means the provider has no
 * data, not that the feature is absent.
 */
export interface NormalizedVehicleSpec {
  modelYear: number | null
  make: string | null
  model: string | null
  trim: string | null
  bodyClass: string | null
  driveType: string | null
  engineDisplacementL: number | null
  engineCylinders: number | null
  fuelType: string | null
  transmission: string | null
  vehicleType: 'car' | 'truck' | 'motorcycle' | 'other' | null
  manufacturer: string | null
  plantCountry: string | null
}

export interface NormalizedRecall {
  campaignNumber: string
  component: string | null
  summary: string | null
  consequence: string | null
  remedy: string | null
  /** ISO date (YYYY-MM-DD). */
  reportReceivedOn: string | null
  parkIt: boolean
  parkOutside: boolean
  overTheAirUpdate: boolean
}

export interface NormalizedRecalls {
  recalls: NormalizedRecall[]
}

export interface DecodeVinOptions {
  modelYear?: number
}

export interface VehicleDataProvider {
  /** Stored as `provider` on snapshots and cache rows; permanent once shipped. */
  id: string
  capabilities: readonly Kind[]
  /** How long a result stays fresh, per kind. Omitted = no expiry. */
  ttlSeconds?: Partial<Record<Kind, number>>
  decodeVin?(vin: string, opts: DecodeVinOptions): Promise<ProviderResult<NormalizedVehicleSpec>>
  getRecalls?(make: string, model: string, modelYear: number): Promise<ProviderResult<NormalizedRecalls>>
}

// ---- Wire format between the browser and the vehicle-data function ----

export type VehicleDataRequest =
  | { kind: 'vin_decode'; vehicleId: string; vin: string; modelYear?: number; provider?: string }
  | { kind: 'recalls'; vehicleId: string; make: string; model: string; modelYear: number; provider?: string }

export type VehicleDataErrorCode =
  | 'unauthorized'
  | 'bad_request'
  | 'invalid_vin'
  | 'vehicle_not_found'
  | 'unsupported'
  | 'provider_unavailable'
  | 'internal'

export interface VehicleDataSuccess<T = unknown> {
  snapshotId: string
  provider: string
  kind: Kind
  status: SnapshotStatus
  normalized: T | null
  errorCode: string | null
  errorText: string | null
  /** True when served from the server-side cache rather than a fresh provider call. */
  cached: boolean
  fetchedAt: string
}

export interface VehicleDataFailure {
  error: { code: VehicleDataErrorCode; message: string }
}
