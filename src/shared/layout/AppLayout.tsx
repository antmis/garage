import { useRef, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import garageLogo from '@/assets/garage-logo.svg'
import { OverallProgress, SyncStatus, useChecklist } from '@/features/checklist'
import { VehicleSwitcher } from '@/features/garage'
import { useStickyOffset } from '@/lib/useStickyOffset'
import { XStack, YStack } from '@/ui'
import { ThemeToggle } from './ThemeToggle'

interface AppLayoutProps {
  /** Header title, beside the logo. */
  title: ReactNode
  /** Full-width row under the title, e.g. overall progress. */
  subheader?: ReactNode
}

/** Sticky header over a single column; the routed page renders in the column. */
export function AppLayout({ title, subheader }: AppLayoutProps) {
  const headerRef = useRef<HTMLElement>(null)
  useStickyOffset(headerRef)
  return (
    <div className="min-h-dvh">
      <header ref={headerRef} className="sticky top-0 z-40 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <YStack gap={2} className="mx-auto max-w-3xl px-4 py-3">
          <XStack align="center" justify="between" gap={3}>
            <XStack align="center" gap={2} className="w-auto min-w-0">
              <img src={garageLogo} alt="Garage" className="size-8 shrink-0" />
              {title}
            </XStack>
            <XStack align="center" gap={1} className="w-auto shrink-0">
              <SyncStatus />
              <ThemeToggle />
            </XStack>
          </XStack>
          {subheader}
        </YStack>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  )
}

/** A vehicle's home: the switcher as the title and its overall progress below. */
export function VehicleLayout() {
  const { vehicle } = useChecklist()
  return <AppLayout title={<VehicleSwitcher vehicle={vehicle} />} subheader={<OverallProgress />} />
}
