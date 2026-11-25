import { useState } from 'react'
import type { Vehicle } from '@/data'
import { Typography, YStack } from '@/ui'
import { TruckIllustration } from './TruckIllustration'

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  // A photo at public/truck.jpg replaces the illustration; a missing file fires onError.
  const [photoFailed, setPhotoFailed] = useState(false)
  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-xl border bg-card p-4">
      <div className="w-36 shrink-0 text-foreground sm:w-48">
        {photoFailed ? (
          <TruckIllustration className="w-full" />
        ) : (
          <img src="/truck.jpg" alt={`${vehicle.name} ${vehicle.trim}`} onError={() => setPhotoFailed(true)} className="aspect-[8/3] w-full rounded-md object-cover" />
        )}
      </div>
      <YStack gap={0.5} className="min-w-0">
        <Typography variant="heading" className="leading-tight">{vehicle.trim}</Typography>
        {vehicle.details.map((d) => (
          <Typography key={d} variant="small">{d}</Typography>
        ))}
      </YStack>
    </div>
  )
}
