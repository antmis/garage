import { Typography } from '@/ui/typography'

interface EmptyStateProps {
  /** Defaults to the app's standard “nothing yet” copy. */
  message?: string
}

export function EmptyState({ message = 'Nothing added yet' }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed px-4 py-8 text-center">
      <Typography variant="muted">{message}</Typography>
    </div>
  )
}
