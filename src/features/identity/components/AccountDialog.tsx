import { Dialog } from '@/ui'
import { AccountForm } from './AccountForm'

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Optional account: the app works without one, saving to this device. */
export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Save your progress">
      {/* Mounted only while open, so each opening starts with a clean form. */}
      {open && <AccountForm onSignedIn={() => onOpenChange(false)} />}
    </Dialog>
  )
}
