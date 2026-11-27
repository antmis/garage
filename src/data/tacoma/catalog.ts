import type { TaskDef } from '../types'

export type { TaskDef }

// Intervals (./intervals.ts) decide what is due when; this file decides what each task *is*.

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
    parts: [
      { label: 'OE: Front left (driver) wiper blade assembly (85222-AK010)', store: 'toyota', query: '85222-AK010' },
      { label: 'OE: Front right (passenger) wiper blade assembly (85212-AK010)', store: 'toyota', query: '85212-AK010' },
      { label: 'OE: Left wiper blade rubber refill (85223-AK010)', store: 'toyota', query: '85223-AK010' },
      { label: 'Aftermarket wiper blades (2024 Tacoma)', store: 'amazon', query: '2024 Toyota Tacoma wiper blades' },
    ],
    notes: 'Part numbers are the ones Toyota’s catalog lists for a 2024 Tacoma; confirm fit by VIN. Blades should show no cracking, splitting, wear, contamination or deformation, and should clear the windshield without streaking or skipping.',
  },
  'rotate-tires': {
    name: 'Rotate tires',
    kind: 'shop',
    time: "About 30 minutes at a shop",
    steps: [
      "Book it at a tire shop or dealer. Discount Tire and Costco often rotate free or cheap if you bought tires there.",
      "Ask them to torque the lug nuts to the 4th gen spec.",
      "Ask them to check tire pressures and tread depth while they're at it.",
    ],
    tools: [],
    parts: [
      { label: "Discount Tire", url: "https://www.discounttire.com/" },
      { label: "Costco Tire Center", url: "https://www.costco.com/tires.html" },
    ],
    videos: [
    ],
    notes: "No 2024+ rotation video found. Existing rotation videos are 3rd gen with different torque specs, so they were left out. Uneven tire wear is a known issue on this truck; alignment is a separate job.\nPer the guide: rotate per the Owner’s Manual and check for damage and uneven wear.",
  },
  'brake-visual': {
    name: 'Visually inspect brake linings/drums and brake pads/discs',
    kind: 'inspect',
    notes: 'Check linings and drums for scoring, burning, fluid leakage, broken parts and excessive wear; pads for excessive wear and discs for runout, wear and fluid leakage.',
  },
  'engine-oil-and-filter': {
    name: 'Replace engine oil and oil filter',
    kind: 'diy',
    time: "About 30 minutes",
    steps: [
      "Warm the engine briefly, then drain the oil and replace the filter (see video for the housing and O-rings).",
      "Refill with 0W-20 full synthetic (ILSAC GF-6A / API SP). Capacity is about 5.8 to 5.9 qt, so add gradually and confirm on the dipstick.",
      "Reset the MAINT REQD light per the owner's manual (the log says every 5,000 miles).",
    ],
    tools: ["Drain pan (holds 6+ qt)", "14mm socket + ratchet (drain plug)", "Oil filter wrench (Motivx MX2320-US, or 64mm 14-flute cap, verify fit)", "Torque wrench (drain plug 30 ft-lb)", "Funnel"],
    parts: [
      { label: 'OE: Genuine Toyota oil filter (90915-YZZN1)', store: 'toyota', query: '90915-YZZN1' },
      { label: 'OE: Oil drain plug gasket (90430-12031)', store: 'toyota', query: '90430-12031' },
      { label: 'OE: Genuine Toyota 0W-20 motor oil, 6 qt case (00279-0WQTE-6S)', store: 'toyota', query: '00279-0WQTE-6S' },
      { label: "Oil filter: Toyota 90915-YZZN1", store: "amazon", query: "Toyota 90915-YZZN1 oil filter" },
      { label: "Drain plug gasket: Toyota 90430-12031 (replace every time, verify fit)", store: "amazon", query: "Toyota 90430-12031 drain plug gasket" },
      { label: "0W-20 full synthetic, 6 qt", store: "amazon", query: "0W-20 full synthetic motor oil API SP 6 quart" },
      { label: "AutoZone: oil filter", store: "autozone", query: "2024 Toyota Tacoma oil filter" },
    ],
    videos: [
      { title: "Don't Pay a Mechanic: DIY Your 2024+ Tacoma Oil Change", youtubeId: "JdifGjNiMpg", note: "Beginner friendly" },
      { title: "2024 Tacoma Oil Change", youtubeId: "J8uUgcOUuYw", note: "Lists tools and parts needed" },
      { title: "Oil Change (and filter): 2026 Tacoma 2.4L (2024–2026)", youtubeId: "XUZ0QkP0zkU" },
      { title: "How to Change Oil on a 4th Gen Tacoma (2024+)", youtubeId: "WVB3BHPAxB8" },
    ],
    notes: "Reset the oil replacement reminder (“MAINT REQD” / “OIL MAINTENANCE REQUIRED”) after service.\nUsed oil: most auto parts stores and many county transfer stations take it free. Keep a second container, since the drain is about 5.5 to 6 qt.\nFilter, gasket and oil part numbers are confirmed against Toyota’s catalog for a 2024 Tacoma 4WD 2.4L (which lists 0W-20). TODO: tool sizes, torque (30 ft-lb) and capacity are from the prototype; verify against the full Owner’s Manual.",
  },
  'spark-plugs': {
    name: 'Replace spark plugs',
    kind: 'shop',
    notes: 'Maintenance of spark plugs is required under the Emissions Control Warranty. Install plugs of the same type as originally equipped.',
  },
  'engine-air-filter': {
    name: 'Replace engine air filter',
    kind: 'diy',
    time: "About 5 minutes",
    steps: [
      "Find the airbox on the engine bay and unclip or unscrew the lid.",
      "Lift out the old filter and wipe any debris out of the box.",
      "Drop in the new filter seated flat, close the lid and re-latch all clips.",
    ],
    tools: ["Screwdriver (maybe)"],
    parts: [
      { label: 'OE: Engine air filter (17801-YZZ11)', store: 'toyota', query: '17801-YZZ11' },
      { label: 'OE: Engine air filter, alternate (17801-0P051)', store: 'toyota', query: '17801-0P051' },
      { label: "Amazon", store: "amazon", query: "2024 Toyota Tacoma 2.4L turbo engine air filter" },
      { label: "AutoZone", store: "autozone", query: "2024 Toyota Tacoma engine air filter" },
      { label: "RockAuto", url: "https://www.rockauto.com/" },
    ],
    videos: [
      { title: "2024 Toyota Tacoma: Air Filter Replacement", youtubeId: "8cNiGr-wN0I", note: "2.4L turbo and turbo hybrid" },
      { title: "2024 Tacoma TRD Off Road 2.4L turbo air filter change", youtubeId: "1IoBZL9oVXo" },
    ],
    notes: "Use your VIN or trim to confirm the filter fits your engine.",
  },
  'cabin-air-filter': {
    name: 'Replace cabin air filter',
    kind: 'diy',
    time: "About 5 minutes",
    steps: [
      "Open the glovebox and release the stops so it swings down fully.",
      "Unclip the filter cover, slide the old filter out, and note the airflow arrow.",
      "Slide the new filter in with the arrow matching, re-clip the cover, close the glovebox.",
    ],
    tools: ["None"],
    parts: [
      { label: 'OE: Cabin air filter (87139-YZZA8)', store: 'toyota', query: '87139-YZZA8' },
      { label: 'OE: Cabin air filter, alternate (87139-0C010)', store: 'toyota', query: '87139-0C010' },
      { label: "Amazon", store: "amazon", query: "2024 Toyota Tacoma cabin air filter" },
      { label: "AutoZone", store: "autozone", query: "2024 Toyota Tacoma cabin air filter" },
      { label: "RockAuto", url: "https://www.rockauto.com/" },
    ],
    videos: [
      { title: "2024–2027 4th Gen Tacoma Cabin Air Filter Replacement", youtubeId: "ZJ_c3bX4D6Y" },
      { title: "2024 Toyota Tacoma cabin air filter change", youtubeId: "oYsX8vKY7CI", note: "Says Toyota made access easy" },
      { title: "Toyota Tacoma (2024-2025): Cabin Air Filter Replacement", youtubeId: "Sx52vCiI0k8" },
    ],
    notes: "Heavy traffic, dirt roads, or urban/dusty/desert driving can shorten its life; more frequent replacement may be needed.",
  },
  'propeller-shaft-bolt': {
    name: 'Re-torque propeller shaft bolt',
    kind: 'diy',
    time: "About 15 minutes",
    steps: [
      "Safely raise and support the truck. Find the propeller shaft (driveshaft) flange bolts.",
      "Look up the torque spec in your owner's or repair manual. Do not guess.",
      "Tighten each bolt to spec with a torque wrench, working in a cross pattern.",
    ],
    tools: ["Torque wrench", "Jack stands (pair)", "Floor jack"],
    parts: [
      { label: "Torque wrench", store: "amazon", query: "3/8 drive click torque wrench" },
      { label: "Jack stands", store: "amazon", query: "3 ton jack stands pair" },
    ],
    videos: [
      { title: "Propeller or Drive Shaft Lubrication: 4Runner, Tacoma", youtubeId: "CzOwNiDQEBI", note: "Older Toyota driveline, orientation only, not torque values" },
      { title: "Propeller Shaft Maintenance: 4Runner or Tacoma (Short)", url: "https://www.youtube.com/shorts/dX2eA3Uvo5c", note: "Older Toyota driveline, orientation only" },
    ],
    notes: "No 2024+ Tacoma video found for this one. Torque spec still needs to be confirmed from the manual (TODO).\nThe guide says only a qualified technician should do this.",
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
    kind: 'diy',
    time: "About 15 minutes",
    steps: [
      "Safely raise and support the truck. Find the propeller shaft (driveshaft) flange bolts.",
      "Look up the torque spec in your owner's or repair manual. Do not guess.",
      "Tighten each bolt to spec with a torque wrench, working in a cross pattern.",
    ],
    tools: ["Torque wrench", "Jack stands (pair)", "Floor jack"],
    parts: [
      { label: "Torque wrench", store: "amazon", query: "3/8 drive click torque wrench" },
      { label: "Jack stands", store: "amazon", query: "3 ton jack stands pair" },
    ],
    videos: [
      { title: "Propeller or Drive Shaft Lubrication: 4Runner, Tacoma", youtubeId: "CzOwNiDQEBI", note: "Older Toyota driveline, orientation only, not torque values" },
      { title: "Propeller Shaft Maintenance: 4Runner or Tacoma (Short)", url: "https://www.youtube.com/shorts/dX2eA3Uvo5c", note: "Older Toyota driveline, orientation only" },
    ],
    notes: `${SALT_NOTE} No 2024+ Tacoma video found for this one. Torque spec still needs to be confirmed from the manual (TODO).\nThe guide says only a qualified technician should do this.`,
  },
  'tighten-nuts-bolts': {
    name: 'Tighten nuts and bolts on chassis and body',
    kind: 'shop',
    notes: 'Per the guide: retighten seat-mounting bolts and front/rear suspension member retaining bolts to specified torque. TODO: torque specs unconfirmed.\nOptional: only listed for dirt/dusty roads or towing. Check skid plates, crossmembers and suspension mounts, cab and bed mounts, and any hitch bolts.',
  },
  'transfer-case-oil': { name: 'Replace transfer case oil (4WD)', kind: 'diy', notes: 'Already replaced on this truck (per the original 30k prototype).' },
  'front-diff-oil': { name: 'Replace front differential oil (4WD)', kind: 'diy' },
  'rear-diff-oil': { name: 'Replace rear differential oil', kind: 'diy' },
  'manual-trans-oil': { name: 'Replace manual transmission oil', kind: 'shop' },
  'trans-fluid': { name: 'Replace transmission fluid or oil', kind: 'shop' },
  'atf': { name: 'Replace automatic transmission fluid', kind: 'shop' },
} satisfies Record<string, TaskDef>

export type TaskSlug = keyof typeof catalog
