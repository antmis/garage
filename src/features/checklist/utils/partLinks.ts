import type { PartLink, PartStore } from '@/data'

const STORE_SEARCH: Record<PartStore, (q: string) => string> = {
  // Searching a Toyota part number lands on that part; vehicle fitment is the user's own (set on the site).
  toyota: (q) => `https://autoparts.toyota.com/search?search_query=${encodeURIComponent(q)}`,
  amazon: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
  autozone: (q) => `https://www.autozone.com/searchresult?searchText=${encodeURIComponent(q)}`,
}

export function resolvePartUrl(part: PartLink): string {
  return 'url' in part ? part.url : STORE_SEARCH[part.store](part.query)
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}
