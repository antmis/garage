# Garage

A maintenance checklist for one vehicle: a 2024 Toyota Tacoma (2.4L turbo). Every service interval from the
Toyota Warranty & Maintenance Guide (5,000 to 120,000 miles), grouped by interval. Tap a checkbox to mark it done,
tap the row for how-to, tools, parts and videos. Progress is stored in the browser and can optionally sync to
Supabase by typing an email.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (honors PORT)
npm run build      # tsc -b && vite build
npm run lint
```

No `.env` is needed; without one the app runs entirely on localStorage.

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

## Supabase sync (optional)

1. Create a Supabase project, then:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

The table is protected by intentionally open, temporary RLS policies and identified by an unverified email. Replace
with Supabase Auth later (see the comments in the migration and `supabaseRepository.ts`).

## Deploy to Vercel (later)

Import the repo, framework preset Vite, add the two `VITE_SUPABASE_*` env vars, and deploy. `vercel.json` already
rewrites all routes to `index.html` for the SPA.
