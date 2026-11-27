# Garage

A maintenance checklist for one vehicle: a 2024 Toyota Tacoma (2.4L turbo). Every service interval from the
Toyota Warranty & Maintenance Guide (5,000 to 120,000 miles), grouped by interval. Tap a checkbox to mark it done,
tap the row for how-to, tools, parts and videos. Progress saves on the device, or in your account if you create
one, which syncs it between devices.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (honors PORT)
npm run build      # tsc -b && vite build
npm run lint
npm test           # vitest
```

Needs a Supabase stack: copy `.env.example` to `.env.local` and fill it from `supabase status` (see below).

## Truck photo

The vehicle card uses `public/truck.png`; replace that file to change it.

## Add an interval or item

Content lives in `src/data/tacoma/`.

- `catalog.ts`: one entry per task (name, kind, steps, tools, parts, videos, notes). Written once, shared by every
  interval that lists it. Unverified specs stay empty with a `TODO` in `notes`.
- `intervals.ts`: what is due at each mileage. Add a task to an interval by listing its slug in the relevant
  builder, or add a new interval with `build({...})`.
- Item ids (`30k:engine-oil-and-filter`, `30k:dusty:tighten-nuts-bolts`) are permanent: saved progress keys off them.
- Part links: `{ label, url }`, or `{ label, store: 'amazon' | 'autozone', query }` resolved by
  `features/checklist/utils/partLinks.ts`.
- A second vehicle (e.g. Street Triple) is another folder under `src/data/<vehicle>/`.

## Supabase

No account needed: progress saves on the device. Creating one (email and password, confirmed by an emailed link)
moves that progress into Supabase and syncs it across devices. Progress lives in Postgres (RLS on every table). TanStack Query
caches it in localStorage for first paint, and checklist changes made offline are sent once the device reconnects.

Local stack (needs a Docker runtime, e.g. `brew install colima docker && colima start`):

```bash
supabase start                 # prints API URL + publishable key → .env.local
supabase db reset              # applies supabase/migrations
npm run db:types               # regenerates src/lib/database.types.ts
supabase functions serve       # vehicle-data Edge Function
npm run test:rls               # two users; proves A can't read or write B's rows
```

Confirmation emails sent locally land in Mailpit at http://localhost:54324.

Hosted: `supabase link --project-ref <ref>`, `supabase db push`, `supabase functions deploy vehicle-data`. In the
dashboard:

- Authentication > Sign In / Providers > Email: keep **Confirm email** on; minimum password length 8.
- Authentication > URL Configuration: **Site URL** = the deployed app's URL. **Redirect URLs**: the deployed URL
  with `/**` and `http://localhost:5173/**`, so confirmation and reset links can return to either.

Supabase's built-in email sender only delivers to members of your Supabase organization, a few per hour. That
covers your own account; add custom SMTP (e.g. Resend) under Authentication > Emails before anyone else signs up.
Forgot a password? Use "Forgot password?" in the sign-in dialog.

Vehicle data (VIN decode, recalls) goes through the `vehicle-data` Edge Function. See `docs/adding-a-provider.md`.

## Deploy to Vercel (later)

Import the repo, framework preset Vite, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, and deploy.
`vercel.json` already rewrites all routes to `index.html` for the SPA.
