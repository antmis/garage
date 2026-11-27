/** localStorage can throw (private mode, quota, disabled storage); the app must keep working without it. */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Storage unavailable: progress lives in memory for this session only.
  }
}

// Keys from before progress moved to Supabase. Safe to delete: nothing reads them any more.
const LEGACY_PREFIXES = ['garage:progress:', 'garage:synced:', 'garage:imported:', 'garage:email']

/** One-time tidy of this device's pre-Supabase storage. */
export function removeLegacyStorage(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (LEGACY_PREFIXES.some((p) => key.startsWith(p))) localStorage.removeItem(key)
    }
  } catch {
    // Storage unavailable: nothing to tidy.
  }
}
