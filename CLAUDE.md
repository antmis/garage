# Garage: working notes

A mobile-first maintenance checklist for one vehicle (2024 Toyota Tacoma, 2.4L turbo). Plain Vite + React 19 SPA,
progress in localStorage with optional Supabase sync keyed on a typed email. Architecture follows Money Date;
code-style rules follow TAT.

## Commands

```bash
npm run dev      # vite dev server (honors PORT)
npm run build    # tsc -b && vite build
npm run lint     # eslint
```

## Architecture

```
src/
  ui/primitives/   raw shadcn/Radix wrappers. Nothing app-specific
  ui/*.tsx         composed, app-facing components; ui/index.ts is the barrel
  features/        self-contained (components/ hooks/ types/ utils/ + index.ts public API)
  data/<vehicle>/  typed static content: the maintenance manual
  pages/           thin routes that compose features
  shared/layout/   AppLayout, header, theme toggle
  lib/             utils, supabase client, storage helpers
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
- How-to content is written once per task in `data/tacoma/catalog.ts`; `intervals.ts` only decides what is due when.
- Don't invent specs. Torque values, capacities and part numbers need a confirmed source (Owner’s Manual or an
  authoritative one); otherwise leave the field empty and put a TODO in `notes`.
- Videos must be real and verified; never guess a YouTube id.

## Persistence

`ProgressRepository` (in `features/checklist/types`) has a localStorage and a Supabase implementation. The email
identity is temporary and unverified; swapping to Supabase Auth is a change to `supabaseRepository.ts`, the
identity feature and the migration's policies.

## Comments

Comments explain constraints and non-obvious mechanisms: what breaks if you change this, and why the obvious
approach doesn't work. One or two lines is the norm. Do not narrate history; git records that.

Document component props with per-prop JSDoc on a named `…Props` interface, not a prose block above the signature.
Skip the tag where the name and type already say it.
