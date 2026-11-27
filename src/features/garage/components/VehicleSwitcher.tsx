import { Check, ChevronsUpDown, Warehouse } from 'lucide-react'
import { Link } from 'react-router-dom'
import { vehicleFullName, vehicleName, vehicleSubtitle, vehicles, type Vehicle } from '@/data'
import { vehiclePath } from '@/features/checklist'
import { cn } from '@/lib/utils'
import {
  Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger, Typography, YStack,
} from '@/ui'

interface VehicleSwitcherProps {
  /** The vehicle being viewed: shown on the trigger and checked in the menu. */
  vehicle: Vehicle
  /** Smaller heading, for the interval sidebar and top bar. */
  compact?: boolean
}

/** The vehicle name as a menu trigger. Picking a vehicle opens its interval table. */
export function VehicleSwitcher({ vehicle, compact = false }: VehicleSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="-ml-2 h-auto min-w-0 gap-1 px-2 py-1" aria-label={`${vehicleFullName(vehicle)}. Switch vehicle`}>
          <Typography as="h1" variant="heading" className={cn('truncate', compact && 'text-lg')}>
            {vehicleName(vehicle)}
          </Typography>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Vehicles</DropdownMenuLabel>
        {vehicles.map((v) => (
          <DropdownMenuItem key={v.id} asChild>
            <Link to={vehiclePath(v.id)} aria-current={v.id === vehicle.id ? 'page' : undefined}>
              <img src={v.image} alt="" className="aspect-[4/3] w-12 shrink-0 object-contain" />
              <YStack gap={0} className="min-w-0 flex-1">
                <Typography as="span" variant="label" className="truncate">{vehicleName(v)}</Typography>
                <Typography as="span" variant="small" className="truncate">{vehicleSubtitle(v)}</Typography>
              </YStack>
              <Check className={cn('text-foreground', v.id !== vehicle.id && 'invisible')} />
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/garage"><Warehouse /> All vehicles</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
