import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button, Dialog, Input, Typography, YStack } from '@/ui'
import { useIdentity } from '../hooks/IdentityContext'

/** Opens on arrival from a password-reset link: the user is signed in and picks a new password here. */
export function NewPasswordDialog() {
  const { recoveringPassword, setNewPassword, cancelRecovery } = useIdentity()
  return (
    <Dialog
      open={recoveringPassword}
      onOpenChange={(open) => !open && cancelRecovery()}
      title="Set a new password"
      className="max-w-sm"
    >
      {/* Mounted only while open, so the field starts empty each time. */}
      {recoveringPassword && <NewPasswordForm onSave={setNewPassword} />}
    </Dialog>
  )
}

interface NewPasswordFormProps {
  onSave: (password: string) => Promise<void>
}

function NewPasswordForm({ onSave }: NewPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSave(password)
      toast.success('Password updated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <YStack gap={3}>
        <YStack gap={1.5}>
          <Typography as="label" variant="label" htmlFor="new-password">New password</Typography>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </YStack>
        {error && <Typography variant="small" color="danger" role="alert">{error}</Typography>}
        <Button type="submit" size="lg" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</Button>
      </YStack>
    </form>
  )
}
