import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/ui'

const NEXT = { light: 'dark', dark: 'system', system: 'light' } as const
const LABEL = { light: 'Light', dark: 'Dark', system: 'System' } as const

export function ThemeToggle() {
  const { theme = 'system', setTheme } = useTheme()
  const current = (theme in NEXT ? theme : 'system') as keyof typeof NEXT
  const Icon = current === 'light' ? Sun : current === 'dark' ? Moon : Monitor
  return (
    <Button
      variant="outline"
      size="icon-lg"
      aria-label={`Theme: ${LABEL[current]}. Switch to ${LABEL[NEXT[current]]}`}
      onClick={() => setTheme(NEXT[current])}
    >
      <Icon />
    </Button>
  )
}
