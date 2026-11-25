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
    parts: [{ label: 'Wiper blades (2024 Tacoma)', store: 'amazon', query: '2024 Toyota Tacoma wiper blades' }],
    notes: 'Blades should show no cracking, splitting, wear, contamination or deformation, and should clear the windshield without streaking or skipping.',
  },
  'rotate-tires': {
    name: 'Rotate tires',
    kind: 'diy',
    time: '30–45 min',
    steps: [
      'Loosen the lug nuts slightly while the truck is on the ground, then jack and support it on stands.',
      'Remove the wheels and move them to their new positions following the pattern in the Owner’s Manual.',
      'Check each tire for damage and uneven wear while it is off.',
      'Fit the wheels, snug the lug nuts in a star pattern, lower the truck, and torque them in a star pattern.',
    ],
    tools: ['Jack and jack stands', 'Lug wrench or breaker bar and socket', 'Torque wrench'],
    notes: 'Rotate per the Owner’s Manual. While rotating, check for damage and uneven wear.\nTODO: lug nut torque and the rotation pattern are unconfirmed (the Quick Reference Guide provided doesn’t list them). Check the 4th-gen Owner’s Manual. No 4th-gen video was verified for this task.',
  },
  'brake-visual': {
    name: 'Visually inspect brake linings/drums and brake pads/discs',
    kind: 'inspect',
    notes: 'Check linings and drums for scoring, burning, fluid leakage, broken parts and excessive wear; pads for excessive wear and discs for runout, wear and fluid leakage.',
  },
  'engine-oil-and-filter': {
    name: 'Replace engine oil and oil filter',
    kind: 'diy',
    time: '30–45 min',
    steps: [
      'Warm the engine briefly, park on level ground, and shut it off. Let it sit a few minutes so oil drains back to the pan.',
      'Raise and support the truck safely if you need the clearance (one video notes 4x4 trucks can do this without lifting).',
      'Place a drain pan, remove the drain plug and let the oil drain fully. Replace the drain plug gasket if the video or your parts source calls for it.',
      'Remove the old oil filter, wipe the mounting surface, and install the new filter per the filter’s own instructions.',
      'Refit the drain plug, then refill through the filler cap, adding oil in stages.',
      'Run the engine briefly, shut it off, wait, and check the dipstick. Top up to the full mark.',
      'Reset the oil maintenance reminder on the multi-information display.',
    ],
    tools: ['Drain pan', 'Socket wrench and sockets (drain plug size: check the video)', 'Oil filter wrench or the filter tool the video uses', 'Funnel', 'Jack stands or ramps (if lifting)', 'Gloves and rags'],
    parts: [
      { label: 'Engine oil filter (2024 Tacoma 2.4L turbo)', store: 'autozone', query: '2024 Toyota Tacoma 2.4L turbo oil filter' },
      { label: 'Engine oil (see Notes for the grade)', store: 'amazon', query: 'Toyota Tacoma 2024 2.4L engine oil' },
      { label: 'Drain plug gasket', store: 'amazon', query: '2024 Toyota Tacoma 2.4L oil drain plug gasket' },
    ],
    videos: [
      { title: 'How to Change Engine Oil on a 2024 Toyota Tacoma 2.4L Turbo (T24A-FTS)', youtubeId: 'ANvstSqG7VQ', note: 'Rat107' },
      { title: 'How to Change Oil on a 4th Gen Tacoma (2024+)', youtubeId: 'WVB3BHPAxB8', note: 'Chloe Kuo' },
      { title: 'DIY Your 2024+ Tacoma Oil Change', youtubeId: 'JdifGjNiMpg', note: 'Jason Explains Things' },
      { title: 'Oil Change (and filter): 2026 Toyota Tacoma, 2.4L (2024–2026)', youtubeId: 'XUZ0QkP0zkU', note: 'Insane Oil' },
      { title: '2024+ Tacoma Oil Change Guide', youtubeId: 'utrsluaY3Kc', note: 'Toyota Fanatics' },
    ],
    notes: 'Reset the oil replacement reminder (“MAINT REQD” / “OIL MAINTENANCE REQUIRED”) after service.\nTODO: oil grade, capacity, drain plug torque and filter part number unconfirmed. Web sources disagree on capacity (about 5.6–6.2 qt); the Owner’s Manual provided is only the Quick Reference Guide. Confirm in the full Owner’s Manual and fill to the dipstick.',
  },
  'spark-plugs': {
    name: 'Replace spark plugs',
    kind: 'shop',
    notes: 'Maintenance of spark plugs is required under the Emissions Control Warranty. Install plugs of the same type as originally equipped.',
  },
  'engine-air-filter': {
    name: 'Replace engine air filter',
    kind: 'diy',
    time: '10 min',
    steps: [
      'Open the hood and locate the air filter housing.',
      'Release the housing clips or fasteners and lift the cover.',
      'Remove the old filter, noting its orientation, and wipe out any debris in the housing.',
      'Seat the new filter the same way, then close and secure the cover.',
    ],
    tools: ['Screwdriver or socket if the housing uses fasteners (check the video)'],
    parts: [{ label: 'Engine air filter (2024 Tacoma 2.4L turbo)', store: 'amazon', query: '2024 Toyota Tacoma 2.4L turbo engine air filter' }],
    videos: [
      { title: '2024 Toyota Tacoma TRD Off Road 2.4L turbo air filter change', youtubeId: '1IoBZL9oVXo', note: 'Cory’s DIY Auto' },
      { title: '2024–2026 Toyota Tacoma: Air Filter Replacement', youtubeId: '8cNiGr-wN0I', note: 'TDTVGarage' },
    ],
    notes: 'TODO: filter part number unconfirmed.',
  },
  'cabin-air-filter': {
    name: 'Replace cabin air filter',
    kind: 'diy',
    time: '10 min',
    steps: [
      'Open the glove box and release it so it swings down out of the way (the videos show the exact tabs).',
      'Open the filter cover and slide the old filter out, noting airflow direction.',
      'Slide the new filter in with the airflow arrow oriented as before, then close the cover and glove box.',
    ],
    tools: ['Usually none (check the video)'],
    parts: [{ label: 'Cabin air filter (2024 Tacoma)', store: 'amazon', query: '2024 Toyota Tacoma cabin air filter' }],
    videos: [
      { title: '2024–2027 4th Gen Toyota Tacoma Cabin Air Filter Replacement', youtubeId: 'ZJ_c3bX4D6Y' },
      { title: 'Toyota Tacoma (2024–2026): Cabin Air Filter Replacement', youtubeId: 'Sx52vCiI0k8', note: 'Morozov Automotive' },
      { title: '2024 Toyota Tacoma cabin air filter change', youtubeId: 'oYsX8vKY7CI', note: 'Cory’s DIY Auto' },
      { title: 'Cabin Air Filter Replacement: 2026 Toyota Tacoma, 2.4L (2024–2026)', youtubeId: 'ku9cuGXDh_E', note: 'Insane Oil' },
    ],
    notes: 'TODO: filter part number unconfirmed. Heavy traffic, dirt roads, or urban/dusty/desert driving can shorten its life; more frequent replacement may be needed.',
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
