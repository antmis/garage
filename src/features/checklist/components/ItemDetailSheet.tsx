import { Circle, CircleCheck, ExternalLink, Play } from 'lucide-react'
import type { MaintenanceItem, ServiceInterval } from '@/data'
import { useMediaQuery } from '@/lib/useMediaQuery'
import {
  Button, EmptyState, Sheet, Tabs, TabsContent, TabsList, TabsTrigger, Typography, XStack, YStack,
} from '@/ui'
import { resolvePartUrl, youtubeThumbnailUrl, youtubeWatchUrl } from '../utils/partLinks'
import { ItemBadges } from './ItemBadges'

interface ItemDetailSheetProps {
  item: MaintenanceItem | null
  interval: ServiceInterval | null
  done: boolean
  onDoneChange: (done: boolean) => void
  onClose: () => void
}

export function ItemDetailSheet({ item, interval, done, onDoneChange, onClose }: ItemDetailSheetProps) {
  const desktop = useMediaQuery('(min-width: 640px)')

  return (
    <Sheet
      open={item !== null}
      onOpenChange={(open) => { if (!open) onClose() }}
      side={desktop ? 'right' : 'bottom'}
      title={item?.name ?? ''}
      description={interval ? interval.label : undefined}
      bodyClassName="min-h-[55dvh]"
    >
      {item && (
        <YStack gap={4}>
          <XStack gap={1.5} wrap align="center">
            <ItemBadges item={item} />
          </XStack>

          <Button
            size="lg"
            variant={done ? 'outline' : 'default'}
            className="h-12 w-full gap-3 text-base"
            onClick={() => onDoneChange(!done)}
          >
            {done ? <CircleCheck className="size-5" /> : <Circle className="size-5" />}
            {done ? 'Done. Tap to undo' : 'Mark as done'}
          </Button>

          <Tabs defaultValue="howto" key={item.id}>
            <TabsList>
              <TabsTrigger value="howto">How-to</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="parts">Parts</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="howto">
              {item.steps.length === 0 ? (
                <EmptyState />
              ) : (
                <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-muted-foreground">
                  {item.steps.map((s, i) => (
                    <li key={i}><Typography variant="prose" as="span">{s}</Typography></li>
                  ))}
                </ol>
              )}
            </TabsContent>

            <TabsContent value="tools">
              {item.tools.length === 0 ? (
                <EmptyState />
              ) : (
                <ul className="list-disc space-y-2 pl-5">
                  {item.tools.map((t, i) => (
                    <li key={i}><Typography variant="prose" as="span">{t}</Typography></li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="parts">
              {item.parts.length === 0 ? (
                <EmptyState />
              ) : (
                <YStack gap={2}>
                  {item.parts.map((p, i) => (
                    <Button key={i} asChild variant="outline" size="lg" className="h-12 justify-between">
                      <a href={resolvePartUrl(p)} target="_blank" rel="noopener noreferrer">
                        <span className="truncate">{p.label}</span>
                        <ExternalLink />
                      </a>
                    </Button>
                  ))}
                </YStack>
              )}
            </TabsContent>

            <TabsContent value="videos">
              {item.videos.length === 0 ? (
                <EmptyState />
              ) : (
                <YStack gap={3}>
                  {item.videos.map((v, i) => {
                    const href = v.youtubeId ? youtubeWatchUrl(v.youtubeId) : v.url
                    if (!href) return null
                    return (
                      <Button key={i} asChild variant="outline" className="h-auto items-stretch justify-start gap-3 whitespace-normal p-2 text-left">
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {v.youtubeId && (
                            <span className="relative block w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                              <img src={youtubeThumbnailUrl(v.youtubeId)} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                              <Play className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 fill-white text-white drop-shadow" />
                            </span>
                          )}
                          <span className="flex min-w-0 flex-col justify-center gap-0.5">
                            <span className="font-medium leading-snug">{v.title}</span>
                            {v.note && <span className="text-xs font-normal text-muted-foreground">{v.note}</span>}
                          </span>
                        </a>
                      </Button>
                    )
                  })}
                </YStack>
              )}
            </TabsContent>
          </Tabs>

          {item.notes && (
            <YStack gap={1}>
              <Typography variant="meta">Notes</Typography>
              <Typography variant="prose" color="muted" className="whitespace-pre-line">{item.notes}</Typography>
            </YStack>
          )}
        </YStack>
      )}
    </Sheet>
  )
}
