import { Progress as ProgressPrimitive } from "@/ui/primitives/progress"
import { cn } from "@/lib/utils"

interface ProgressProps {
  /** 0–100 */
  value: number
  /** Accessible name; the bar has no visible text of its own. */
  label: string
  className?: string
}

export function Progress({ value, label, className }: ProgressProps) {
  return <ProgressPrimitive value={value} aria-label={label} className={cn("h-2", className)} />
}
