export type ItemKind = 'diy' | 'shop' | 'inspect'

/**
 * Where an item sits on the guide's chart. `scheduled` and `inspect` are due for everyone;
 * the rest only apply when the vehicle is driven primarily under that condition, so
 * they are shown but never counted toward interval progress.
 */
export type ItemGroup = 'scheduled' | 'inspect' | 'dusty' | 'towing' | 'idling'

export type PartStore = 'amazon' | 'autozone'

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
  /** e.g. "30k" */
  id: string
  label: string
  miles: number
  months?: number
  /** Interval-wide notes from the guide (not tied to one item). */
  notes?: string[]
  items: MaintenanceItem[]
}

export interface Vehicle {
  id: 'tacoma-2024'
  name: string
  intervals: ServiceInterval[]
  /** Heading text for each conditional group, verbatim from the guide. */
  conditionHeadings: Record<Exclude<ItemGroup, 'scheduled' | 'inspect'>, string>
  /** Guide-wide notes shown above the list. */
  notes: string[]
}
