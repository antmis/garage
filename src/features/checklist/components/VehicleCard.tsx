import type { Vehicle } from '@/data'
import { Typography, YStack } from '@/ui'

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="flex items-center gap-4 overflow-hidden rounded-xl border bg-card p-3">
      <img
        src="/truck.png"
        alt={`${vehicle.name} ${vehicle.trim}`}
        className="w-36 shrink-0 sm:w-52"
      />
      <YStack gap={0.5} className="min-w-0">
        <Typography variant="heading" className="leading-tight">{vehicle.trim}</Typography>
        {vehicle.details.map((d) => (
          <Typography key={d} variant="small">{d}</Typography>
        ))}
      </YStack>
    </div>
  )
}
