interface BurnTimelineData {
  spent: number
  budget: number
}

interface BurnTimelineProps {
  data: BurnTimelineData[]
  width?: number
  height?: number
}

export function BurnTimeline({ data, width = 180, height = 40 }: BurnTimelineProps) {
  if (!data || !data.length) return null

  const max = Math.max(...data.map((d) => Math.max(d.spent, d.budget)))
  const step = width / (data.length - 1)

  const spentPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${i * step},${height - (d.spent / max) * (height - 4) - 2}`)
    .join(' ')

  const budgetPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${i * step},${height - (d.budget / max) * (height - 4) - 2}`)
    .join(' ')

  const area = `${spentPath} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path d={area} fill="var(--accent)" fillOpacity="0.15" />
      <path
        d={budgetPath}
        fill="none"
        stroke="var(--ink-3)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <path
        d={spentPath}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
