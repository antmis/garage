import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isAuthError, type Session } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { queryClient } from '@/lib/api/queryClient'
import { supabase } from '@/lib/supabase'
import { EmailNotConfirmedError, IdentityContext, type SignUpResult } from '../hooks/IdentityContext'

interface IdentityProviderProps {
  children: ReactNode
}

/** Auth errors in words a person can act on; anything unexpected keeps Supabase's own message. */
function friendly(error: unknown): Error {
  if (!isAuthError(error)) return error instanceof Error ? error : new Error('Something went wrong')
  switch (error.code) {
    case 'invalid_credentials':
      return new Error('Wrong email or password.')
    case 'user_already_exists':
    case 'email_exists':
      return new Error('There’s already an account with this email. Sign in instead.')
    case 'weak_password':
      return new Error(error.message)
    case 'email_not_confirmed':
      return new EmailNotConfirmedError()
    case 'same_password':
      return new Error('That’s your current password. Choose a new one.')
    case 'over_email_send_rate_limit':
      return new Error('Too many emails sent just now. Try again in a little while.')
    default:
      return new Error(error.message || 'Couldn’t reach the server. Check your connection.')
  }
}

/**
 * A confirmation link that failed (expired, already used) comes back with the reason in the URL hash rather than a
 * session. Read once at load and tidy the URL so a reload doesn't repeat it.
 */
function readLinkError(): string | null {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const description = params.get('error_description')
  if (!description) return null
  history.replaceState(null, '', window.location.pathname + window.location.search)
  return params.get('error_code') === 'otp_expired'
    ? 'That email link has expired or was already used. Request a new one from the account menu.'
    : description
}

const linkError = readLinkError()

/**
 * Where emailed links land: this app's own origin, so they work for localhost and the deployed site alike. Supabase
 * only honors it when it's in Auth > URL Configuration > Redirect URLs; otherwise links fall back to the Site URL.
 */
const redirectTo = () => window.location.origin

/**
 * Optional accounts: signed out, the app saves progress on the device; signing in moves it to the account.
 * Email and password with email confirmation (Supabase "Confirm email" on). The confirmation link comes back with
 * the session in the URL hash, which supabase-js picks up (implicit flow, so the link works on any device). The
 * session is persisted, so a signed-in device opens straight into the app, offline included. The session drives
 * UI only; RLS enforces access.
 */
export function IdentityProvider({ children }: IdentityProviderProps) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [recoveringPassword, setRecoveringPassword] = useState(false)

  useEffect(() => {
    // Deferred: the Toaster mounts after this provider's first effects and would miss an immediate toast.
    if (linkError) setTimeout(() => toast.error(linkError), 0)
  }, [])

  useEffect(() => {
    // Fires INITIAL_SESSION first, then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED. A refresh token that can no longer
    // be used arrives as SIGNED_OUT, which falls back to device progress instead of a broken app.
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      // A reset link signs the user in and then fires this; they still need to choose the new password.
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true)
      if (event === 'SIGNED_OUT') setRecoveringPassword(false)
      // The saved session is trusted locally, so a user deleted on the server would otherwise stay "signed in" with
      // every write failing. Ask the server once; sign out only on a definite auth rejection, never when offline.
      // Deferred because Supabase calls made inside this callback can deadlock the auth lock.
      if (event === 'INITIAL_SESSION' && next) {
        setTimeout(() => {
          void supabase.auth.getUser().then(({ error }) => {
            if (error && isAuthError(error) && error.status && error.status >= 400 && error.status < 500) {
              void supabase.auth.signOut({ scope: 'local' }).then(() => queryClient.clear())
            }
          })
        }, 0)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) throw friendly(error)
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: redirectTo() },
    })
    if (error) throw friendly(error)
    if (data.session) return 'signedIn' // confirmations off (e.g. a project configured without them)
    // With confirmations on, an already-registered email gets a placeholder user with no identities, not an error.
    if (data.user?.identities?.length === 0) throw new Error('There’s already an account with this email. Sign in instead.')
    return 'checkEmail'
  }, [])

  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo() },
    })
    if (error) throw friendly(error)
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: redirectTo() })
    if (error) throw friendly(error)
  }, [])

  const setNewPassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw friendly(error)
    setRecoveringPassword(false)
  }, [])

  const cancelRecovery = useCallback(() => setRecoveringPassword(false), [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }, [])

  const value = useMemo(
    () => ({
      status: session === undefined ? ('loading' as const) : session ? ('signedIn' as const) : ('signedOut' as const),
      userId: session?.user.id ?? null,
      email: session?.user.email ?? null,
      signIn,
      signUp,
      resendConfirmation,
      requestPasswordReset,
      recoveringPassword,
      setNewPassword,
      cancelRecovery,
      signOut,
    }),
    [session, signIn, signUp, resendConfirmation, requestPasswordReset, recoveringPassword, setNewPassword, cancelRecovery, signOut],
  )
  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
}
