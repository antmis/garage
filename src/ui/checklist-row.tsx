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
  /** Badges / short meta rendered under the title. */
  meta?: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Called when the row body (not the checkbox) is pressed. */
  onOpen: () => void
  /** Accessible name for the checkbox; the visible title is not reachable from the checkbox itself. */
  checkLabel: string
  /** Accessible name for the row-body button. */
  openLabel: string
}

export function ChecklistRow({ title, meta, checked, onCheckedChange, onOpen, checkLabel, openLabel }: ChecklistRowProps) {
  return (
    <ListItem size="lg" className="gap-2 px-4 py-2">
      {/* The pseudo-element grows the hit area to ~48px without growing the visual box. */}
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        aria-label={checkLabel}
        className="relative size-7 rounded-lg after:absolute after:-inset-3 after:content-['']"
      />
      <Button
        variant="ghost"
        aria-label={openLabel}
        onClick={onOpen}
        className="h-auto min-h-12 flex-1 justify-between gap-2 whitespace-normal rounded-lg px-2 py-2 text-left font-normal"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <Typography
            as="span"
            variant="label"
            className={cn("text-base leading-snug", checked && "text-muted-foreground line-through")}
          >
            {title}
          </Typography>
          {meta && <span className="flex flex-wrap items-center gap-1.5">{meta}</span>}
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </Button>
    </ListItem>
  )
}
