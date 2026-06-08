import { cn } from '@/lib/utils'

interface RateBarProps {
  label: string
  value: number
  colorClass: string
}

export function RateBar({ label, value, colorClass }: RateBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-[10px] text-gray-500">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
        <div className={cn('h-full rounded-full', colorClass)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className={cn('w-8 text-right text-[10px] font-semibold font-mono', colorClass)}>
        {value}%
      </span>
    </div>
  )
}
