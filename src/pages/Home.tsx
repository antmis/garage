import { Checklist, VehicleCard, useChecklist } from '@/features/checklist'
import { Typography, YStack } from '@/ui'

export function Home() {
  const { vehicle } = useChecklist()
  return (
    <YStack gap={4}>
      <VehicleCard vehicle={vehicle} />
      <YStack gap={1}>
        {vehicle.notes.map((n, i) => (
          <Typography key={i} variant="small">{n}</Typography>
        ))}
      </YStack>
      <Checklist />
    </YStack>
  )
}
