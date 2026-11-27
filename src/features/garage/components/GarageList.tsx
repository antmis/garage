import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { vehicles, type Vehicle } from '@/data'
import { vehiclePath } from '@/features/checklist'
import { GarageSwiper } from './garage-swiper/GarageSwiper'

/** Garage landing: a full-screen swiper of every vehicle; picking one opens its interval table. */
export function GarageList() {
  const navigate = useNavigate()
  const open = useCallback((v: Vehicle) => navigate(vehiclePath(v.id)), [navigate])
  return <GarageSwiper vehicles={vehicles} onSelect={open} />
}
