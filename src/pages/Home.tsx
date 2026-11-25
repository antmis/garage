import { FilterChips, IntervalTable, VehicleCard, useChecklist } from '@/features/checklist'
import { Typography, YStack } from '@/ui'

export function Home() {
  const { vehicle, filter, setFilter } = useChecklist()
  return (
    <YStack gap={4}>
      <VehicleCard vehicle={vehicle} />
      <YStack gap={1}>
        {vehicle.notes.map((n, i) => (
          <Typography key={i} variant="small">{n}</Typography>
        ))}
      </YStack>
      <FilterChips value={filter} onChange={setFilter} />
      <IntervalTable />
    </YStack>
  )
}
