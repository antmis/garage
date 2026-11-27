import type { NormalizedVehicleSpec, ProviderResult, VehicleDataProvider } from './types.ts'

// NHTSA vPIC, flat format. Field names verified against a live DecodeVinValues response (2026-11).
// Missing values ('' or 'Not Applicable') mean NHTSA has no data, not an error.
const BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues'

type VpicRow = Record<string, string | null | undefined>

function text(row: VpicRow, key: string): string | null {
  const v = row[key]?.trim()
  return v && v !== 'Not Applicable' ? v : null
}

function int(row: VpicRow, key: string): number | null {
  const v = text(row, key)
  const n = v === null ? NaN : Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

function vehicleType(raw: string | null): NormalizedVehicleSpec['vehicleType'] {
  if (!raw) return null
  const t = raw.toUpperCase()
  if (t === 'MOTORCYCLE') return 'motorcycle'
  if (t === 'TRUCK' || t === 'INCOMPLETE VEHICLE') return 'truck'
  if (t === 'PASSENGER CAR' || t.startsWith('MULTIPURPOSE PASSENGER VEHICLE')) return 'car'
  return 'other'
}

function normalize(row: VpicRow): NormalizedVehicleSpec {
  const displacement = text(row, 'DisplacementL')
  const style = text(row, 'TransmissionStyle')
  const speeds = text(row, 'TransmissionSpeeds')
  return {
    modelYear: int(row, 'ModelYear'),
    make: text(row, 'Make'),
    model: text(row, 'Model'),
    trim: text(row, 'Trim') ?? text(row, 'Series'),
    bodyClass: text(row, 'BodyClass'),
    driveType: text(row, 'DriveType'),
    engineDisplacementL: displacement ? Math.round(Number(displacement) * 10) / 10 || null : null,
    engineCylinders: int(row, 'EngineCylinders'),
    fuelType: text(row, 'FuelTypePrimary'),
    transmission: style && speeds ? `${style}, ${speeds}-speed` : style,
    vehicleType: vehicleType(text(row, 'VehicleType')),
    manufacturer: text(row, 'Manufacturer'),
    plantCountry: text(row, 'PlantCountry'),
  }
}

export const nhtsaVpic: VehicleDataProvider = {
  id: 'nhtsa_vpic',
  capabilities: ['vin_decode'],
  // VIN decodes rarely change; a long TTL keeps us well inside vPIC's quotas.
  ttlSeconds: { vin_decode: 60 * 60 * 24 * 90 },

  async decodeVin(vin, { modelYear }): Promise<ProviderResult<NormalizedVehicleSpec>> {
    const url = new URL(`${BASE}/${encodeURIComponent(vin)}`)
    url.searchParams.set('format', 'json')
    if (modelYear) url.searchParams.set('modelyear', String(modelYear))

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) {
      return { status: 'error', normalized: null, raw: await res.text(), errorCode: `http_${res.status}`, errorText: res.statusText }
    }
    const raw = await res.json()
    const row: VpicRow | undefined = raw?.Results?.[0]
    if (!row) return { status: 'error', normalized: null, raw, errorCode: 'empty', errorText: 'vPIC returned no result' }

    // ErrorCode is a comma-separated list; '0' alone is a clean decode. Anything else still carries usable data.
    const errorCode = text(row, 'ErrorCode') ?? '0'
    const clean = errorCode === '0'
    const errorText = [text(row, 'ErrorText'), text(row, 'AdditionalErrorText')].filter(Boolean).join(' ') || undefined
    return {
      status: clean ? 'ok' : 'partial',
      normalized: normalize(row),
      raw,
      errorCode: clean ? undefined : errorCode,
      errorText: clean ? undefined : errorText,
    }
  },
}
