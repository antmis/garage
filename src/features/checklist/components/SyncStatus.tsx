import { useState, useSyncExternalStore } from 'react'
import { onlineManager, useIsMutating, useMutationState } from '@tanstack/react-query'
import { Cloud, CloudOff, LoaderCircle, LogIn, LogOut, Smartphone } from 'lucide-react'
import { AccountDialog, useIdentity } from '@/features/identity'
import {
  Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger, Typography,
} from '@/ui'

type Indicator = 'device' | 'saving' | 'saved' | 'offline'

const LABEL: Record<Indicator, string> = { device: 'On this device', saving: 'Saving', saved: 'Saved', offline: 'Offline' }
const ICON = { device: Smartphone, saving: LoaderCircle, saved: Cloud, offline: CloudOff } as const

function useOnline() {
  return useSyncExternalStore(onlineManager.subscribe.bind(onlineManager), () => onlineManager.isOnline())
}

/** Quiet indicator of where progress is saved; its menu signs in (to save to an account) or out. */
export function SyncStatus() {
  const { status, email, signOut } = useIdentity()
  const online = useOnline()
  const writing = useIsMutating()
  const waiting = useMutationState({ filters: { status: 'pending' }, select: (m) => m.state.isPaused }).filter(Boolean).length
  const [accountOpen, setAccountOpen] = useState(false)

  if (status === 'loading') return null
  const guest = status === 'signedOut'
  const indicator: Indicator = guest ? 'device' : !online || waiting > 0 ? 'offline' : writing > 0 ? 'saving' : 'saved'
  const Icon = ICON[indicator]
  const detail = guest
    ? 'Progress is saved on this device only.'
    : waiting > 0 ? `${waiting} ${waiting === 1 ? 'change' : 'changes'} waiting to sync` : LABEL[indicator]

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground" aria-label={`${detail} Account`}>
            <Icon className={indicator === 'saving' ? 'animate-spin' : undefined} />
            <span className="hidden sm:inline">{LABEL[indicator]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            {email && <Typography as="span" variant="small" className="block truncate">{email}</Typography>}
            <Typography as="span" variant="caption" className="block whitespace-normal">{detail}</Typography>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {guest ? (
            <DropdownMenuItem onSelect={() => setAccountOpen(true)}>
              <LogIn />
              Save to an account
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => void signOut()}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  )
}
