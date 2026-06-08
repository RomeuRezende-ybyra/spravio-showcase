interface DonutSegment {
  value: number
  color: string
  label?: string
}

interface DonutProps {
  segments: DonutSegment[]
  size?: number
  thickness?: number
}

export function Donut({ segments, size = 56, thickness = 8 }: DonutProps) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--rule)"
        strokeWidth={thickness}
      />
      {segments.map((s, i) => {
        const len = (s.value / total) * c
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray .5s' }}
          />
        )
        offset += len
        return el
      })}
    </svg>
  )
}
