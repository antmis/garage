// The browser's only door to third-party vehicle data: everything goes through the vehicle-data Edge Function.
import { FunctionsHttpError } from '@supabase/supabase-js'
import type {
  NormalizedRecalls,
  NormalizedVehicleSpec,
  VehicleDataErrorCode,
  VehicleDataFailure,
  VehicleDataRequest,
  VehicleDataSuccess,
} from '../../supabase/functions/_shared/providers/types.ts'
import type { TablesUpdate } from './database.types'
import { supabase } from './supabase'

export type { NormalizedRecall, NormalizedRecalls, NormalizedVehicleSpec, VehicleDataSuccess } from '../../supabase/functions/_shared/providers/types.ts'

export class VehicleDataError extends Error {
  code: VehicleDataErrorCode | 'offline'
  constructor(code: VehicleDataErrorCode | 'offline', message: string) {
    super(message)
    this.code = code
  }
}

async function invoke<T>(body: VehicleDataRequest): Promise<VehicleDataSuccess<T>> {
  const { data, error } = await supabase.functions.invoke<VehicleDataSuccess<T>>('vehicle-data', { body })
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const failure = (await (error.context as Response).json().catch(() => null)) as VehicleDataFailure | null
      if (failure?.error) throw new VehicleDataError(failure.error.code, failure.error.message)
    }
    throw new VehicleDataError('offline', 'Couldn’t reach the vehicle data service')
  }
  if (!data) throw new VehicleDataError('internal', 'Empty response')
  return data
}

export function decodeVin(vehicleId: string, vin: string, modelYear?: number) {
  return invoke<NormalizedVehicleSpec>({ kind: 'vin_decode', vehicleId, vin, modelYear })
}

export function getRecalls(vehicleId: string, make: string, model: string, modelYear: number) {
  return invoke<NormalizedRecalls>({ kind: 'recalls', vehicleId, make, model, modelYear })
}

export type VehicleFields = Pick<
  TablesUpdate<'vehicles'>,
  | 'model_year' | 'make' | 'model' | 'trim' | 'body_class' | 'drive_type'
  | 'engine_displacement_l' | 'engine_cylinders' | 'fuel_type' | 'transmission'
>

/** Canonical spec -> `vehicles` columns. Null (no data) fields are left out so they never blank a user value. */
export function specToVehicleFields(spec: NormalizedVehicleSpec): VehicleFields {
  const all: VehicleFields = {
    model_year: spec.modelYear,
    make: spec.make,
    model: spec.model,
    trim: spec.trim,
    body_class: spec.bodyClass,
    drive_type: spec.driveType,
    engine_displacement_l: spec.engineDisplacementL,
    engine_cylinders: spec.engineCylinders,
    fuel_type: spec.fuelType,
    transmission: spec.transmission,
  }
  return Object.fromEntries(Object.entries(all).filter(([, v]) => v !== null && v !== undefined)) as VehicleFields
}
