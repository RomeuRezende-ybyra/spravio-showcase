interface RingGaugeProps {
  value: number
  size?: number
  thickness?: number
  label?: string
}

export function RingGauge({ value, size = 48, thickness = 5, label }: RingGaugeProps) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  const color = v >= 70 ? 'var(--good)' : v >= 45 ? 'var(--warn)' : 'var(--bad)'

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--rule)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray .5s' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.32,
          fontWeight: 400,
          color: 'var(--ink)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
    </div>
  )
}
