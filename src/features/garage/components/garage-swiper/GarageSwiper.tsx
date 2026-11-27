import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { vehicleFullName, vehicleName, vehicleSubtitle, type Vehicle } from '@/data'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { cn } from '@/lib/utils'
import { Button } from '@/ui'
import { readLastVehicleId } from '../../utils/lastVehicle'
import { BACKDROP_PERIOD, GarageBackdrop } from './GarageBackdrop'
import { useSwipe } from './useSwipe'
import { VehicleSlide } from './VehicleSlide'
import './garage-swiper.css'

const ZOOM_MS = 500
/** Slots further than this from centre are not rendered; the nearer ones (and so their images) are. */
const RENDER_RANGE = 2

const mod = (a: number, n: number) => ((a % n) + n) % n

interface GarageSwiperProps {
  vehicles: readonly Vehicle[]
  /** The existing selection handler; fires once the zoom-in has played (at once under reduced motion). */
  onSelect: (vehicle: Vehicle) => void
}

/**
 * Full-screen garage scene: swipe, drag, arrow keys or the chevrons to change vehicle; tap or Enter to open it.
 * The track is a carousel without ends: `slot` is an unbounded integer and slot k shows vehicle k mod n, so
 * going past the last vehicle carries on to the first.
 */
export function GarageSwiper({ vehicles, onSelect }: GarageSwiperProps) {
  const count = vehicles.length
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const narrow = useMediaQuery('(max-width: 640px)')
  const [slot, setSlot] = useState(() => Math.max(0, vehicles.findIndex((v) => v.id === readLastVehicleId())))
  const [announcement, setAnnouncement] = useState('')
  const [selected, setSelected] = useState<Vehicle | null>(null)
  // Multiple of BACKDROP_PERIOD added to the parallax shift so it stays near zero however far the track spins.
  const [wrap, setWrap] = useState(0)
  const [rewrapping, setRewrapping] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const multiple = count > 1
  const index = count ? mod(slot, count) : 0

  const goTo = (next: number) => {
    setSlot(next)
    const i = mod(next, count)
    if (i !== index) setAnnouncement(`${vehicleFullName(vehicles[i])}, ${i + 1} of ${count}`)
  }

  const { pos, dragging, handlers, consumeDrag } = useSwipe({
    slot,
    onSettle: goTo,
    slideWidth: () => trackRef.current?.offsetWidth ?? 0,
    disabled: !multiple || selected !== null,
  })

  useEffect(() => {
    if (!selected) return
    const timer = setTimeout(() => onSelect(selected), reducedMotion ? 0 : ZOOM_MS)
    return () => clearTimeout(timer)
  }, [selected, reducedMotion, onSelect])

  // The re-wrap is committed with transitions off; they come back two frames later so the jump never animates.
  useEffect(() => {
    if (!rewrapping) return
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setRewrapping(false))
    })
    return () => cancelAnimationFrame(id)
  }, [rewrapping])

  const shift = reducedMotion ? 0 : -pos * (narrow ? 70 : 140) + wrap

  const onBackdropSettled = () => {
    if (dragging || Math.abs(shift) < BACKDROP_PERIOD) return
    setRewrapping(true)
    setWrap((w) => w - Math.trunc(shift / BACKDROP_PERIOD) * BACKDROP_PERIOD)
  }

  const select = () => {
    if (!selected && vehicles[index]) setSelected(vehicles[index])
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (selected) return
    if (e.key === 'ArrowLeft' && multiple) goTo(slot - 1)
    else if (e.key === 'ArrowRight' && multiple) goTo(slot + 1)
    else if (e.key === 'Home') goTo(slot - index)
    else if (e.key === 'End') goTo(slot - index + count - 1)
    else if (e.key === 'Enter' || e.key === ' ') select()
    else return
    e.preventDefault()
  }

  const current = vehicles[index]
  if (!current) return null
  const label = multiple
    ? `Open ${vehicleName(current)}. Swipe or use arrow keys to change vehicle.`
    : `Open ${vehicleName(current)}.`
  const slots: number[] = []
  for (let k = Math.ceil(pos - RENDER_RANGE); k <= Math.floor(pos + RENDER_RANGE); k++) {
    if (multiple || k === 0) slots.push(k)
  }

  return (
    <div
      className="gs-root"
      data-dragging={dragging || undefined}
      data-rewrapping={rewrapping || undefined}
      data-selecting={selected ? true : undefined}
      data-reduced-motion={reducedMotion || undefined}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        className="gs-stage"
        onClick={() => {
          if (!consumeDrag()) select()
        }}
        onKeyDown={onKeyDown}
        {...handlers}
      >
        <div className="gs-scene">
          <GarageBackdrop shift={shift} onSettled={onBackdropSettled} />
          <div ref={trackRef} className="gs-track" style={{ transform: `translate3d(${-pos * 100}%, 0, 0)` }}>
            {/* Keyed by slot: with two vehicles the same one can be on both sides at once. */}
            {slots.map((k) => (
              <VehicleSlide key={k} vehicle={vehicles[mod(k, count)]} index={k} offset={k - pos} flat={reducedMotion} />
            ))}
          </div>
        </div>
        <div className="gs-vignette" aria-hidden />
        <div className="gs-caption" aria-hidden>
          <p className="gs-name">{vehicleName(current)}</p>
          <p className="gs-trim">{vehicleSubtitle(current)}</p>
          {multiple && (
            <div className="gs-dots">
              {vehicles.map((v, i) => <span key={v.id} className={cn('gs-dot', i === index && 'is-active')} />)}
            </div>
          )}
        </div>
      </div>
      {/* Mouse shortcuts only: keyboard users already have the arrow keys on the stage. */}
      {multiple && (
        <>
          <Button
            variant="ghost"
            size="icon-lg"
            className="gs-chevron left-2 sm:left-6"
            aria-hidden
            tabIndex={-1}
            onClick={() => goTo(slot - 1)}
          >
            <ChevronLeft className="size-7" />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="gs-chevron right-2 sm:right-6"
            aria-hidden
            tabIndex={-1}
            onClick={() => goTo(slot + 1)}
          >
            <ChevronRight className="size-7" />
          </Button>
        </>
      )}
      <div className="sr-only" aria-live="polite">{announcement}</div>
    </div>
  )
}
