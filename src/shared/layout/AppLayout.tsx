import { Outlet } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { OverallProgress, useChecklist } from '@/features/checklist'
import { SyncControl } from '@/features/identity'
import { Typography, XStack, YStack } from '@/ui'
import { ThemeToggle } from './ThemeToggle'

export function AppLayout() {
  const { vehicle } = useChecklist()
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <YStack gap={2} className="mx-auto max-w-3xl px-4 py-3">
          <XStack align="center" justify="between" gap={3}>
            <XStack align="center" gap={2} className="w-auto min-w-0">
              <Wrench className="size-5 shrink-0 text-primary" />
              <Typography as="h1" variant="heading" className="truncate">{vehicle.name}</Typography>
            </XStack>
            <XStack align="center" gap={2} className="w-auto shrink-0">
              <SyncControl />
              <ThemeToggle />
            </XStack>
          </XStack>
          <OverallProgress />
        </YStack>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  )
}
