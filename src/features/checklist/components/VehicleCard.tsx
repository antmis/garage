import { useState } from 'react'
import { vehicleFullName, vehicleModelTrim, type Vehicle } from '@/data'
import { VehicleDetailsSheet } from '@/features/vehicle-details'
import { Button, Typography, YStack } from '@/ui'
import { useChecklist } from '../hooks/ChecklistContext'
import { Info } from 'lucide-react'

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { vehicleRowId } = useChecklist()
  const [detailsOpen, setDetailsOpen] = useState(false)
  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-xl border bg-card p-3">
      <img
        src={vehicle.image}
        alt={vehicleFullName(vehicle)}
        className="aspect-[4/3] w-36 shrink-0 object-contain sm:w-52"
      />
      <YStack gap={0.5} className="min-w-0">
        <Typography variant="heading" className="leading-tight">{vehicleModelTrim(vehicle)}</Typography>
        <Typography variant="small">{vehicle.year} {vehicle.make}</Typography>
        {vehicle.details.map((d) => (
          <Typography key={d} variant="small">{d}</Typography>
        ))}
        {vehicleRowId && (
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={() => setDetailsOpen(true)}>
              Details
              <Info />
            </Button>
          </div>
        )}
      </YStack>
      {detailsOpen && vehicleRowId && <VehicleDetailsSheet rowId={vehicleRowId} onOpenChange={setDetailsOpen} />}
    </div>
  )
}
