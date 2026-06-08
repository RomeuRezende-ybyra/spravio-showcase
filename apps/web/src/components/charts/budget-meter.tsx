interface BudgetMeterProps {
  pct: number
  height?: number
  accent?: string
  track?: string
}

export function BudgetMeter({
  pct,
  height = 8,
  accent = 'var(--accent)',
  track = 'var(--rule)',
}: BudgetMeterProps) {
  const clamped = Math.max(0, Math.min(100, pct))
  const color =
    clamped > 85 ? 'var(--bad)' : clamped > 70 ? 'var(--warn)' : 'var(--good)'

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        background: track,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          background: color,
          transition: 'width .4s',
        }}
      />
      {clamped > 15 && (
        <div
          style={{
            position: 'absolute',
            left: '70%',
            top: -2,
            bottom: -2,
            width: 1,
            background: 'var(--ink-3)',
            opacity: 0.3,
          }}
        />
      )}
      {clamped > 20 && (
        <div
          style={{
            position: 'absolute',
            left: '85%',
            top: -2,
            bottom: -2,
            width: 1,
            background: 'var(--ink-3)',
            opacity: 0.3,
          }}
        />
      )}
    </div>
  )
}
