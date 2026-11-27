import type { MaintenanceItem, ServiceInterval, Vehicle } from '../types'
import { catalog, type TaskDef, type TaskSlug } from './catalog'
import { details } from './details'

// Source: 2024 Toyota Tacoma Warranty & Maintenance Guide, “Maintenance Log” (pp. 38–53).
// Every 5,000 miles / 6 months, 5k through 120k (the last interval the guide lists).
// The chart repeats in four shapes, built below; interval-specific extras are passed in.

type Slugs = readonly TaskSlug[]

/** `scheduled` and `inspect` are due for everyone; the rest only under that driving condition. */
type ItemGroup = 'scheduled' | 'inspect' | 'dusty' | 'towing' | 'idling'

function item(intervalId: string, group: ItemGroup, slug: TaskSlug): MaintenanceItem {
  const def: TaskDef = catalog[slug]
  const extra = details[slug]
  const id = group === 'scheduled' || group === 'inspect' ? `${intervalId}:${slug}` : `${intervalId}:${group}:${slug}`
  return {
    id,
    name: def.name,
    kind: def.kind,
    group,
    time: def.time ?? extra?.time,
    condition: def.condition,
    steps: extra?.steps ?? def.steps ?? [],
    tools: extra?.tools ?? def.tools ?? [],
    parts: extra?.parts ?? def.parts ?? [],
    videos: extra?.videos ?? def.videos ?? [],
    notes: [def.notes, extra?.moreNotes].filter(Boolean).join('\n') || undefined,
  }
}

interface Spec {
  miles: number
  scheduled: Slugs
  inspect?: Slugs
  /** Scheduled items that follow the inspect list on the chart (the chart splits them across two columns). */
  scheduledAfterInspect?: Slugs
  dusty: Slugs
  towing: Slugs
  idling?: Slugs
  notes?: string[]
}

function build(spec: Spec): ServiceInterval {
  const id = `${spec.miles / 1000}k`
  const group = (g: ItemGroup, slugs: Slugs = []) => slugs.map((s) => item(id, g, s))
  return {
    id,
    label: `${spec.miles.toLocaleString('en-US')} miles or ${(spec.miles / 5000) * 6} months`,
    miles: spec.miles,
    months: (spec.miles / 5000) * 6,
    notes: spec.notes,
    items: [
      ...group('scheduled', spec.scheduled),
      ...group('inspect', spec.inspect),
      ...group('scheduled', spec.scheduledAfterInspect),
      ...group('dusty', spec.dusty),
      ...group('towing', spec.towing),
      ...group('idling', spec.idling),
    ],
  }
}

const BASE = ['efi-additive', 'floor-mat', 'fluid-levels', 'wiper-blades'] as const satisfies Slugs

const OIL_NOTE = 'If the recommended oil was NOT used at the last oil change, replace engine oil and oil filter.'
const FILTER_NOTE = 'Driving in heavy traffic, on dirt roads or in urban, dusty or desert areas may shorten the life of the cabin air filter. Replacement may be needed if you notice reduced airflow from the A/C and heater, or if the windows fog easily in “Fresh” mode. Consult your dealer if any of these occur.'

const DUSTY_INSPECT = [
  'dusty-ball-joints', 'dusty-drive-shaft-boots', 'dusty-engine-air-filter', 'dusty-steering-linkage',
  'clutch-fork', 'propeller-shaft-bolt-salt', 'tighten-nuts-bolts',
] as const satisfies Slugs
const DUSTY_INSPECT_PLUS_OIL = [
  'dusty-ball-joints', 'dusty-drive-shaft-boots', 'dusty-engine-air-filter', 'dusty-steering-linkage',
  'clutch-fork', 'engine-oil-and-filter', 'propeller-shaft-bolt-salt', 'tighten-nuts-bolts',
] as const satisfies Slugs
const TOWING_LIGHT = ['propeller-shaft-bolt-salt', 'tighten-nuts-bolts'] as const satisfies Slugs

/** 5, 25, 35, 55, … : no scheduled oil change; oil is due only for dusty-road driving. */
function lightOdd(miles: number): ServiceInterval {
  return build({
    miles,
    scheduled: [...BASE, 'rotate-tires', 'brake-visual'],
    dusty: DUSTY_INSPECT_PLUS_OIL,
    towing: TOWING_LIGHT,
    // The 5k page has no “recommended oil” note; every later odd page does.
    notes: miles === 5000 ? undefined : [OIL_NOTE],
  })
}

/** 10, 20, 40, 50, … : scheduled oil change. */
function lightEven(miles: number, extra: { before?: Slugs; after?: Slugs } = {}): ServiceInterval {
  return build({
    miles,
    scheduled: [...BASE, ...(extra.before ?? []), 'engine-oil-and-filter', ...(extra.after ?? []), 'rotate-tires', 'brake-visual'],
    dusty: DUSTY_INSPECT,
    towing: TOWING_LIGHT,
  })
}

const INSPECT_FIRST = [
  'ball-joints', 'brake-lines-hoses', 'cabin-air-filter-inspect', 'drive-shaft-boots', 'engine-coolant-inspect', 'exhaust',
  'front-diff-oil-inspect', 'intercooler-coolant-inspect', 'radiator-condenser', 'rear-diff-oil-inspect', 'steering-gear',
  'steering-linkage-boots',
] as const satisfies Slugs

/** 15, 45, 75, 105: inspection pages. `belts` adds drive belts (initial inspection 60k, then every 15k). */
function inspectOdd(miles: number, belts: boolean): ServiceInterval {
  const inspect: TaskSlug[] = [...INSPECT_FIRST]
  if (belts) inspect.splice(inspect.indexOf('drive-shaft-boots'), 0, 'drive-belts')
  return build({
    miles,
    scheduled: BASE,
    inspect,
    scheduledAfterInspect: ['propeller-shaft-bolt', 'rotate-tires', 'brake-visual'],
    dusty: ['dusty-engine-air-filter', 'clutch-fork', 'engine-oil-and-filter', 'tighten-nuts-bolts'],
    towing: ['front-diff-oil', 'rear-diff-oil', 'tighten-nuts-bolts'],
    notes: [OIL_NOTE, FILTER_NOTE],
  })
}

const INSPECT_FULL = [
  'atf-cooler-hoses', 'ball-joints', 'brake-lines-hoses', 'brake-linings-pads', 'drive-shaft-boots', 'engine-coolant-inspect',
  'exhaust', 'front-diff-oil-inspect', 'fuel-lines', 'fuel-cap-gasket', 'intercooler-coolant-inspect', 'radiator-condenser',
  'rear-diff-oil-inspect', 'steering-gear', 'steering-linkage-boots', 'transfer-case-oil-inspect', 'transmission-leaks',
] as const satisfies Slugs

/** 30, 60, 90, 120: full inspection plus filters and oil. */
function inspectEven(
  miles: number,
  o: { belts?: boolean; plugs?: boolean; vacuum?: boolean; towingTrans: 'manual' | 'fluid'; idling?: boolean },
): ServiceInterval {
  const inspect: TaskSlug[] = [...INSPECT_FULL]
  if (o.belts) inspect.splice(inspect.indexOf('drive-shaft-boots'), 0, 'drive-belts')
  return build({
    miles,
    scheduled: [...BASE, ...(o.vacuum ? (['vacuum-pump'] as const) : [])],
    inspect,
    scheduledAfterInspect: [
      'cabin-air-filter', 'engine-air-filter', 'engine-oil-and-filter', ...(o.plugs ? (['spark-plugs'] as const) : []),
      'propeller-shaft-bolt', 'rotate-tires',
    ],
    dusty: ['clutch-fork', 'transfer-case-oil', 'tighten-nuts-bolts'],
    towing: [
      'front-diff-oil',
      ...(o.towingTrans === 'manual' ? (['manual-trans-oil'] as const) : []),
      'rear-diff-oil',
      'transfer-case-oil',
      ...(o.towingTrans === 'fluid' ? (['trans-fluid'] as const) : []),
      'tighten-nuts-bolts',
    ],
    idling: o.idling ? ['atf'] : undefined,
  })
}

export const intervals: ServiceInterval[] = [
  lightOdd(5000),
  lightEven(10000),
  inspectOdd(15000, false),
  lightEven(20000),
  lightOdd(25000),
  inspectEven(30000, { towingTrans: 'manual' }),
  lightOdd(35000),
  lightEven(40000, { after: ['spark-plugs'] }),
  inspectOdd(45000, false),
  lightEven(50000),
  lightOdd(55000),
  inspectEven(60000, { belts: true, towingTrans: 'fluid', idling: true }),
  lightOdd(65000),
  lightEven(70000),
  inspectOdd(75000, true),
  lightEven(80000, { after: ['spark-plugs'] }),
  lightOdd(85000),
  inspectEven(90000, { belts: true, towingTrans: 'manual' }),
  lightOdd(95000),
  lightEven(100000, { before: ['engine-coolant'], after: ['intercooler-coolant'] }),
  inspectOdd(105000, true),
  lightEven(110000),
  lightOdd(115000),
  inspectEven(120000, { belts: true, plugs: true, vacuum: true, towingTrans: 'fluid', idling: true }),
]

export const tacoma: Vehicle = {
  id: 'tacoma-2024',
  vehicleType: 'truck',
  make: 'Toyota',
  model: 'Tacoma',
  year: 2024,
  trim: 'TRD Off-Road',
  details: ['Double Cab, 5 ft bed', '2.4L turbo (non-hybrid), 4WD', 'Celestial Silver Metallic'],
  image: '/truck.png',
  schedule: {
    intervals,
    groups: [
      { id: 'scheduled', heading: 'Service' },
      { id: 'inspect', heading: 'Inspect the following' },
      { id: 'dusty', heading: 'If driving on dirt roads or dusty roads', conditional: true },
      { id: 'towing', heading: 'If driving while towing, using a car-top carrier, or heavy vehicle loading', conditional: true },
      {
        id: 'idling',
        heading: 'If extensive idling and/or low speed driving for a long distance such as police, taxi or door-to-door delivery use',
        conditional: true,
      },
    ],
    notes: [
      'Source: 2024 Toyota Warranty & Maintenance Guide. Service every 5,000 miles or 6 months, whichever comes first.',
      'Special-conditions items apply only if most of your driving is under that condition. Not all vehicles are designed for towing; see the Owner’s Manual.',
      'Heavy off-road use (deep sand, mud, water): the guide also calls for daily inspections of ball joints, brake lines, brake pads/discs, differential oil, drive shaft boots, engine air filter, chassis/body bolts, steering linkage, transfer case oil, transmission fluid, and lubricating the propeller shaft (4WD).',
    ],
  },
}
