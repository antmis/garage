import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import garageLogo from '@/assets/garage-logo.svg'
import { IntervalNav, OverallProgress, SyncStatus, useChecklist, vehiclePath } from '@/features/checklist'
import { VehicleSwitcher } from '@/features/garage'
import { useStickyOffset } from '@/lib/useStickyOffset'
import { Button, ScrollArea, Sheet, XStack, YStack } from '@/ui'
import { ThemeToggle } from './ThemeToggle'

interface IntervalLayoutProps {
  /** Interval shown in the main area; drives the menu selection. */
  currentId: string
  children: ReactNode
}

/** Back link, brand, vehicle switcher, overall count, interval menu and actions. */
function IntervalSidebar({ currentId }: Pick<IntervalLayoutProps, 'currentId'>) {
  const { vehicle } = useChecklist()
  return (
    <div className="flex h-full flex-col">
      <YStack gap={1} className="border-b px-3 py-3">
        <XStack align="center" gap={2}>
          <Button asChild variant="ghost" size="icon">
            <Link to={vehiclePath(vehicle.id)} aria-label="All intervals"><ChevronLeft /></Link>
          </Button>
          <img src={garageLogo} alt="Garage" className="size-7 shrink-0" />
          <VehicleSwitcher vehicle={vehicle} compact />
        </XStack>
        <div className="px-1"><OverallProgress compact /></div>
      </YStack>
      <ScrollArea className="min-h-0 flex-1">
        <IntervalNav currentId={currentId} />
      </ScrollArea>
      <XStack justify="end" align="center" gap={1} className="border-t px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <SyncStatus />
        <ThemeToggle />
      </XStack>
    </div>
  )
}

/**
 * Interval pages: the sidebar is persistent on large screens and opens as a sheet from the top bar
 * below that. Rendered by the page at the same tree position for every interval, so it stays
 * mounted when switching.
 */
export function IntervalLayout({ currentId, children }: IntervalLayoutProps) {
  const { vehicle } = useChecklist()
  // Keyed to the interval it was opened on, so picking another interval closes it.
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null)
  // The mobile top bar; hidden (height 0) on desktop, where sticky content sits at the very top.
  const headerRef = useRef<HTMLElement>(null)
  useStickyOffset(headerRef)

  // Window scroll carries over between intervals otherwise.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentId])

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r bg-muted/30 lg:block">
        <IntervalSidebar currentId={currentId} />
      </aside>

      <div className="min-w-0">
        <header ref={headerRef} className="sticky top-0 z-40 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
          <XStack align="center" justify="between" gap={3} className="px-2 py-2">
            <XStack align="center" gap={2} className="w-auto min-w-0">
              <Button variant="ghost" size="icon-lg" aria-label="Show intervals" onClick={() => setMenuOpenFor(currentId)}>
                <Menu />
              </Button>
              <img src={garageLogo} alt="Garage" className="size-7 shrink-0" />
              <VehicleSwitcher vehicle={vehicle} compact />
            </XStack>
            <div className="pr-2"><OverallProgress compact /></div>
          </XStack>
        </header>
        <Sheet
          open={menuOpenFor === currentId}
          onOpenChange={(open) => setMenuOpenFor(open ? currentId : null)}
          side="left"
          title="Intervals"
          hideHeader
          bodyClassName="p-0"
        >
          <IntervalSidebar currentId={currentId} />
        </Sheet>
        <main className="mx-auto max-w-3xl px-4 py-5 pb-[max(2rem,env(safe-area-inset-bottom))] lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
