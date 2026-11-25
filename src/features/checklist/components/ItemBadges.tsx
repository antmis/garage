import type { MaintenanceItem } from '@/data'
import { Badge } from '@/ui'

const KIND_LABEL = { diy: 'DIY', shop: 'Shop', inspect: 'Inspect' } as const
const KIND_VARIANT = { diy: 'primary', shop: 'secondary', inspect: 'outline' } as const

export function ItemBadges({ item }: { item: MaintenanceItem }) {
  return (
    <>
      <Badge variant={KIND_VARIANT[item.kind]}>{KIND_LABEL[item.kind]}</Badge>
      {item.time && <Badge variant="outline">{item.time}</Badge>}
      {item.condition && <Badge variant="secondary">{item.condition}</Badge>}
    </>
  )
}
