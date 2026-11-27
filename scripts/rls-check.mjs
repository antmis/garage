// Proves tenant isolation against a running local stack: two fresh email/password users, A's rows invisible and
// unwritable to B, server-only tables closed to both, nothing open to the bare publishable key.
// Usage: npm run test:rls   (reads API_URL and PUBLISHABLE_KEY from `supabase status -o env`)
import { execSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  execSync('supabase status -o env', { encoding: 'utf8' })
    .split('\n')
    .map((l) => /^([A-Z_]+)="?(.*?)"?$/.exec(l))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
)
const url = env.API_URL
const key = env.PUBLISHABLE_KEY ?? env.ANON_KEY
if (!url || !key) throw new Error('Run `supabase start` first')

const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
let failures = 0
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  ${JSON.stringify(detail)}`}`)
  if (!ok) failures++
}

// Email confirmation is on, so users are created pre-confirmed with the local stack's secret key (admin API),
// then sign in like the app does. The secret key only ever comes from `supabase status` on this machine.
const admin = createClient(url, env.SECRET_KEY ?? env.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })

async function newUser(name) {
  const email = `rls-${name}-${Date.now()}@example.test`
  const password = 'rls-check-password'
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (created.error) throw created.error
  const c = client()
  const { data, error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw error
  return { c, id: data.user.id }
}

const A = await newUser('a')
const B = await newUser('b')
check('two distinct users', A.id !== B.id)

// A creates a vehicle, a completion and an external id.
const { data: va, error: e1 } = await A.c.from('vehicles').insert({ catalog_key: 'tacoma-2024', make: 'Toyota' }).select().single()
check('A inserts own vehicle', !e1 && va?.user_id === A.id, e1)
const { error: e2 } = await A.c.from('maintenance_completions').insert({ vehicle_id: va.id, interval_key: '5k', task_key: 'rotate-tires' })
check('A inserts own completion', !e2, e2)
const { error: e3 } = await A.c.from('vehicle_external_ids').insert({ vehicle_id: va.id, provider: 'test', id_type: 'x', value: '1' })
check('A inserts own external id', !e3, e3)

// B sees none of it.
for (const table of ['vehicles', 'maintenance_completions', 'vehicle_external_ids', 'vehicle_data_snapshots']) {
  const { data, error } = await B.c.from(table).select('*')
  check(`B reads no rows from ${table}`, !error && data.length === 0, error ?? data)
}
const { data: byId } = await B.c.from('vehicles').select('*').eq('id', va.id)
check('B cannot read A’s vehicle by id', byId?.length === 0, byId)

// B cannot change it.
const { data: upd } = await B.c.from('vehicles').update({ make: 'Hacked' }).eq('id', va.id).select()
check('B updates 0 of A’s vehicles', upd?.length === 0, upd)
const { data: del } = await B.c.from('maintenance_completions').delete().eq('vehicle_id', va.id).select()
check('B deletes 0 of A’s completions', del?.length === 0, del)

// B cannot attach rows to A's vehicle, whether claiming A's user_id or its own.
const { error: e4 } = await B.c.from('maintenance_completions').insert({ user_id: A.id, vehicle_id: va.id, interval_key: '5k', task_key: 'x' })
check('B cannot insert as A', !!e4, e4)
const { error: e5 } = await B.c.from('maintenance_completions').insert({ vehicle_id: va.id, interval_key: '5k', task_key: 'y' })
check('B cannot attach a completion to A’s vehicle (composite FK)', !!e5, e5)
const { error: e6 } = await B.c.from('vehicles').update({ user_id: B.id }).eq('id', va.id)
const { data: stillA } = await A.c.from('vehicles').select('user_id').eq('id', va.id).single()
check('B cannot take over A’s vehicle', stillA?.user_id === A.id, e6)

// A cannot move its own row to B either (WITH CHECK).
const { error: e7 } = await A.c.from('vehicles').update({ user_id: B.id }).eq('id', va.id)
check('A cannot reassign its vehicle to B', !!e7, e7)

// Server-only and function-only writes.
const { error: e8 } = await A.c.from('vin_decode_cache').select('*')
check('vin_decode_cache closed to users', !!e8, e8)
const { error: e9 } = await A.c.from('vehicle_data_snapshots').insert({ vehicle_id: va.id, provider: 'x', kind: 'x', request_key: 'x', status: 'ok' })
check('users cannot insert snapshots directly', !!e9, e9)

// The bare publishable key (no session) gets nothing.
for (const table of ['vehicles', 'maintenance_completions', 'vehicle_data_snapshots']) {
  const { data, error } = await client().from(table).select('*')
  check(`signed-out client denied on ${table}`, !!error || data.length === 0, error ?? data)
}

console.log(failures === 0 ? '\nAll RLS checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
