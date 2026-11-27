import { FilterChips, IntervalTable, VehicleCard, useChecklist } from '@/features/checklist'
import { EmptyState, Typography, YStack } from '@/ui'

export function Home() {
  const { vehicle, schedule, filter, setFilter } = useChecklist()
  return (
    <YStack gap={4}>
      <VehicleCard vehicle={vehicle} />
      {schedule ? (
        <>
          <YStack gap={1}>
            {schedule.notes.map((n, i) => (
              <Typography key={i} variant="small">{n}</Typography>
            ))}
          </YStack>
          <FilterChips value={filter} onChange={setFilter} />
          <IntervalTable />
        </>
      ) : (
        <EmptyState message="Maintenance schedule coming soon" />
      )}
    </YStack>
  )
}
