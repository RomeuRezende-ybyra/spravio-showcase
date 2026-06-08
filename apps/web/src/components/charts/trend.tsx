interface TrendProps {
  direction: 'up' | 'down' | 'stable'
}

export function Trend({ direction }: TrendProps) {
  const map = {
    up: { arrow: '↑', color: 'var(--good)' },
    down: { arrow: '↓', color: 'var(--bad)' },
    stable: { arrow: '→', color: 'var(--ink-3)' },
  }

  const t = map[direction] || map.stable

  return (
    <span style={{ color: t.color, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
      {t.arrow}
    </span>
  )
}
