import { createContext, useContext } from 'react'

/** loading: restoring the saved session. signedOut: progress is saved on this device. signedIn: in the account. */
export type AuthStatus = 'loading' | 'signedOut' | 'signedIn'

/** `checkEmail`: the account exists but stays unusable until the emailed link is clicked. */
export type SignUpResult = 'signedIn' | 'checkEmail'

/** Signing in before confirming. Its own type so the form can offer to resend the email. */
export class EmailNotConfirmedError extends Error {
  constructor() {
    super('Confirm your email first. Check your inbox for the link.')
  }
}

export interface IdentityState {
  status: AuthStatus
  /** auth.uid() of the signed-in user. */
  userId: string | null
  email: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  resendConfirmation: (email: string) => Promise<void>
  /** Emails a reset link. Resolves the same whether or not the email has an account, so it can't be probed. */
  requestPasswordReset: (email: string) => Promise<void>
  /** True after arriving from a reset link (signed in, but the new password isn't set yet). */
  recoveringPassword: boolean
  /** Sets the signed-in user's password and ends recovery. */
  setNewPassword: (password: string) => Promise<void>
  /** Leaves recovery without changing the password; the user stays signed in. */
  cancelRecovery: () => void
  /** Ends the session and clears this device's cache. */
  signOut: () => Promise<void>
}

export const IdentityContext = createContext<IdentityState | null>(null)

export function useIdentity(): IdentityState {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider')
  return ctx
}
