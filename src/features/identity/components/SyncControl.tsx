import { useState } from 'react'
import { Cloud, CloudOff } from 'lucide-react'
import { Button, Dialog, Input, Typography, XStack, YStack } from '@/ui'
import { useIdentity } from '../hooks/IdentityContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SyncControl() {
  const { email, setEmail, clearEmail, syncAvailable } = useIdentity()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const active = email !== null && syncAvailable
  const valid = EMAIL_RE.test(draft.trim())

  function handleOpenChange(next: boolean) {
    if (next) setDraft(email ?? '')
    setOpen(next)
  }

  function save() {
    if (!valid) return
    setEmail(draft)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Sync progress"
      description="Type an email to keep your checklist in sync across devices."
      className="max-w-md"
      trigger={
        <Button variant={active ? 'secondary' : 'outline'} size="icon-lg" aria-label={active ? `Sync on: ${email}` : 'Set up sync'}>
          {active ? <Cloud /> : <CloudOff />}
        </Button>
      }
      footer={
        <XStack gap={2} className="justify-end">
          {email && (
            <Button variant="outline" onClick={() => { clearEmail(); setOpen(false) }}>
              Stop syncing
            </Button>
          )}
          {syncAvailable && <Button onClick={save} disabled={!valid}>Save</Button>}
        </XStack>
      }
    >
      <YStack gap={3}>
        {syncAvailable ? (
          <YStack gap={1.5}>
            <Typography as="label" variant="label" htmlFor="sync-email">Email</Typography>
            <Input
              id="sync-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save() }}
            />
          </YStack>
        ) : (
          <Typography variant="muted">
            Cloud sync isn’t configured (no Supabase env vars), so progress is saved on this device only.
          </Typography>
        )}
        {/* TEMPORARY: replace with real Supabase Auth (owner_email → auth.uid()). */}
        <Typography variant="small" color="warning">
          Temporary: this email isn’t verified. Anyone who types it can read and change this checklist.
        </Typography>
        <Typography variant="small">
          Your progress always stays on this device too. Stopping sync keeps it.
        </Typography>
      </YStack>
    </Dialog>
  )
}
