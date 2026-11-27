import { useRef, useState, type PointerEvent } from 'react'

const TAP_SLOP = 6
const FLICK = 60

interface SwipeOptions {
  /** Settled position, in slides. Unbounded: the carousel has no ends. */
  slot: number
  /** Called on release with the slot to settle on. */
  onSettle: (slot: number) => void
  /** Pixel width of one slide, read when a drag starts: a drag that long moves one slide. */
  slideWidth: () => number
  disabled?: boolean
}

interface Drag {
  pointerId: number
  startX: number
  slidePx: number
  moved: boolean
  pos: number
}

/**
 * Pointer-driven track position, in slides. `pos` is fractional while dragging and equals `slot` at rest.
 * A press that moves under TAP_SLOP is left to the element's click handler; `consumeDrag` tells that handler
 * to ignore the click a drag ends with (pointer capture makes the browser still fire one).
 */
export function useSwipe({ slot, onSettle, slideWidth, disabled = false }: SwipeOptions) {
  const [dragPos, setDragPos] = useState<number | null>(null)
  const drag = useRef<Drag | null>(null)
  const dragged = useRef(false)
  const frame = useRef(0)

  const end = () => {
    cancelAnimationFrame(frame.current)
    drag.current = null
    setDragPos(null)
  }

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      dragged.current = false
      if (disabled || !e.isPrimary || e.button !== 0) return
      e.currentTarget.setPointerCapture(e.pointerId)
      drag.current = { pointerId: e.pointerId, startX: e.clientX, slidePx: slideWidth() || 1, moved: false, pos: slot }
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = drag.current
      if (!d || e.pointerId !== d.pointerId) return
      const dx = e.clientX - d.startX
      if (!d.moved && Math.abs(dx) < TAP_SLOP) return
      d.moved = true
      d.pos = slot - dx / d.slidePx
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => setDragPos(d.pos))
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const d = drag.current
      if (!d || e.pointerId !== d.pointerId) return
      end()
      if (!d.moved) return
      dragged.current = true
      const dx = e.clientX - d.startX
      let target = Math.round(d.pos)
      if (target === slot && Math.abs(dx) >= FLICK) target = slot + (dx < 0 ? 1 : -1)
      onSettle(target)
    },
    onPointerCancel: end,
  }

  const consumeDrag = () => {
    const was = dragged.current
    dragged.current = false
    return was
  }

  return { pos: dragPos ?? slot, dragging: dragPos !== null, handlers, consumeDrag }
}
