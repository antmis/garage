import { Button, XStack } from '@/ui'
import type { ItemFilter } from '../types'

const OPTIONS: { value: ItemFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'done', label: 'Done' },
]

interface FilterChipsProps {
  value: ItemFilter
  onChange: (value: ItemFilter) => void
}

export function FilterChips({ value, onChange }: FilterChipsProps) {
  return (
    <XStack gap={2} role="group" aria-label="Filter items">
      {OPTIONS.map((o) => (
        <Button
          key={o.value}
          variant={value === o.value ? 'default' : 'outline'}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className="rounded-full"
        >
          {o.label}
        </Button>
      ))}
    </XStack>
  )
}
