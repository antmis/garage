import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { vehicleFullName, vehicleName, vehicleSubtitle, vehicles, type Vehicle } from '@/data'
import { percent, useVehicleProgress, vehiclePath } from '@/features/checklist'
import { Badge, Progress, Typography, XStack, YStack } from '@/ui'

/** Garage landing: one card per vehicle, each a link to its interval table. */
export function GarageList() {
  return (
    <YStack gap={3}>
      {vehicles.map((v) => <GarageCard key={v.id} vehicle={v} />)}
    </YStack>
  )
}

interface GarageCardProps {
  vehicle: Vehicle
}

function GarageCard({ vehicle }: GarageCardProps) {
  const progress = useVehicleProgress(vehicle)
  return (
    <Link
      to={vehiclePath(vehicle.id)}
      className="flex items-center gap-4 rounded-xl border bg-card p-3 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <img src={vehicle.image} alt="" className="aspect-[4/3] w-28 shrink-0 object-contain sm:w-40" />
      <YStack gap={2} className="min-w-0 flex-1">
        <YStack gap={0.5}>
          <Typography as="h2" variant="heading" className="truncate text-lg leading-tight">{vehicleName(vehicle)}</Typography>
          <Typography variant="small" className="truncate">{vehicleSubtitle(vehicle)}</Typography>
        </YStack>
        {vehicle.schedule ? (
          <XStack align="center" gap={3}>
            <Progress value={progress ? percent(progress) : 0} label={`${vehicleFullName(vehicle)} overall progress`} className="h-1.5 flex-1" />
            <Typography as="span" variant="caption" numeric className="whitespace-nowrap">
              {progress ? `${progress.done} / ${progress.total} done` : '–'}
            </Typography>
          </XStack>
        ) : (
          <div><Badge variant="secondary">Coming soon</Badge></div>
        )}
      </YStack>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  )
}
