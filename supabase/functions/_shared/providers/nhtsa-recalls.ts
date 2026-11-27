import type { NormalizedRecall, NormalizedRecalls, ProviderResult, VehicleDataProvider } from './types.ts'

// NHTSA recalls look up by make/model/year, not VIN. Field names verified against a live response (2026-11).
const BASE = 'https://api.nhtsa.gov/recalls/recallsByVehicle'

type RecallRow = Record<string, unknown>

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)

/** NHTSA sends ReportReceivedDate as DD/MM/YYYY. */
function isoDate(v: unknown): string | null {
  const m = typeof v === 'string' ? /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v) : null
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

function normalize(r: RecallRow): NormalizedRecall {
  return {
    campaignNumber: str(r.NHTSACampaignNumber) ?? '',
    component: str(r.Component),
    summary: str(r.Summary),
    consequence: str(r.Consequence),
    remedy: str(r.Remedy),
    reportReceivedOn: isoDate(r.ReportReceivedDate),
    parkIt: r.parkIt === true,
    parkOutside: r.parkOutSide === true,
    overTheAirUpdate: r.overTheAirUpdate === true,
  }
}

export const nhtsaRecalls: VehicleDataProvider = {
  id: 'nhtsa_recalls',
  capabilities: ['recalls'],
  ttlSeconds: { recalls: 60 * 60 * 24 },

  async getRecalls(make, model, modelYear): Promise<ProviderResult<NormalizedRecalls>> {
    const url = new URL(BASE)
    url.searchParams.set('make', make)
    url.searchParams.set('model', model)
    url.searchParams.set('modelYear', String(modelYear))

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    // NHTSA answers 400 for an unknown make/model; that is "no recalls found", not an outage.
    if (res.status === 400) {
      return { status: 'ok', normalized: { recalls: [] }, raw: await res.text() }
    }
    if (!res.ok) {
      return { status: 'error', normalized: null, raw: await res.text(), errorCode: `http_${res.status}`, errorText: res.statusText }
    }
    const raw = await res.json()
    const rows: RecallRow[] = Array.isArray(raw?.results) ? raw.results : []
    return { status: 'ok', normalized: { recalls: rows.map(normalize) }, raw }
  },
}
