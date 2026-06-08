import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  subtitle?: string
  colorClass?: string
  borderColorClass?: string
}

export function KpiCard({ label, value, subtitle, colorClass = 'text-teal-600', borderColorClass }: KpiCardProps) {
  return (
    <Card className={cn('p-4', borderColorClass && `border-t-[3px] ${borderColorClass}`)}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold font-mono tracking-tight', colorClass)}>
        {value}
      </p>
      {subtitle && <p className="mt-0.5 text-[10px] text-gray-400">{subtitle}</p>}
    </Card>
  )
}
