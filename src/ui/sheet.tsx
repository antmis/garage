import * as React from "react"
import {
  Sheet as SheetPrimitive,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/ui/primitives/sheet"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Sheet heading */
  title: React.ReactNode
  /** Optional subtext beneath the title */
  description?: React.ReactNode
  /** Edge the sheet slides from. Pick per breakpoint at the call site (bottom on mobile, right on desktop). */
  side?: "bottom" | "right" | "left"
  /** Keep the title for screen readers only and drop the header, for content that brings its own. */
  hideHeader?: boolean
  /** Sheet body; scrolls independently of the header. */
  children?: React.ReactNode
  /** className forwarded to the scrolling body */
  bodyClassName?: string
}

export function Sheet({
  open, onOpenChange, title, description, side = "right", hideHeader = false, children, bodyClassName,
}: SheetProps) {
  return (
    <SheetPrimitive open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} {...(description ? {} : { "aria-describedby": undefined })}>
        {hideHeader ? (
          <SheetTitle className="sr-only">{title}</SheetTitle>
        ) : (
          <div className="shrink-0 space-y-1 px-5 pb-3 pt-5 pr-14">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </div>
        )}
        <div className={cn("flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]", bodyClassName)}>
          {children}
        </div>
      </SheetContent>
    </SheetPrimitive>
  )
}
