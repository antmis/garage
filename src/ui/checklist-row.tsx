import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/ui/button"
import { Checkbox } from "@/ui/checkbox"
import { ListItem } from "@/ui/list-item"
import { Typography } from "@/ui/typography"

interface ChecklistRowProps {
  /** Row title; struck through and muted when checked. */
  title: React.ReactNode
  /** Short qualifier shown inline after the title, e.g. "Hawaii only". */
  note?: React.ReactNode
  /** Muted text right-aligned before the arrow, e.g. a time estimate. */
  aside?: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Called when the row body (not the checkbox) is pressed. */
  onOpen: () => void
  /** Accessible name for the checkbox; the visible title is not reachable from the checkbox itself. */
  checkLabel: string
  /** Accessible name for the row-body button. */
  openLabel: string
}

export function ChecklistRow({
  title, note, aside, checked, onCheckedChange, onOpen, checkLabel, openLabel,
}: ChecklistRowProps) {
  return (
    <ListItem className="gap-1 py-0 pl-4 pr-2">
      {/* The pseudo-element grows the hit area to ~44px without growing the visual box. */}
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        aria-label={checkLabel}
        className="relative size-5 rounded-full after:absolute after:-inset-3 after:content-['']"
      />
      <Button
        variant="ghost"
        aria-label={openLabel}
        onClick={onOpen}
        className="h-auto min-h-11 flex-1 justify-between gap-3 whitespace-normal rounded-md px-2 py-2 text-left font-normal"
      >
        <span className="min-w-0 flex-1">
          <Typography as="span" variant="body" className={cn(checked && "text-muted-foreground line-through")}>
            {title}
          </Typography>
          {note && <Typography as="span" variant="small"> · {note}</Typography>}
        </span>
        {aside && <Typography as="span" variant="small" numeric className="shrink-0">{aside}</Typography>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Button>
    </ListItem>
  )
}
