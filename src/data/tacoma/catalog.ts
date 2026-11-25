import type { ItemKind, PartLink, VideoLink } from '../types'

/**
 * One task's how-to content, written once and shared by every interval that lists it.
 * Intervals (./intervals.ts) decide what is due when; this file decides what each task *is*.
 * Anything unverified stays empty and is flagged in `notes` as a TODO: no guessed specs.
 */
export interface TaskDef {
  name: string
  kind: ItemKind
  time?: string
  condition?: string
  steps?: string[]
  tools?: string[]
  parts?: PartLink[]
  videos?: VideoLink[]
  notes?: string
}

const FLUIDS_NOTE =
  'Inspect sealed transmissions, transfer cases and differentials for signs of leakage. If leakage from a sealed component is suspected, have it inspected by a Toyota dealer. Inspect power steering fluid (if equipped) and brake fluid level/condition. Inspect all cooling systems (if equipped): coolant level/condition/freezing point.'
const SALT_NOTE = 'Includes operating on roads where road salt has been applied.'
const DISC_NOTE = 'Inspect thickness measurement and disc runout.'
const COOLANT_NOTE = 'See the guide’s “Engine Coolant” explanation: Genuine Toyota Super Long-Life Coolant or similar non-silicate, non-amine, non-borate ethylene-glycol coolant with long-life hybrid organic acid technology. Other coolant types may change the interval.'
const INTERCOOLER_NOTE = 'See the guide’s “Intercooler Coolant” explanation: drain and refill with ethylene-glycol type coolant; inspect hoses and connections for corrosion and leaks.'

export const catalog = {
  // ── Scheduled (every interval unless the chart says otherwise) ────────────
  'efi-additive': {
    name: 'Add Toyota EFI Tank Additive or equivalent',
    kind: 'diy',
    condition: 'Hawaii only',
  },
  'floor-mat': {
    name: 'Check installation of driver’s floor mat',
    kind: 'inspect',
    notes: 'Only use the floor mat designed for this model and year; secure it with the retainers; never stack a second mat on top; never install it upside down.',
  },
  'fluid-levels': {
    name: 'Inspect and adjust all fluid levels',
    kind: 'diy',
    notes: FLUIDS_NOTE,
  },
  'wiper-blades': {
    name: 'Inspect wiper blades',
    kind: 'inspect',
    notes: 'Blades should show no cracking, splitting, wear, contamination or deformation, and should clear the windshield without streaking or skipping.',
  },
  'rotate-tires': {
    name: 'Rotate tires',
    kind: 'diy',
    notes: 'Rotate per the Owner’s Manual. While rotating, check for damage and uneven wear.',
  },
  'brake-visual': {
    name: 'Visually inspect brake linings/drums and brake pads/discs',
    kind: 'inspect',
    notes: 'Check linings and drums for scoring, burning, fluid leakage, broken parts and excessive wear; pads for excessive wear and discs for runout, wear and fluid leakage.',
  },
  'engine-oil-and-filter': {
    name: 'Replace engine oil and oil filter',
    kind: 'diy',
    notes: 'Reset the oil replacement reminder (“MAINT REQD” / “OIL MAINTENANCE REQUIRED”) after service.',
  },
  'spark-plugs': {
    name: 'Replace spark plugs',
    kind: 'shop',
    notes: 'Maintenance of spark plugs is required under the Emissions Control Warranty. Install plugs of the same type as originally equipped.',
  },
  'engine-air-filter': {
    name: 'Replace engine air filter',
    kind: 'diy',
  },
  'cabin-air-filter': {
    name: 'Replace cabin air filter',
    kind: 'diy',
    notes: 'Heavy traffic, dirt roads, or urban/dusty/desert driving can shorten its life; more frequent replacement may be needed.',
  },
  'propeller-shaft-bolt': {
    name: 'Re-torque propeller shaft bolt',
    kind: 'shop',
    notes: 'The guide says only a qualified technician should do this. TODO: torque spec unconfirmed; do not guess.',
  },
  'engine-coolant': {
    name: 'Replace engine coolant',
    kind: 'shop',
    notes: `Initial replacement at 100,000 miles/120 months, then every 50,000 miles/60 months. ${COOLANT_NOTE}`,
  },
  'intercooler-coolant': {
    name: 'Replace intercooler coolant',
    kind: 'shop',
    notes: `Initial replacement at 100,000 miles/120 months, then every 50,000 miles/60 months. ${INTERCOOLER_NOTE}`,
  },
  'vacuum-pump': {
    name: 'Inspect vacuum pump for brake booster',
    kind: 'shop',
    notes: 'Replace the vacuum pump vane and vane caps with new ones; never reuse them. A qualified technician should do this.',
  },

  // ── “Inspect the following” list ───────────────────────────────────────────
  'atf-cooler-hoses': { name: 'Automatic transmission fluid cooler hoses and connections', kind: 'inspect' },
  'ball-joints': {
    name: 'Ball joints and dust covers',
    kind: 'inspect',
    notes: 'Check for looseness and damage; check dust covers for deterioration. Replace damaged parts (technician).',
  },
  'brake-lines-hoses': {
    name: 'Brake lines and hoses',
    kind: 'inspect',
    notes: 'Check for proper installation, chafing, cracks, deterioration and leakage.',
  },
  'brake-linings-pads': { name: 'Brake linings/drums and brake pads/discs', kind: 'inspect', notes: DISC_NOTE },
  'cabin-air-filter-inspect': {
    name: 'Cabin air filter',
    kind: 'inspect',
    notes: 'Heavy traffic, dirt roads or urban/dusty/desert driving may shorten its life. Replace if airflow from the A/C and heater is reduced or windows fog easily in “Fresh” mode.',
  },
  'drive-belts': {
    name: 'Drive belts',
    kind: 'inspect',
    notes: 'Initial inspection at 60,000 miles/72 months, then every 15,000 miles/18 months. Look for cracks, wear and oiliness; check tension.',
  },
  'drive-shaft-boots': {
    name: 'Drive shaft boots (4WD)',
    kind: 'inspect',
    notes: 'Check boots and clamps for cracks, deterioration and damage.',
  },
  'engine-coolant-inspect': { name: 'Engine coolant', kind: 'inspect', notes: COOLANT_NOTE },
  'exhaust': {
    name: 'Exhaust pipes and mountings',
    kind: 'inspect',
    notes: 'Inspect pipes, muffler and hangers for cracks, deterioration and damage; with the engine running, listen for exhaust leaks.',
  },
  'front-diff-oil-inspect': { name: 'Front differential oil (4WD)', kind: 'inspect', notes: 'Check for leakage.' },
  'fuel-lines': {
    name: 'Fuel lines and connections, fuel tank band and fuel tank vapor vent system hoses',
    kind: 'inspect',
    notes: 'Look for corrosion, damage, cracks, and loose or leaking connections.',
  },
  'fuel-cap-gasket': { name: 'Fuel tank cap gasket', kind: 'inspect', notes: 'Look for cracks, deterioration and damage.' },
  'intercooler-coolant-inspect': { name: 'Intercooler coolant', kind: 'inspect', notes: INTERCOOLER_NOTE },
  'radiator-condenser': {
    name: 'Radiator, condenser and/or intercooler',
    kind: 'inspect',
    notes: 'Look for debris, corrosion and damage.',
  },
  'rear-diff-oil-inspect': { name: 'Rear differential oil', kind: 'inspect', notes: 'Check for leakage.' },
  'steering-gear': { name: 'Steering gear', kind: 'inspect', notes: 'Check for leakage.' },
  'steering-linkage-boots': {
    name: 'Steering linkage and boots',
    kind: 'inspect',
    notes: 'Check for excessive steering wheel freeplay with the vehicle stopped; inspect linkage for bending and boots for cracks.',
  },
  'transfer-case-oil-inspect': { name: 'Transfer case oil (4WD)', kind: 'inspect', notes: 'Check for leakage.' },
  'transmission-leaks': { name: 'Transmission for signs of leakage', kind: 'inspect' },

  // ── Special operating conditions ───────────────────────────────────────────
  'dusty-ball-joints': { name: 'Inspect ball joints and dust covers', kind: 'inspect' },
  'dusty-drive-shaft-boots': { name: 'Inspect drive shaft boots (4WD)', kind: 'inspect' },
  'dusty-engine-air-filter': {
    name: 'Inspect engine air filter',
    kind: 'inspect',
    notes: 'Check for damage, excessive wear and oiliness; replace if necessary.',
  },
  'dusty-steering-linkage': { name: 'Inspect steering linkage and boots', kind: 'inspect' },
  'clutch-fork': {
    name: 'Lubricate clutch fork',
    kind: 'shop',
    notes: 'Lubricate within 24 hours after submerging. A qualified technician should do this.',
  },
  'propeller-shaft-bolt-salt': {
    name: 'Re-torque propeller shaft bolt',
    kind: 'shop',
    notes: `${SALT_NOTE} The guide says only a qualified technician should do this. TODO: torque spec unconfirmed; do not guess.`,
  },
  'tighten-nuts-bolts': {
    name: 'Tighten nuts and bolts on chassis and body',
    kind: 'shop',
    notes: 'Per the guide: retighten seat-mounting bolts and front/rear suspension member retaining bolts to specified torque. TODO: torque specs unconfirmed.',
  },
  'transfer-case-oil': { name: 'Replace transfer case oil (4WD)', kind: 'diy' },
  'front-diff-oil': { name: 'Replace front differential oil (4WD)', kind: 'diy' },
  'rear-diff-oil': { name: 'Replace rear differential oil', kind: 'diy' },
  'manual-trans-oil': { name: 'Replace manual transmission oil', kind: 'shop' },
  'trans-fluid': { name: 'Replace transmission fluid or oil', kind: 'shop' },
  'atf': { name: 'Replace automatic transmission fluid', kind: 'shop' },
} satisfies Record<string, TaskDef>

export type TaskSlug = keyof typeof catalog
