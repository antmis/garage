import { createContext, useContext } from 'react'

export interface IdentityState {
  /** Normalised (trimmed, lower-cased) email, or null when the user hasn't set one. */
  email: string | null
  setEmail: (email: string) => void
  clearEmail: () => void
  /** False when the Supabase env vars are missing; an email is then stored but nothing syncs. */
  syncAvailable: boolean
}

export const IdentityContext = createContext<IdentityState | null>(null)

export function useIdentity(): IdentityState {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider')
  return ctx
}
