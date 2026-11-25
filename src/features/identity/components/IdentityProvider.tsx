import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { readStorage, writeStorage } from '@/lib/storage'
import { IdentityContext } from '../hooks/IdentityContext'

const EMAIL_KEY = 'garage:email'

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [email, setEmailState] = useState<string | null>(() => readStorage(EMAIL_KEY))

  const setEmail = useCallback((value: string) => {
    const normalised = value.trim().toLowerCase()
    writeStorage(EMAIL_KEY, normalised)
    setEmailState(normalised)
  }, [])

  const clearEmail = useCallback(() => {
    writeStorage(EMAIL_KEY, null)
    setEmailState(null)
  }, [])

  const value = useMemo(
    () => ({ email, setEmail, clearEmail, syncAvailable: isSupabaseConfigured }),
    [email, setEmail, clearEmail],
  )
  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
}
