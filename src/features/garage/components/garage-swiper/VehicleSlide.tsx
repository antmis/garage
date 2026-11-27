import { Bike, Car } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import type { Vehicle } from '@/data'
import { swiperImage } from './vehicleImages'

interface VehicleSlideProps {
  vehicle: Vehicle
  /** Slot in the track; the slide sits at `index × 100%` of the slide width. */
  index: number
  /** Signed distance from centre, in slides. Drives scale, fade and blur. */
  offset: number
  /** Skip the depth blur (reduced motion). */
  flat: boolean
}

/** One vehicle standing on the floor line, with its contact shadow and reflection. */
export function VehicleSlide({ vehicle, index, offset, flat }: VehicleSlideProps) {
  const src = swiperImage(vehicle)
  const [failed, setFailed] = useState(false)
  // Starts as the common 4:3 photo so the box has a size before the image loads; corrected on load.
  const [size, setSize] = useState({ w: 4, h: 3 })
  const d = Math.min(Math.abs(offset), 1.5)
  const style: CSSProperties = {
    left: `${index * 100}%`,
    transform: `scale(${1 - 0.12 * d})`,
    opacity: Math.max(0, 1 - 0.7 * d),
    filter: flat || d < 0.01 ? undefined : `blur(${5 * d}px)`,
  }
  const vehicleStyle = { '--gs-ratio': size.w / size.h } as CSSProperties

  return (
    <div className="gs-slide" style={style}>
      {src && !failed ? (
        <div className="gs-vehicle" style={vehicleStyle}>
          <div className="gs-shadow" />
          <img
            className="gs-reflection"
            src={src}
            alt=""
            width={size.w}
            height={size.h}
            decoding="async"
            draggable={false}
          />
          <img
            className="gs-photo"
            src={src}
            alt=""
            width={size.w}
            height={size.h}
            decoding="async"
            fetchPriority={d < 0.5 ? 'high' : 'auto'}
            draggable={false}
            onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onError={() => setFailed(true)}
          />
        </div>
      ) : (
        <div className="gs-placeholder">
          {vehicle.vehicleType === 'motorcycle' ? <Bike /> : <Car />}
        </div>
      )}
    </div>
  )
}
