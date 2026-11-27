import type { TaskDef } from '../types'

// Intervals (./intervals.ts) decide what is due when; this file decides what each task *is*.
// Names and notes paraphrase the check sheet; it gives no specs, so none are stated here.

const RENEW_IF_WORN = 'Replace if worn beyond the service limit.'
const ADDITIONAL = 'Triumph lists this as an additional item, charged on top of the basic service.'
const REPLACE_IF_DAMAGED = 'Replace if necessary.'

export const catalog = {
  // ── Lubrication ────────────────────────────────────────────────────────────
  'engine-oil-cooler-leaks': { name: 'Check engine and oil cooler for leaks', kind: 'inspect' },
  'engine-oil': { name: 'Replace engine oil', kind: 'diy' },
  'oil-filter': { name: 'Replace engine oil filter', kind: 'diy' },

  // ── Fuel system and engine management ──────────────────────────────────────
  autoscan: {
    name: 'Run a full Autoscan',
    kind: 'shop',
    notes: 'Needs the Triumph diagnostic tool, so it’s a dealer job. Ask for a printed customer copy.',
  },
  'fuel-leaks': { name: 'Check fuel system for leaks', kind: 'inspect' },
  'fuel-hoses-check': {
    name: 'Check fuel hoses for chafing, cracks or damage',
    kind: 'inspect',
    notes: REPLACE_IF_DAMAGED,
  },
  'air-cleaner': { name: 'Replace air cleaner', kind: 'diy' },
  'fuel-filter': { name: 'Replace fuel filter', kind: 'shop', condition: 'If fitted' },
  'throttle-body-plate': { name: 'Check and clean throttle body plates (butterflies)', kind: 'diy' },
  'throttle-cables': { name: 'Check throttle cables for chafing, cracks or damage; adjust', kind: 'inspect' },
  'secondary-air': { name: 'Check and clean secondary air injection system', kind: 'diy' },
  'exhaust-clamp-bolts': {
    name: 'Check secondary exhaust clamp bolt torque',
    kind: 'diy',
    condition: 'If fitted',
    notes: 'TODO: the check sheet gives no torque value; confirm it in the service manual.',
  },
  'throttle-balance': { name: 'Balance throttle bodies', kind: 'shop' },
  'fuel-hoses-renew': { name: 'Replace fuel hoses', kind: 'shop', condition: 'Every 4 years', notes: ADDITIONAL },
  'evap-hoses-renew': {
    name: 'Replace evaporative hoses',
    kind: 'shop',
    condition: 'If fitted, every 4 years',
    notes: ADDITIONAL,
  },

  // ── Ignition ───────────────────────────────────────────────────────────────
  'spark-plugs-check': { name: 'Check spark plugs', kind: 'inspect' },
  'spark-plugs-renew': { name: 'Replace spark plugs', kind: 'diy' },

  // ── Cooling ────────────────────────────────────────────────────────────────
  'cooling-leaks': { name: 'Check cooling system for leaks', kind: 'inspect' },
  'coolant-hoses': {
    name: 'Check coolant hoses for chafing, cracks or damage',
    kind: 'inspect',
    notes: REPLACE_IF_DAMAGED,
  },
  'coolant-level': { name: 'Check and adjust coolant level', kind: 'diy' },
  'coolant-renew': { name: 'Replace coolant', kind: 'diy', condition: 'Every 3 years', notes: ADDITIONAL },

  // ── Engine ─────────────────────────────────────────────────────────────────
  'clutch-cable': { name: 'Check clutch cable for chafing, cracks or damage; adjust', kind: 'inspect' },
  'valve-clearances': { name: 'Check and adjust valve clearances', kind: 'shop', notes: ADDITIONAL },

  // ── Wheels and tires ───────────────────────────────────────────────────────
  'wheels-damage': { name: 'Inspect wheels for damage', kind: 'inspect' },
  'wheel-bearings': { name: 'Check wheel bearings for wear and smooth operation', kind: 'inspect' },
  'tire-wear': { name: 'Check tire wear and damage', kind: 'inspect' },
  'tire-pressures': { name: 'Check and adjust tire pressures', kind: 'diy' },

  // ── Steering and suspension ────────────────────────────────────────────────
  steering: { name: 'Check steering for free operation', kind: 'inspect' },
  'forks-check': { name: 'Check forks for damage, leaks and smooth operation', kind: 'inspect' },
  'fork-oil': { name: 'Replace fork oil', kind: 'shop' },
  'headstock-check': { name: 'Check and adjust headstock bearings', kind: 'inspect' },
  'headstock-lube': { name: 'Lubricate headstock bearings', kind: 'shop' },
  'rear-suspension': { name: 'Check and lubricate rear suspension unit and linkage', kind: 'shop' },

  // ── Brakes ─────────────────────────────────────────────────────────────────
  'brake-pads': { name: 'Check brake pad wear', kind: 'inspect', notes: RENEW_IF_WORN },
  'brake-master-cylinders': { name: 'Check brake master cylinders for fluid leaks', kind: 'inspect' },
  'brake-calipers': { name: 'Check brake calipers for fluid leaks and seized pistons', kind: 'inspect' },
  'brake-fluid-levels': { name: 'Check brake fluid levels', kind: 'inspect' },
  'brake-fluid-renew': { name: 'Replace brake fluid', kind: 'diy', condition: 'Every 2 years', notes: ADDITIONAL },

  // ── Drive chain ────────────────────────────────────────────────────────────
  'chain-slack': { name: 'Check and adjust drive chain slack', kind: 'diy' },
  'chain-wear': { name: 'Check drive chain wear', kind: 'inspect', notes: RENEW_IF_WORN },
  'chain-lube': { name: 'Lubricate drive chain', kind: 'diy' },
  'chain-rubbing-strip': {
    name: 'Check drive chain rubbing strip for wear, cracks or damage',
    kind: 'inspect',
    notes: RENEW_IF_WORN,
  },

  // ── Electrical ─────────────────────────────────────────────────────────────
  'lights-electrics': { name: 'Check and adjust lights, instruments and electrical systems', kind: 'inspect' },

  // ── General ────────────────────────────────────────────────────────────────
  'bank-angle': { name: 'Check bank angle indicators for wear', kind: 'inspect', notes: RENEW_IF_WORN },
  fasteners: { name: 'Inspect fasteners for security', kind: 'inspect' },
  'side-stand': { name: 'Check side stand for wear and smooth operation', kind: 'inspect' },
  'service-bulletins': { name: 'Carry out outstanding service bulletin and warranty work', kind: 'shop' },
  'road-test': { name: 'Road test', kind: 'diy' },
  'service-record': {
    name: 'Complete the service record',
    kind: 'diy',
    notes: 'Also reset the service indicator, if fitted.',
  },
} satisfies Record<string, TaskDef>

export type TaskSlug = keyof typeof catalog
