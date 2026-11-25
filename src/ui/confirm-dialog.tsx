import { Button } from '@/ui/button'
import { Dialog } from '@/ui/dialog'
import { XStack } from '@/ui/stack'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description?: string
  /** Label of the destructive action button. */
  confirmLabel: string
}

export function ConfirmDialog({ open, onOpenChange, onConfirm, title, description, confirmLabel }: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description ?? 'This action cannot be undone.'}
      className="max-w-sm"
      footer={
        <XStack gap={2} className="justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false) }}>{confirmLabel}</Button>
        </XStack>
      }
    />
  )
}
