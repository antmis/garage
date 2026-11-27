import type { TransitionEvent } from 'react'

/**
 * Every panning layer (ribs 110px, lights 440px, floor tiles 220px) repeats every this many px, so shifting
 * the backdrop by a multiple of it is invisible. That is what lets the endless carousel keep the shift bounded.
 */
export const BACKDROP_PERIOD = 440

interface GarageBackdropProps {
  /** Horizontal parallax shift, in px. */
  shift: number
  /** The pan transition finished: the caller may now re-wrap the shift. */
  onSettled: () => void
}

/** The garage scene, all CSS. Ribs, lights and floor tiles pan; the wall shading, glow and haze stay put. */
export function GarageBackdrop({ shift, onSettled }: GarageBackdropProps) {
  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && e.propertyName === 'transform') onSettled()
  }
  return (
    <div className="gs-backdrop" aria-hidden>
      <div className="gs-wall" />
      <div className="gs-pan" style={{ transform: `translate3d(${shift}px, 0, 0)` }} onTransitionEnd={onTransitionEnd}>
        <div className="gs-wall-ribs" />
        <div className="gs-lights" />
      </div>
      <div className="gs-glow" />
      <div className="gs-floor">
        <div className="gs-floor-plane" style={{ transform: `rotateX(68deg) translate3d(${shift}px, 0, 0)` }} />
        <div className="gs-floor-glow" />
      </div>
      <div className="gs-haze" />
    </div>
  )
}
