import type { PartLink, VideoLink } from '../types'
import type { TaskSlug } from './catalog'

/**
 * How-to content layered over `catalog.ts`. Steps for inspections and shop jobs paraphrase the guide’s
 * “Explanation of Maintenance Items” (the only authoritative source on hand); no specs are stated here.
 * `moreNotes` is appended to the catalog note.
 */
export interface TaskDetail {
  time?: string
  steps?: string[]
  tools?: string[]
  parts?: PartLink[]
  videos?: VideoLink[]
  moreNotes?: string
}

const LIGHT = ['Flashlight', 'Gloves and rags']
const SHOP_STEPS = (job: string) => [
  `The guide says a qualified technician should do this. Book it with a Toyota dealer or a shop you trust.`,
  `Ask for: ${job}`,
  'Keep the invoice and mileage for your service records.',
]
const UNVERIFIED_DIFF =
  'TODO: Toyota’s catalog showed no gear-oil listing for this truck, so the part link is a plain search. Confirm the spec before buying.\nTODO: fluid type, capacity, fill/drain plug torque and the procedure are unconfirmed for the 4th gen. No 2024+ video was found (existing ones cover 2009–2023 trucks), so none are listed.'

export const details: Partial<Record<TaskSlug, TaskDetail>> = {
  'efi-additive': {
    parts: [
      { label: 'OE: Toyota EFI cleaner tank additive (00289-EFI34)', store: 'toyota', query: '00289-EFI34' },
    ],
    steps: [
      'Skip this unless you live in Hawaii; the guide lists it as Hawaii only.',
      'Pour the Toyota EFI tank additive (or an equivalent) into the fuel tank, following the product label.',
    ],
    tools: ['Funnel (if the bottle needs one)'],
    moreNotes: 'TODO: dose and exact product unconfirmed; follow the label.',
  },
  'floor-mat': {
    parts: [
      { label: 'OE: Carpet floor mats, TRD Off Road (PT206-35249-02)', store: 'toyota', query: 'PT206-35249-02' },
      { label: 'OE: Carpet floor mats, black (PT206-35247-02)', store: 'toyota', query: 'PT206-35247-02' },
          ],
    time: '1 min',
    steps: [
      'Confirm the driver’s mat is the one made for this model and year.',
      'Check that it is clipped to the retainers and does not slide toward the pedals.',
      'Make sure no second mat is stacked on top and the mat is not upside down.',
    ],
    tools: [],
  },
  'fluid-levels': {
    parts: [
      { label: 'OE: Brake fluid (00475-1BF03)', store: 'toyota', query: '00475-1BF03' },
      { label: 'OE: Windshield washer fluid concentrate (00475-00WWF)', store: 'toyota', query: '00475-00WWF' },
      { label: 'OE: Super Long Life coolant (00272-SLLC2)', store: 'toyota', query: '00272-SLLC2' },
    ],
    time: '10 min',
    steps: [
      'Park on level ground. Check the engine oil on the dipstick with the engine off for a few minutes.',
      'Check the engine coolant reservoir and, separately, the intercooler coolant reservoir; look at level and colour.',
      'Check the brake fluid reservoir level and condition.',
      'Check the windshield washer fluid and top up.',
      'Check power steering fluid if the truck has a reservoir.',
      'Look under the truck and at the transmission, transfer case and differentials for any leaks. Have a dealer look at suspected leaks.',
    ],
    tools: [...LIGHT, 'Funnel'],
    moreNotes: 'TODO: reservoir locations, MIN/MAX marks and fluid types need the full Owner’s Manual. No 2024+ video was verified for this.',
  },
  'wiper-blades': {
    time: '5 min',
    steps: [
      'Lift the wiper arm off the glass and look along each blade for cracks, splits, wear or contamination.',
      'Run them with washer fluid; they should clear the glass without streaking or skipping.',
      'If they fail, lift the arm, release the blade clip and slide the old blade off, then slide the new one on until it clicks.',
    ],
    tools: [],
    videos: [
      { title: '2024 Toyota Tacoma wiper blade change', youtubeId: 'Wmf8J-VW1hw', note: 'Cory’s DIY Auto' },
      { title: 'Wiper Blade Replacement 2024 Toyota Tacoma (Entire Wiper Blade)', youtubeId: '5fPyt8ojX7A', note: 'The OCD Repairman' },
    ],
    moreNotes: 'Blade lengths unconfirmed; the OE part numbers are from Toyota’s catalog, so use those for fit.',
  },
  'brake-visual': {
    time: '10 min',
    steps: [
      'With the wheels on, look through the wheel spokes at the pads and discs for scoring, uneven wear or fluid leakage.',
      'At tire-rotation time, with the wheels off, look at pad thickness, disc surface and any leaks.',
      'Anything that looks worn or damaged: have a technician measure and replace.',
    ],
    tools: LIGHT,
  },
  'engine-coolant': {
    steps: SHOP_STEPS('drain and refill of the engine cooling system with Toyota Super Long-Life Coolant (or an equivalent the guide describes), and an inspection of hoses and connections.'),
    tools: [],
    parts: [
      { label: 'OE: Genuine Toyota Super Long Life Coolant (00272-SLLC2)', store: 'toyota', query: '00272-SLLC2' },
    ],
  },
  'intercooler-coolant': {
    steps: SHOP_STEPS('drain and refill of the intercooler coolant circuit, and an inspection of its hoses and connections.'),
    tools: [],
    parts: [
      { label: 'OE: Genuine Toyota Super Long Life Coolant (00272-SLLC2); confirm it suits the intercooler loop', store: 'toyota', query: '00272-SLLC2' },
    ],
  },
  'vacuum-pump': { steps: SHOP_STEPS('inspection of the brake booster vacuum pump, with new vane and vane caps fitted if replaced (never reused).'), tools: [] },
  'spark-plugs': {
    parts: [
      { label: 'OE: Spark plug (90919-A1008)', store: 'toyota', query: '90919-A1008' },
      { label: 'OE: Spark plug tube gasket (11193-F0010)', store: 'toyota', query: '11193-F0010' },
    ],
    time: '1–2 hours',
    steps: [
      'The guide says a qualified technician should do this, and it is required under the Emissions Control Warranty.',
      'If doing it yourself: let the engine cool, remove the engine cover and ignition coils, remove the plugs, fit new plugs of the same type as original, and refit the coils.',
    ],
    tools: ['Ratchet, extension and spark plug socket (sizes: check the video)', 'Torque wrench'],
    videos: [{ title: '2022–2025 Toyota Tacoma 2.4L (T24A-FTS): Replace Spark Plugs and Coils', youtubeId: '48B0x4eN040', note: 'Pro Tips Plus' }],
    moreNotes: 'Part numbers are from Toyota’s catalog for this truck; confirm quantity. TODO: gap and torque unconfirmed.',
  },
  'propeller-shaft-bolt': {},
  'atf-cooler-hoses': {
    steps: ['Look along the transmission cooler hoses and their connections for cracks, chafing, wetness or loose clamps.'],
    tools: LIGHT,
  },
  'ball-joints': {
    steps: [
      'Look at each ball joint dust cover for splits, tears or grease leaking out.',
      'A technician checks the joints for play. Book a shop if you feel clunks or looseness.',
    ],
    tools: LIGHT,
  },
  'brake-lines-hoses': {
    steps: [
      'Follow each brake line and flexible hose from the body to each wheel.',
      'Look for chafing, cracks, bulges, rust or wetness at the fittings.',
    ],
    tools: LIGHT,
  },
  'brake-linings-pads': {
    steps: [
      'Wheels off: look at pad and shoe thickness, disc and drum surface, and any fluid leakage.',
      'The guide also calls for measuring thickness and disc runout, which needs a micrometer and dial gauge; have a shop do it.',
    ],
    tools: [...LIGHT, 'Jack and jack stands'],
  },
  'cabin-air-filter-inspect': {
    steps: [
      'Open the glove box and pull the filter (see the cabin air filter videos).',
      'Replace it if it is dirty, or if airflow is weak or windows fog easily in “Fresh” mode.',
    ],
    tools: [],
    videos: [{ title: '2024–2027 4th Gen Toyota Tacoma Cabin Air Filter Replacement', youtubeId: 'ZJ_c3bX4D6Y' }],
  },
  'drive-belts': {
    steps: ['With the engine off, look at the belts for cracks, glazing, fraying and oil; check tension by pressing. Replace damaged belts.'],
    tools: LIGHT,
  },
  'drive-shaft-boots': {
    steps: ['Look at the CV boots and clamps at each axle for cracks, tears, loose clamps or grease slung around.'],
    tools: LIGHT,
  },
  'engine-coolant-inspect': {
    steps: ['Check the level and colour in the reservoir, and look at the hoses and connections for corrosion and leaks.'],
    tools: LIGHT,
  },
  'exhaust': {
    steps: [
      'Look over the pipes, muffler and hangers for cracks, rust-through and broken or stretched hangers.',
      'With the engine running, listen for ticking or hissing that points to a leak.',
    ],
    tools: LIGHT,
  },
  'front-diff-oil-inspect': { steps: ['Look at the front differential for oil weeping around the housing, plugs and seals.'], tools: LIGHT },
  'fuel-lines': {
    steps: ['Look along the fuel lines, tank band and vapor vent hoses for corrosion, cracks, damage and loose or wet connections.'],
    tools: LIGHT,
  },
  'fuel-cap-gasket': { steps: ['Remove the fuel cap and look at its gasket for cracks, hardening or damage.'], tools: [] },
  'intercooler-coolant-inspect': {
    steps: ['Check the intercooler coolant reservoir level and look at its hoses and connections for corrosion and leaks.'],
    tools: LIGHT,
  },
  'radiator-condenser': {
    steps: ['Look through the grille at the radiator, A/C condenser and intercooler for debris, corrosion and damage.'],
    tools: LIGHT,
  },
  'rear-diff-oil-inspect': { steps: ['Look at the rear differential for oil weeping around the housing, plugs and seals.'], tools: LIGHT },
  'steering-gear': { steps: ['Look at the steering gear and its boots for fluid leakage.'], tools: LIGHT },
  'steering-linkage-boots': {
    steps: [
      'With the truck stopped, move the steering wheel and note any excessive free play.',
      'Look at the linkage for bending and the dust boots for cracks or tears.',
    ],
    tools: LIGHT,
  },
  'transfer-case-oil-inspect': { steps: ['Look at the transfer case for oil weeping at the seals, plugs and housing.'], tools: LIGHT },
  'transmission-leaks': { steps: ['Look under the transmission and at its pan and seals for leaks.'], tools: LIGHT },

  // Special-condition tasks
  'dusty-ball-joints': { steps: ['Same check as “Ball joints and dust covers”: look at each dust cover for tears or leaking grease.'], tools: LIGHT },
  'dusty-drive-shaft-boots': { steps: ['Same check as “Drive shaft boots”: look for cracks, tears and loose clamps.'], tools: LIGHT },
  'dusty-engine-air-filter': {
    steps: ['Open the air filter housing and look for damage, wear and oiliness; replace the filter if it is dirty or damaged.'],
    tools: [],
    videos: [
      { title: '2024 Toyota Tacoma TRD Off Road 2.4L turbo air filter change', youtubeId: '1IoBZL9oVXo', note: 'Cory’s DIY Auto' },
    ],
  },
  'dusty-steering-linkage': { steps: ['Same check as “Steering linkage and boots”: look for bending, free play and torn boots.'], tools: LIGHT },
  'clutch-fork': {
    steps: SHOP_STEPS('lubrication of the clutch fork (manual transmissions). The guide says to do it within 24 hours after submerging.'),
    tools: [],
  },
  'tighten-nuts-bolts': {
    steps: SHOP_STEPS('retightening of the seat-mounting bolts and front/rear suspension member bolts to spec.'),
    tools: [],
  },
  'transfer-case-oil': {
    parts: [
      { label: 'OE: Toyota gear oil (search; no matching listing found for this truck)', store: 'toyota', query: 'gear oil' },
    ],
    time: '20–30 min',
    steps: [
      'Raise and support the truck safely and place a drain pan under the transfer case.',
      'Remove the fill plug first (so you know you can refill), then the drain plug, and let it drain.',
      'Refit the drain plug, refill through the fill hole until it just seeps out, then refit the fill plug.',
    ],
    tools: ['Drain pan', 'Socket wrench (plug sizes: check the video)', 'Fluid pump', 'Torque wrench', 'Jack stands'],
    videos: [{ title: 'How to: 4th Gen Toyota Tacoma Transfer Case Service', youtubeId: '_FxNWJX0FGk', note: 'TEQSPORT Off-Road. Title says 4th gen; not watched through.' }],
    moreNotes: 'TODO: fluid type, capacity and plug torque unconfirmed. Step order is general practice; follow the video.',
  },
  'front-diff-oil': {
    parts: [
      { label: 'OE: Toyota gear oil (search; no matching listing found for this truck)', store: 'toyota', query: 'gear oil' },
    ],
    time: '20–30 min',
    steps: [
      'Raise and support the truck safely and place a drain pan under the front differential.',
      'Remove the fill plug first, then the drain plug, and let it drain.',
      'Refit the drain plug, refill until fluid reaches the fill hole, then refit the fill plug.',
    ],
    tools: ['Drain pan', 'Socket wrench (plug sizes: unconfirmed)', 'Fluid pump', 'Torque wrench', 'Jack stands'],
    moreNotes: UNVERIFIED_DIFF,
  },
  'rear-diff-oil': {
    parts: [
      { label: 'OE: Toyota gear oil (search; no matching listing found for this truck)', store: 'toyota', query: 'gear oil' },
    ],
    time: '20–30 min',
    steps: [
      'Raise and support the truck safely and place a drain pan under the rear differential.',
      'Remove the fill plug first, then the drain plug, and let it drain.',
      'Refit the drain plug, refill until fluid reaches the fill hole, then refit the fill plug.',
    ],
    tools: ['Drain pan', 'Socket wrench (plug sizes: unconfirmed)', 'Fluid pump', 'Torque wrench', 'Jack stands'],
    moreNotes: UNVERIFIED_DIFF,
  },
  'manual-trans-oil': { steps: SHOP_STEPS('manual transmission oil replacement.'), tools: [], moreNotes: 'Only applies to manual-transmission trucks.' },
  'trans-fluid': {
    steps: SHOP_STEPS('transmission fluid or oil replacement for this transmission.'),
    tools: [],
    parts: [
      { label: 'OE: World Standard ATF (00289-ATFWS), listed as fitting this truck', store: 'toyota', query: '00289-ATFWS' },
    ],
  },
  'atf': {
    steps: SHOP_STEPS('automatic transmission fluid replacement (heavy idling / low-speed duty only).'),
    tools: [],
    parts: [
      { label: 'OE: World Standard ATF (00289-ATFWS), listed as fitting this truck', store: 'toyota', query: '00289-ATFWS' },
    ],
  },
}
