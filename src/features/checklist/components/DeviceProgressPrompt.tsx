import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useIdentity } from '@/features/identity'
import { addDeviceProgress, discardDeviceProgress, planDeviceImport, type DeviceImportPlan } from '@/lib/api/deviceImport'
import { useGarage } from '@/lib/api/vehicles'
import { Button, Dialog, XStack } from '@/ui'

/**
 * After sign-in, moves progress made on this device without an account into it. A new (empty) account takes it
 * without asking; an existing account asks once, and only when the device has ticks the account doesn't.
 * Closing the dialog without choosing keeps the device copy, so it asks again next launch.
 */
export function DeviceProgressPrompt() {
  const { userId } = useIdentity()
  const garage = useGarage(userId)
  const [plan, setPlan] = useState<DeviceImportPlan | null>(null)
  const [busy, setBusy] = useState(false)
  // One check per signed-in user; cleared on failure so a later garage refetch retries.
  const checkedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!userId || !garage.data || checkedFor.current === userId) return
    checkedFor.current = userId
    planDeviceImport(garage.data)
      .then(async (next) => {
        if (!next) return
        if (next.count === 0) return discardDeviceProgress() // all of it is already in the account
        if (next.accountEmpty) return addDeviceProgress(next)
        setPlan(next)
      })
      .catch(() => {
        checkedFor.current = null
        toast.error('Couldn’t move this device’s progress into your account. It’s kept on this device.')
      })
  }, [userId, garage.data])

  const choose = async (add: boolean) => {
    if (!plan) return
    setBusy(true)
    try {
      if (add) await addDeviceProgress(plan)
      else discardDeviceProgress()
      setPlan(null)
    } catch {
      toast.error('Couldn’t add them. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const count = plan?.count ?? 0
  return (
    <Dialog
      open={plan !== null}
      onOpenChange={(open) => !open && setPlan(null)}
      title="Add this device’s progress to your account?"
      description={`${count} ${count === 1 ? 'item' : 'items'} checked on this device ${count === 1 ? 'isn’t' : 'aren’t'} in your account. Adding never removes anything already there.`}
      className="max-w-sm"
      footer={
        <XStack gap={2} className="justify-end">
          <Button variant="outline" disabled={busy} onClick={() => void choose(false)}>Discard them</Button>
          <Button disabled={busy} onClick={() => void choose(true)}>Add them</Button>
        </XStack>
      }
    />
  )
}
