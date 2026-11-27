import type { MaintenanceItem, ServiceInterval, TaskDef, Vehicle } from '../types'
import { catalog, type TaskSlug } from './catalog'

// Source: Triumph “Scheduled Maintenance Check Sheet (all models with 6,000 mile (10,000 km) service
// intervals)”, issue 16, 01.2016. Each row is transcribed with the services whose column is unshaded.
// The sheet covers every model; rows limited to other models are left out (listed in the vehicle notes).

type Group =
  | 'lubrication' | 'fuel' | 'ignition' | 'cooling' | 'engine' | 'wheels'
  | 'steering' | 'brakes' | 'chain' | 'electrical' | 'general'

/** The sheet's five columns. The 6,000-mile column also covers 18,000. */
type Column = 'first' | 'annual' | '6k' | '12k' | '24k'

const ALL: readonly Column[] = ['first', 'annual', '6k', '12k', '24k']
const MAJOR: readonly Column[] = ['12k', '24k']

/** Sheet rows in sheet order: which group each task sits in and which services include it. */
const rows: readonly { group: Group; slug: TaskSlug; at: readonly Column[] }[] = [
  { group: 'lubrication', slug: 'engine-oil-cooler-leaks', at: ALL },
  { group: 'lubrication', slug: 'engine-oil', at: ALL },
  { group: 'lubrication', slug: 'oil-filter', at: ALL },

  { group: 'fuel', slug: 'autoscan', at: ALL },
  { group: 'fuel', slug: 'fuel-leaks', at: ALL },
  { group: 'fuel', slug: 'fuel-hoses-check', at: ALL },
  { group: 'fuel', slug: 'air-cleaner', at: MAJOR },
  { group: 'fuel', slug: 'fuel-filter', at: MAJOR },
  { group: 'fuel', slug: 'throttle-body-plate', at: ['6k', '12k', '24k'] },
  { group: 'fuel', slug: 'throttle-cables', at: ALL },
  { group: 'fuel', slug: 'secondary-air', at: MAJOR },
  { group: 'fuel', slug: 'exhaust-clamp-bolts', at: ALL },
  { group: 'fuel', slug: 'throttle-balance', at: ['6k', '12k', '24k'] },
  { group: 'fuel', slug: 'fuel-hoses-renew', at: ['annual'] },
  { group: 'fuel', slug: 'evap-hoses-renew', at: ['annual'] },

  { group: 'ignition', slug: 'spark-plugs-check', at: ['6k'] },
  { group: 'ignition', slug: 'spark-plugs-renew', at: MAJOR },

  { group: 'cooling', slug: 'cooling-leaks', at: ALL },
  { group: 'cooling', slug: 'coolant-hoses', at: ALL },
  { group: 'cooling', slug: 'coolant-level', at: ALL },
  { group: 'cooling', slug: 'coolant-renew', at: ['annual'] },

  { group: 'engine', slug: 'clutch-cable', at: ALL },
  { group: 'engine', slug: 'valve-clearances', at: MAJOR },

  { group: 'wheels', slug: 'wheels-damage', at: ALL },
  { group: 'wheels', slug: 'wheel-bearings', at: ALL },
  { group: 'wheels', slug: 'tire-wear', at: ALL },
  { group: 'wheels', slug: 'tire-pressures', at: ALL },

  { group: 'steering', slug: 'steering', at: ALL },
  { group: 'steering', slug: 'forks-check', at: ALL },
  { group: 'steering', slug: 'fork-oil', at: ['24k'] },
  { group: 'steering', slug: 'headstock-check', at: ['annual', '6k', '12k', '24k'] },
  { group: 'steering', slug: 'headstock-lube', at: MAJOR },
  { group: 'steering', slug: 'rear-suspension', at: MAJOR },

  { group: 'brakes', slug: 'brake-pads', at: ALL },
  { group: 'brakes', slug: 'brake-master-cylinders', at: ALL },
  { group: 'brakes', slug: 'brake-calipers', at: ALL },
  { group: 'brakes', slug: 'brake-fluid-levels', at: ALL },
  { group: 'brakes', slug: 'brake-fluid-renew', at: ['annual'] },

  { group: 'chain', slug: 'chain-slack', at: ALL },
  { group: 'chain', slug: 'chain-wear', at: ALL },
  { group: 'chain', slug: 'chain-lube', at: ALL },
  { group: 'chain', slug: 'chain-rubbing-strip', at: ALL },

  { group: 'electrical', slug: 'lights-electrics', at: ALL },

  { group: 'general', slug: 'bank-angle', at: ALL },
  { group: 'general', slug: 'fasteners', at: ALL },
  { group: 'general', slug: 'side-stand', at: ALL },
  { group: 'general', slug: 'service-bulletins', at: ALL },
  { group: 'general', slug: 'road-test', at: ALL },
  { group: 'general', slug: 'service-record', at: ALL },
]

function item(intervalId: string, group: Group, slug: TaskSlug): MaintenanceItem {
  const def: TaskDef = catalog[slug]
  return {
    id: `${intervalId}:${slug}`,
    name: def.name,
    kind: def.kind,
    group,
    time: def.time,
    condition: def.condition,
    steps: def.steps ?? [],
    tools: def.tools ?? [],
    parts: def.parts ?? [],
    videos: def.videos ?? [],
    notes: def.notes,
  }
}

function build(
  interval: Omit<ServiceInterval, 'items'>,
  column: Column,
): ServiceInterval {
  return {
    ...interval,
    items: rows.filter((r) => r.at.includes(column)).map((r) => item(interval.id, r.group, r.slug)),
  }
}

export const intervals: ServiceInterval[] = [
  build({ id: 'first', label: 'First service: 500 miles or 1 month', miles: 500, months: 1 }, 'first'),
  build(
    {
      id: 'annual',
      label: 'Annual service',
      months: 12,
      notes: ['Every year. The renewals marked with a year count are due once that many years have passed, regardless of mileage.'],
    },
    'annual',
  ),
  build({ id: '6k', label: '6,000 miles', miles: 6000 }, '6k'),
  build({ id: '12k', label: '12,000 miles', miles: 12000 }, '12k'),
  build({ id: '18k', label: '18,000 miles', miles: 18000 }, '6k'),
  build({ id: '24k', label: '24,000 miles', miles: 24000 }, '24k'),
]

export const streetTriple: Vehicle = {
  id: 'street-triple-675r',
  vehicleType: 'motorcycle',
  make: 'Triumph',
  model: 'Street Triple 675',
  year: 2016,
  trim: 'R',
  details: ['675 cc inline three', 'Liquid cooled, chain drive'],
  image: '/street-triple.webp',
  schedule: {
    intervals,
    groups: [
      { id: 'lubrication', heading: 'Lubrication' },
      { id: 'fuel', heading: 'Fuel system and engine management' },
      { id: 'ignition', heading: 'Ignition system' },
      { id: 'cooling', heading: 'Cooling system' },
      { id: 'engine', heading: 'Engine' },
      { id: 'wheels', heading: 'Wheels and tires' },
      { id: 'steering', heading: 'Steering and suspension' },
      { id: 'brakes', heading: 'Brakes' },
      { id: 'chain', heading: 'Drive chain' },
      { id: 'electrical', heading: 'Electrical' },
      { id: 'general', heading: 'General' },
    ] satisfies { id: Group; heading: string }[],
    notes: [
      'Source: Triumph Scheduled Maintenance Check Sheet for 6,000-mile service intervals (issue 16, January 2016). Each service is due at its distance or time, whichever comes first.',
      'Under severe operating conditions some items need more frequent servicing, and daily checks also apply; see the Owner’s Handbook.',
      'The sheet covers every Triumph model. Left out as not applying to this bike: throttle linkage (Tiger 800), exhaust butterfly valve cables and actuator (Daytona 675, Thunderbird), idle CO (carburettor and open-loop EFI), spoke checks (wire wheels), rear wheel bearing lubrication (single-sided swingarm), drive belt and drive flange items, rubbing strip renewal (Tiger 800), accessory rack and pannier checks, and centre stand sleeves.',
    ],
  },
}
