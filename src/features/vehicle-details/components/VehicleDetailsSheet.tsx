import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { checkVin } from '@/lib/vin'
import type { TablesUpdate } from '@/lib/database.types'
import { useIdentity } from '@/features/identity'
import { useGarage, useUpdateVehicle, type VehicleRow } from '@/lib/api/vehicles'
import { decodeVin, getRecalls, specToVehicleFields, type VehicleFields } from '@/lib/vehicle-data'
import { Badge, Button, Input, Separator, Sheet, Typography, XStack, YStack } from '@/ui'

type FieldKey = keyof VehicleFields | 'nickname' | 'odometer'

const FIELDS: { key: FieldKey; label: string; numeric?: boolean }[] = [
  { key: 'nickname', label: 'Nickname' },
  { key: 'model_year', label: 'Year', numeric: true },
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'trim', label: 'Trim' },
  { key: 'body_class', label: 'Body' },
  { key: 'drive_type', label: 'Drive' },
  { key: 'engine_displacement_l', label: 'Engine (L)', numeric: true },
  { key: 'engine_cylinders', label: 'Cylinders', numeric: true },
  { key: 'fuel_type', label: 'Fuel' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'odometer', label: 'Odometer', numeric: true },
]

type Form = Record<FieldKey | 'vin', string>

function toForm(row: VehicleRow): Form {
  const f = { vin: row.vin ?? '' } as Form
  for (const { key } of FIELDS) f[key] = row[key] === null || row[key] === undefined ? '' : String(row[key])
  return f
}

function toPatch(form: Form, vin: string | null): TablesUpdate<'vehicles'> {
  const patch: Record<string, string | number | null> = { vin }
  for (const { key, numeric } of FIELDS) {
    const v = form[key].trim()
    patch[key] = v === '' ? null : numeric ? Number(v) : v
  }
  return patch
}

interface VehicleDetailsSheetProps {
  /** This user's `vehicles.id`. */
  rowId: string
  onOpenChange: (open: boolean) => void
}

/**
 * User-confirmed vehicle facts. Decoded values arrive as suggestions; nothing changes until Apply, then Save.
 * Mount it only while open, so each opening starts from the saved row rather than an abandoned edit.
 */
export function VehicleDetailsSheet({ rowId, onOpenChange }: VehicleDetailsSheetProps) {
  const { userId } = useIdentity()
  const row = useGarage(userId).data?.find((r) => r.id === rowId)
  const update = useUpdateVehicle(userId)
  if (!row) return null
  return (
    <VehicleDetailsForm
      row={row}
      onOpenChange={onOpenChange}
      save={(patch) => update.mutateAsync({ id: row.id, patch })}
    />
  )
}

interface VehicleDetailsFormProps {
  row: VehicleRow
  onOpenChange: (open: boolean) => void
  save: (patch: TablesUpdate<'vehicles'>) => Promise<VehicleRow>
}

function VehicleDetailsForm({ row, onOpenChange, save }: VehicleDetailsFormProps) {
  const desktop = useMediaQuery('(min-width: 640px)')
  const [form, setForm] = useState<Form>(() => toForm(row))
  const [saving, setSaving] = useState(false)
  const decode = useMutation({ mutationFn: (a: { vin: string; year?: number }) => decodeVin(row.id, a.vin, a.year) })
  const recalls = useMutation({
    mutationFn: (a: { make: string; model: string; year: number }) => getRecalls(row.id, a.make, a.model, a.year),
  })

  const vin = checkVin(form.vin)
  const vinInvalid = form.vin.trim() !== '' && !vin.ok
  const set = (key: keyof Form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const suggestions = decode.data?.normalized
    ? Object.entries(specToVehicleFields(decode.data.normalized)).filter(
        ([k, v]) => String(v) !== form[k as FieldKey].trim(),
      )
    : []

  const recallArgs = {
    make: form.make.trim(),
    model: form.model.trim(),
    year: Number(form.model_year),
  }
  const canCheckRecalls = recallArgs.make && recallArgs.model && Number.isInteger(recallArgs.year)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (vinInvalid) return
    setSaving(true)
    try {
      const saved = await save(toPatch(form, vin.ok ? vin.vin : null))
      setForm(toForm(saved))
      toast.success('Saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Couldn’t save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onOpenChange={onOpenChange} title="Vehicle details" side={desktop ? 'right' : 'bottom'}>
      <form onSubmit={onSubmit}>
        <YStack gap={4}>
          <YStack gap={1.5}>
            <Typography as="label" variant="label" htmlFor="vd-vin">VIN</Typography>
            <XStack gap={2}>
              <Input
                id="vd-vin"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={24}
                value={form.vin}
                aria-invalid={vinInvalid || undefined}
                onChange={(e) => {
                  set('vin', e.target.value)
                  decode.reset()
                }}
              />
              {vin.ok && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  disabled={decode.isPending}
                  onClick={() => decode.mutate({ vin: vin.vin, year: Number(form.model_year) || undefined })}
                >
                  {decode.isPending ? 'Decoding…' : 'Decode VIN'}
                </Button>
              )}
            </XStack>
            {vinInvalid && <Typography variant="small" color="danger">17 letters and digits, without I, O or Q.</Typography>}
            {vin.ok && vin.checkDigitWarning && (
              <Typography variant="small" color="warning">
                Check digit doesn’t match. Normal for many non-US vehicles; double-check if this one is US-market.
              </Typography>
            )}
            {decode.error && <Typography variant="small" color="danger">{decode.error.message}</Typography>}
          </YStack>

          {decode.data && (
            <YStack gap={2} className="rounded-lg border p-3">
              <XStack align="center" justify="between" gap={2}>
                <Typography variant="label">Suggested from NHTSA</Typography>
                {decode.data.status === 'partial' && <Badge variant="secondary">Partial</Badge>}
              </XStack>
              {decode.data.errorText && <Typography variant="small">{decode.data.errorText}</Typography>}
              {suggestions.length === 0 ? (
                <Typography variant="small">Nothing new to apply.</Typography>
              ) : (
                <>
                  {suggestions.map(([key, value]) => (
                    <XStack key={key} align="center" justify="between" gap={2}>
                      <Typography variant="small" className="min-w-0">
                        {FIELDS.find((f) => f.key === key)?.label}: <span className="text-foreground">{String(value)}</span>
                      </Typography>
                      <Button type="button" size="sm" variant="ghost" onClick={() => set(key as FieldKey, String(value))}>
                        Apply
                      </Button>
                    </XStack>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setForm((f) => ({ ...f, ...Object.fromEntries(suggestions.map(([k, v]) => [k, String(v)])) }))}
                  >
                    Apply all
                  </Button>
                </>
              )}
            </YStack>
          )}

          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ key, label, numeric }) => (
              <YStack key={key} gap={1.5}>
                <Typography as="label" variant="label" htmlFor={`vd-${key}`}>{label}</Typography>
                <Input
                  id={`vd-${key}`}
                  inputMode={numeric ? 'decimal' : undefined}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
              </YStack>
            ))}
          </div>

          <Button type="submit" disabled={saving || vinInvalid}>{saving ? 'Saving…' : 'Save'}</Button>

          <Separator />

          <YStack gap={2}>
            <XStack align="center" justify="between" gap={2}>
              <Typography variant="label">Recalls</Typography>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canCheckRecalls || recalls.isPending}
                onClick={() => recalls.mutate(recallArgs)}
              >
                {recalls.isPending ? 'Checking…' : 'Check recalls'}
              </Button>
            </XStack>
            {!canCheckRecalls && <Typography variant="small">Needs year, make and model.</Typography>}
            {recalls.error && <Typography variant="small" color="danger">{recalls.error.message}</Typography>}
            {recalls.data?.normalized && (
              recalls.data.normalized.recalls.length === 0 ? (
                <Typography variant="small">No recalls found for this year, make and model.</Typography>
              ) : (
                <YStack gap={3}>
                  <Typography variant="small">
                    By year, make and model, not VIN: some may not apply to this vehicle.
                  </Typography>
                  {recalls.data.normalized.recalls.map((r) => (
                    <YStack key={r.campaignNumber} gap={1}>
                      <Typography variant="caption">{r.campaignNumber} · {r.component}</Typography>
                      <Typography variant="small">{r.summary}</Typography>
                    </YStack>
                  ))}
                </YStack>
              )
            )}
          </YStack>
        </YStack>
      </form>
    </Sheet>
  )
}
