# Garage: working notes

A mobile-first maintenance checklist per vehicle in a small garage (2024 Toyota Tacoma, Triumph Street Triple 675 R).
Plain Vite + React 19 SPA. Progress saves on the device without an account, or in Supabase Postgres with one.
Architecture follows Money Date; code-style rules follow TAT.

## Commands

```bash
npm run dev      # vite dev server (honors PORT)
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm test         # vitest
npm run typecheck:functions  # Edge Function, without Deno
npm run test:rls # needs `supabase start`
```

## Architecture

```
src/
  ui/primitives/   raw shadcn/Radix wrappers. Nothing app-specific
  ui/*.tsx         composed, app-facing components; ui/index.ts is the barrel
  features/        self-contained (components/ hooks/ types/ utils/ + index.ts public API)
  data/<vehicle>/  typed static content: the maintenance manual; data/index.ts is the vehicle registry
  pages/           thin routes that compose features
  shared/layout/   AppLayout, header, theme toggle
  lib/             utils, supabase client, storage helpers; lib/api/ holds the TanStack Query hooks
```

- Features import UI only from `@/ui`, never from `@/ui/primitives`. Cross-feature imports go through the other
  feature's `index.ts`.
- Pages stay thin: compose features, own no logic.
- Content lives in code; progress lives in storage and is only a set of item ids.

## Components

Use `src/ui/*` rather than raw elements. `Button` in particular owns the focus ring, disabled handling, height,
radius and icon sizing. Need a link that looks like a button? `<Button asChild><a …/></Button>`.

Don't hand-copy classes out of a variant into a raw element. If a variant is missing, add the variant.

## Data rules

- Item ids are permanent: saved progress keys off them (`<interval>:<slug>`, or `<interval>:<group>:<slug>` for
  special-condition items). Never rename a slug or interval id once shipped.
- Vehicle ids are permanent too: the localStorage key, Supabase `vehicle_id` and URLs (`/:vehicleId/interval/:miles`)
  key off them.
- How-to content is written once per task in `data/<vehicle>/catalog.ts`; `intervals.ts` only decides what is due when.
- A vehicle without `schedule` shows “coming soon”; adding one is data-only (write the folder, list it in
  `data/index.ts`).
- Don't invent specs. Torque values, capacities and part numbers need a confirmed source (Owner’s Manual or an
  authoritative one); otherwise leave the field empty and put a TODO in `notes`.
- Videos must be real and verified; never guess a YouTube id.

## Persistence

- Supabase env vars are required (`.env.local`, see `.env.example`); local development runs against `supabase start`.
- Accounts are optional. Signed out, progress lives in localStorage (`lib/api/deviceProgress.ts`). After sign-in,
  `DeviceProgressPrompt` moves it into the account (`lib/api/deviceImport.ts`): automatically into an empty account,
  otherwise asking Add/Discard when the device has ticks the account lacks. Adding is a union, never a replace. `useProgressSource` is the
  one place that picks device vs account.
- Auth: email and password with email confirmation (the default "Confirm signup" link; implicit flow, so the link
  works on any device). Sign-in is a dialog from the header's account menu (`features/identity`). Forgot password
  emails a reset link; arriving from it fires `PASSWORD_RECOVERY`, which opens `NewPasswordDialog`. Emailed links
  return to `window.location.origin`, so hosted Auth > Redirect URLs must list every origin (live site, localhost).
- Account data access lives in `lib/api/` as TanStack Query hooks. The query cache and offline checklist changes
  persist to localStorage (`garage:cache`) for first paint; the database is the source of truth. Checklist writes are
  registered with `setMutationDefaults` so a change made offline survives a reload and resumes.
- `useGarage` seeds one `vehicles` row per built-in vehicle (`catalog_key` = vehicle id) when missing.
- Completions are stored as `(interval_key, task_key)`: the item id split at its first `:` (`lib/api/itemKeys.ts`).
- Schema changes are migrations only. Every table: RLS in the same migration, `to authenticated` policies per
  operation using `(select auth.uid())`, a `user_id` column, and a composite FK to `vehicles (id, user_id)` on child
  tables.
- Third-party vehicle data only goes through the `vehicle-data` Edge Function; see `docs/adding-a-provider.md`.

## Comments

Comments explain constraints and non-obvious mechanisms: what breaks if you change this, and why the obvious
approach doesn't work. One or two lines is the norm. Do not narrate history; git records that.

Document component props with per-prop JSDoc on a named `…Props` interface, not a prose block above the signature.
Skip the tag where the name and type already say it.
