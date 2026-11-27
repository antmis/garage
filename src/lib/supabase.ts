import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Publishable key (sb_publishable_…) only. The secret key must never be in a VITE_* variable: Vite inlines those.
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** True when the env vars are missing; App renders a setup message instead of the garage. */
export const missingConfig = !url || !publishableKey

// `createClient` throws on an empty URL; the placeholder keeps imports safe while App shows the setup message.
export const supabase = createClient<Database>(url || 'http://missing-config.invalid', publishableKey || 'missing')

export type Supabase = typeof supabase
