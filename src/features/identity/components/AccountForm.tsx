import { useState, type FormEvent } from 'react'
import { Button, Input, Typography, YStack } from '@/ui'
import { EmailNotConfirmedError, useIdentity } from '../hooks/IdentityContext'

type Mode = 'signIn' | 'signUp' | 'reset'

interface AccountFormProps {
  /** Called once signed in, e.g. to close the dialog. */
  onSignedIn: () => void
}

/**
 * Signs in, creates an account, or requests a password reset. Creating an account or resetting emails a link; the form
 * stays open to say so.
 */
export function AccountForm({ onSignedIn }: AccountFormProps) {
  const { signIn, signUp, resendConfirmation, requestPasswordReset } = useIdentity()
  const [mode, setMode] = useState<Mode>('signUp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // Offer "resend" once we know the account is waiting on its confirmation email.
  const [canResend, setCanResend] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      if (err instanceof EmailNotConfirmedError) setCanResend(true)
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void run(async () => {
      if (mode === 'reset') {
        await requestPasswordReset(email)
        setNotice(`If ${email.trim()} has an account, we sent it a link to set a new password.`)
        return
      }
      if (mode === 'signIn') {
        await signIn(email, password)
        return onSignedIn()
      }
      if ((await signUp(email, password)) === 'signedIn') return onSignedIn()
      setMode('signIn')
      setPassword('')
      setCanResend(true)
      setNotice(`We sent a confirmation link to ${email.trim()}. Open it, then sign in here.`)
    })
  }

  const onResend = () =>
    void run(async () => {
      await resendConfirmation(email)
      setNotice(`Sent a new confirmation link to ${email.trim()}.`)
    })

  const switchTo = (next: Mode) => {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  return (
    <form onSubmit={onSubmit}>
      <YStack gap={4}>
        <Typography variant="muted">
          {mode === 'reset'
            ? 'Enter your account’s email and we’ll send you a link to set a new password.'
            : mode === 'signIn'
            ? 'Sign in to see your progress on any device. You can add anything checked on this device to your account.'
            : 'Right now your progress is saved on this device only. An account keeps it safe and syncs it to your other devices. We’ll email you a link to confirm.'}
        </Typography>
        <YStack gap={3}>
          <YStack gap={1.5}>
            <Typography as="label" variant="label" htmlFor="account-email">Email</Typography>
            <Input
              id="account-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setCanResend(false)
              }}
            />
          </YStack>
          {mode !== 'reset' && (
            <YStack gap={1.5}>
              <Typography as="label" variant="label" htmlFor="account-password">Password</Typography>
              <Input
                id="account-password"
                type="password"
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                minLength={mode === 'signUp' ? 8 : undefined}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </YStack>
          )}
        </YStack>
        {notice && <Typography variant="small" color="success" role="status">{notice}</Typography>}
        {error && <Typography variant="small" color="danger" role="alert">{error}</Typography>}
        <YStack gap={2}>
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'One moment…' : { signIn: 'Sign in', signUp: 'Create account', reset: 'Send reset link' }[mode]}
          </Button>
          {canResend && mode === 'signIn' && email.trim() && (
            <Button type="button" variant="outline" disabled={busy} onClick={onResend}>
              Resend confirmation email
            </Button>
          )}
          {mode === 'signIn' && (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => switchTo('reset')}>
              Forgot password?
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => switchTo(mode === 'signUp' ? 'signIn' : mode === 'reset' ? 'signIn' : 'signUp')}
          >
            {mode === 'signIn' ? 'New here? Create an account' : mode === 'reset' ? 'Back to sign in' : 'Have an account? Sign in'}
          </Button>
        </YStack>
      </YStack>
    </form>
  )
}
