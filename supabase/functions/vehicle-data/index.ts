// vehicle-data: the only place the app talks to third-party vehicle APIs.
// Verifies the caller, checks they own the vehicle, routes {kind, provider?} to a provider, caches VIN decodes,
// and records every lookup as a snapshot (normalized + raw). Third-party secrets never leave this function.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { checkVin } from '../_shared/vin.ts'
import { resolveProvider } from '../_shared/providers/registry.ts'
import type {
  Kind,
  ProviderResult,
  VehicleDataErrorCode,
  VehicleDataProvider,
  VehicleDataRequest,
  VehicleDataSuccess,
} from '../_shared/providers/types.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const STATUS_FOR: Record<VehicleDataErrorCode, number> = {
  unauthorized: 401,
  bad_request: 400,
  invalid_vin: 400,
  vehicle_not_found: 404,
  unsupported: 400,
  provider_unavailable: 502,
  internal: 500,
}

class HttpError extends Error {
  code: VehicleDataErrorCode
  constructor(code: VehicleDataErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

/** New-style keys arrive as a JSON map (SUPABASE_*_KEYS); the single-key and legacy names are fallbacks. */
function envKey(mapName: string, ...fallbacks: string[]): string {
  const map = Deno.env.get(mapName)
  if (map) {
    try {
      const parsed = JSON.parse(map) as Record<string, string>
      if (parsed.default) return parsed.default
    } catch {
      // fall through to the single-key names
    }
  }
  for (const name of fallbacks) {
    const v = Deno.env.get(name)
    if (v) return v
  }
  throw new Error(`Missing ${mapName}`)
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const PUBLISHABLE_KEY = envKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY')
const SECRET_KEY = envKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY')

// Admin client: bypasses RLS. Used only for the server-only cache and for writing snapshots with a user_id taken
// from the verified JWT, never from the request body.
const admin = createClient(SUPABASE_URL, SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })

// ---- input validation ----

const MAX_TEXT = 80

function shortText(v: unknown, field: string): string {
  if (typeof v !== 'string' || !v.trim() || v.trim().length > MAX_TEXT) {
    throw new HttpError('bad_request', `${field} must be 1–${MAX_TEXT} characters`)
  }
  return v.trim()
}

function year(v: unknown, field: string, required: boolean): number | undefined {
  if (v === undefined || v === null) {
    if (required) throw new HttpError('bad_request', `${field} is required`)
    return undefined
  }
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1950 || v > 2100) {
    throw new HttpError('bad_request', `${field} must be a year between 1950 and 2100`)
  }
  return v
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function parseRequest(body: unknown): VehicleDataRequest {
  if (!body || typeof body !== 'object') throw new HttpError('bad_request', 'Expected a JSON object')
  const b = body as Record<string, unknown>
  if (typeof b.vehicleId !== 'string' || !UUID.test(b.vehicleId)) throw new HttpError('bad_request', 'vehicleId must be a uuid')
  const provider = b.provider === undefined ? undefined : shortText(b.provider, 'provider')

  switch (b.kind) {
    case 'vin_decode': {
      if (typeof b.vin !== 'string' || b.vin.length > 40) throw new HttpError('invalid_vin', 'VIN is required')
      const check = checkVin(b.vin)
      if (!check.ok) throw new HttpError('invalid_vin', 'A VIN is 17 letters and digits, without I, O or Q')
      return { kind: 'vin_decode', vehicleId: b.vehicleId, vin: check.vin, modelYear: year(b.modelYear, 'modelYear', false), provider }
    }
    case 'recalls':
      return {
        kind: 'recalls',
        vehicleId: b.vehicleId,
        make: shortText(b.make, 'make'),
        model: shortText(b.model, 'model'),
        modelYear: year(b.modelYear, 'modelYear', true)!,
        provider,
      }
    default:
      throw new HttpError('unsupported', 'Unknown kind')
  }
}

// ---- kind handlers: how to call a provider for each kind, and what its cache key is ----

interface Lookup {
  requestKey: string
  result: ProviderResult<unknown>
  cached: boolean
}

async function decodeVin(p: VehicleDataProvider, req: Extract<VehicleDataRequest, { kind: 'vin_decode' }>): Promise<Lookup> {
  const requestKey = req.modelYear ? `${req.vin}|${req.modelYear}` : req.vin
  const { data: hit } = await admin
    .from('vin_decode_cache')
    .select('model_year, status, error_code, error_text, normalized, raw, expires_at')
    .eq('provider', p.id)
    .eq('vin', req.vin)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()
  if (hit && (hit.model_year ?? undefined) === req.modelYear) {
    return {
      requestKey,
      cached: true,
      result: {
        status: hit.status, normalized: hit.normalized, raw: hit.raw,
        errorCode: hit.error_code ?? undefined, errorText: hit.error_text ?? undefined,
      },
    }
  }

  const result = await p.decodeVin!(req.vin, { modelYear: req.modelYear })
  if (result.status !== 'error') {
    const ttl = p.ttlSeconds?.vin_decode ?? 60 * 60 * 24 * 30
    await admin.from('vin_decode_cache').upsert({
      provider: p.id,
      vin: req.vin,
      model_year: req.modelYear ?? null,
      status: result.status,
      error_code: result.errorCode ?? null,
      error_text: result.errorText ?? null,
      normalized: result.normalized,
      raw: result.raw,
      fetched_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
    })
  }
  return { requestKey, cached: false, result }
}

async function recalls(p: VehicleDataProvider, req: Extract<VehicleDataRequest, { kind: 'recalls' }>): Promise<Lookup> {
  const requestKey = `${req.make}|${req.model}|${req.modelYear}`.toLowerCase()
  return { requestKey, cached: false, result: await p.getRecalls!(req.make, req.model, req.modelYear) }
}

async function lookup(p: VehicleDataProvider, req: VehicleDataRequest): Promise<Lookup> {
  switch (req.kind) {
    case 'vin_decode': return decodeVin(p, req)
    case 'recalls': return recalls(p, req)
  }
}

// ---- request handling ----

async function authenticate(req: Request): Promise<{ userId: string; client: SupabaseClient }> {
  const authorization = req.headers.get('Authorization') ?? ''
  const token = authorization.replace(/^Bearer\s+/i, '')
  if (!token) throw new HttpError('unauthorized', 'Sign in first')
  const client = createClient(SUPABASE_URL, PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getClaims(token)
  const sub = data?.claims?.sub
  if (error || typeof sub !== 'string' || data?.claims?.role !== 'authenticated') {
    throw new HttpError('unauthorized', 'Session expired')
  }
  return { userId: sub, client }
}

async function handle(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') throw new HttpError('bad_request', 'POST only')

  const { userId, client } = await authenticate(req)
  const body = parseRequest(await req.json().catch(() => null))

  // Ownership via the caller's own RLS-scoped client: no row = not theirs (or doesn't exist).
  const { data: vehicle } = await client.from('vehicles').select('id').eq('id', body.vehicleId).maybeSingle()
  if (!vehicle) throw new HttpError('vehicle_not_found', 'Vehicle not found')

  const provider = resolveProvider(body.kind, body.provider)
  if (!provider) throw new HttpError('unsupported', `No provider for ${body.kind}${body.provider ? ` named ${body.provider}` : ''}`)

  let found: Lookup
  try {
    found = await lookup(provider, body)
  } catch (e) {
    // Network failure or timeout: still recorded, so the history shows the attempt.
    found = {
      requestKey: body.kind,
      cached: false,
      result: { status: 'error', normalized: null, raw: null, errorCode: 'fetch_failed', errorText: String(e) },
    }
  }

  const ttl = provider.ttlSeconds?.[body.kind as Kind]
  const fetchedAt = new Date()
  const { data: snapshot, error } = await admin
    .from('vehicle_data_snapshots')
    .insert({
      user_id: userId,
      vehicle_id: body.vehicleId,
      provider: provider.id,
      kind: body.kind,
      request_key: found.requestKey,
      status: found.result.status,
      error_code: found.result.errorCode ?? null,
      error_text: found.result.errorText ?? null,
      normalized: found.result.normalized,
      raw: found.result.raw,
      fetched_at: fetchedAt.toISOString(),
      expires_at: ttl ? new Date(fetchedAt.getTime() + ttl * 1000).toISOString() : null,
    })
    .select('id')
    .single()
  if (error) throw new Error(`snapshot insert failed: ${error.message}`)

  if (found.result.status === 'error' && !found.cached) {
    throw new HttpError('provider_unavailable', found.result.errorText ?? 'The data provider did not answer')
  }

  const out: VehicleDataSuccess = {
    snapshotId: snapshot.id,
    provider: provider.id,
    kind: body.kind,
    status: found.result.status,
    normalized: found.result.normalized,
    errorCode: found.result.errorCode ?? null,
    errorText: found.result.errorText ?? null,
    cached: found.cached,
    fetchedAt: fetchedAt.toISOString(),
  }
  return json(out)
}

Deno.serve(async (req) => {
  try {
    return await handle(req)
  } catch (e) {
    if (e instanceof HttpError) return json({ error: { code: e.code, message: e.message } }, STATUS_FOR[e.code])
    console.error(e)
    return json({ error: { code: 'internal', message: 'Something went wrong' } }, 500)
  }
})
