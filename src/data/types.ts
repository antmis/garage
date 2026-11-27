export type ItemKind = 'diy' | 'shop' | 'inspect'

/** Id of one of the schedule's `groups`; each vehicle defines its own. */
export type ItemGroup = string

export interface GroupDef {
  id: ItemGroup
  /** Section heading on the interval page. */
  heading: string
  /** Only applies under a driving condition: shown and checkable, never counted toward progress. */
  conditional?: boolean
}

export type PartStore = 'toyota' | 'amazon' | 'autozone'

export type PartLink =
  | { label: string; url: string }
  /** Resolved to a store search URL by `resolvePartUrl`. */
  | { label: string; store: PartStore; query: string }

export interface VideoLink {
  title: string
  /** 11-character YouTube id. Either this or `url`. */
  youtubeId?: string
  url?: string
  note?: string
}

/**
 * One task's how-to content, written once per vehicle catalog and shared by every interval that lists it.
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

export interface MaintenanceItem {
  /**
   * Stable and never renamed once shipped: saved progress is keyed on it.
   * `<interval>:<slug>` for scheduled/inspect, `<interval>:<group>:<slug>` for conditional groups.
   */
  id: string
  name: string
  kind: ItemKind
  group: ItemGroup
  time?: string
  /** Extra qualifier from the guide, e.g. "Hawaii only". Items with a condition are never counted toward progress. */
  condition?: string
  steps: string[]
  tools: string[]
  parts: PartLink[]
  videos: VideoLink[]
  notes?: string
}

export interface ServiceInterval {
  /** e.g. "30k". Permanent: it prefixes every item id in the interval. */
  id: string
  label: string
  /** Absent for time-only services (e.g. an annual service); the URL then uses `id`. */
  miles?: number
  months?: number
  /** Interval-wide notes from the guide (not tied to one item). */
  notes?: string[]
  items: MaintenanceItem[]
}

export interface Schedule {
  intervals: ServiceInterval[]
  /** Every group the intervals use, in display order. */
  groups: GroupDef[]
  /** Schedule-wide notes shown above the interval table. */
  notes: string[]
}

/**
 * Permanent: saved progress (localStorage key, Supabase `vehicle_id`) and URLs key off it.
 * Must not collide with a top-level route segment ("garage", "interval").
 */
export type VehicleId = 'tacoma-2024' | 'street-triple-675r'

export interface Vehicle {
  id: VehicleId
  /** Manufacturer, e.g. "Toyota". */
  make: string
  /** e.g. "Tacoma". */
  model: string
  /** Model year. */
  year: number
  /** Stored as `vehicles.vehicle_type`. */
  vehicleType: 'car' | 'truck' | 'motorcycle' | 'other'
  /** e.g. "TRD Off-Road". */
  trim: string
  /** Short spec lines shown on the vehicle card. */
  details: string[]
  /** Photo or logo, served from /public. */
  image: string
  /** Absent until the schedule is written; the vehicle still lists, with a "coming soon" state. */
  schedule?: Schedule
}
