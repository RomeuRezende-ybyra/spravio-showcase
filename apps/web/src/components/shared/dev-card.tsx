import { Card } from '@/components/ui/card'
import { RateBar } from '@/components/shared/rate-bar'
import { ScoreDots } from '@/components/shared/score-dots'
import { cn } from '@/lib/utils'

interface DevCardProps {
  name: string
  avatarUrl: string | null
  rating: number
  deliveryRate: number
  returnRate: number
  totalPoints: number
  selected?: boolean
  onClick?: () => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function DevCard({
  name,
  avatarUrl,
  rating,
  deliveryRate,
  returnRate,
  totalPoints,
  selected,
  onClick,
}: DevCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer p-3.5 transition-all hover:shadow-md',
        selected && 'ring-2 ring-teal-500 bg-teal-50/50',
      )}
      onClick={onClick}
    >
      <div className="mb-2 flex items-center gap-2.5">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-700 font-mono">
            {getInitials(name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-semibold text-gray-900">{name}</p>
          <p className="text-[10px] text-gray-500 font-mono">{totalPoints} pts</p>
        </div>
        <span className="text-sm font-bold font-mono text-teal-600">{rating.toFixed(1)}</span>
      </div>

      <div className="flex flex-col gap-1.5 mb-2.5">
        <RateBar label="Delivery" value={deliveryRate} colorClass="text-green-600 bg-green-500" />
        <RateBar
          label="Rework"
          value={returnRate}
          colorClass={returnRate > 20 ? 'text-red-500 bg-red-500' : 'text-amber-500 bg-amber-500'}
        />
      </div>

      <ScoreDots score={rating} />
    </Card>
  )
}
