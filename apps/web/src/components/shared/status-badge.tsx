import { Badge } from '@/components/ui/badge'
import type { BadgeProps } from '@/components/ui/badge'

const STATUS_MAP: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  DONE: { label: 'Done', variant: 'success' },
  UAT: { label: 'UAT', variant: 'default' },
  TEST: { label: 'Test', variant: 'info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  TODO: { label: 'To Do', variant: 'muted' },
  CANCELLED: { label: 'Cancelled', variant: 'muted' },
}

const PR_STATUS_MAP: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  OPEN: { label: 'Open', variant: 'warning' },
  MERGED: { label: 'Merged', variant: 'purple' },
  CLOSED: { label: 'Closed', variant: 'muted' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { label: status, variant: 'muted' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function PRStatusBadge({ status }: { status: string }) {
  const cfg = PR_STATUS_MAP[status] ?? { label: status, variant: 'muted' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
