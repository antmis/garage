# Adding a vehicle data provider

Every third-party vehicle API sits behind the `vehicle-data` Edge Function. The function checks the caller,
caches results, and stores each lookup as a snapshot in `vehicle_data_snapshots`. The `normalized` column holds
our canonical shape and `raw` holds the provider's response untouched. Providers map their fields into the
canonical types in `supabase/functions/_shared/providers/types.ts`. Nothing else knows a provider's field names.

## The three steps

1. **Implement the interface.** Create `supabase/functions/_shared/providers/<name>.ts` that exports a
   `VehicleDataProvider`:

   ```ts
   export const acmeSpecs: VehicleDataProvider = {
     id: 'acme_specs',                 // stored on every snapshot; permanent once shipped
     capabilities: ['vin_decode'],
     ttlSeconds: { vin_decode: 60 * 60 * 24 * 30 },
     async decodeVin(vin, { modelYear }) {
       const key = Deno.env.get('ACME_API_KEY')!
       const res = await fetch(`https://api.acme.example/vin/${vin}`, { headers: { 'x-api-key': key } })
       const raw = await res.json()
       return { status: 'ok', normalized: { /* map into NormalizedVehicleSpec */ }, raw }
     },
   }
   ```

   Return `status: 'partial'` with `errorCode` and `errorText` when the result is usable but flagged. Return
   `'error'` only when there is nothing usable. Never throw away `raw`.

2. **Register it.** In `supabase/functions/_shared/providers/registry.ts`, add one import and one entry in
   `providers`. Earlier entries become the default for a kind. To use your provider without making it the
   default, the client passes `provider: 'acme_specs'`.

3. **Set its secret.**

   ```bash
   supabase secrets set ACME_API_KEY=...
   supabase functions deploy vehicle-data
   ```

   Secrets are read with `Deno.env.get` inside the provider. They never go in a `VITE_*` variable or in git.

You don't need a migration. `provider` and `kind` are free text, and results land in jsonb. You don't need UI
changes either: the VIN form and the recalls lookup ask for a kind and show the normalized shape, whichever
provider answered.

## A new kind of data (valuation, specs, ...)

Adding a kind still needs no schema change: snapshots already store any `kind` with its `normalized` and `raw`.
In code it takes three changes:

- a `Normalized…` type and an optional method on `VehicleDataProvider` (`types.ts`)
- a request variant, input validation and one `case` in `lookup()` (`vehicle-data/index.ts`)
- somewhere in the UI to show the result, which is a product decision rather than plumbing

## Rules

- Validate inputs in the function, not just the browser.
- Keep provider calls under about 10 seconds (`AbortSignal.timeout`) so the function answers before its own
  limit.
- Long-lived lookups (VIN decodes) go through the server-only `vin_decode_cache`. Mind each provider's quotas.
- Decoded values are suggestions. The user applies them to `vehicles`; nothing overwrites their data silently.
