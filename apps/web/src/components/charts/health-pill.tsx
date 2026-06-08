interface HealthPillProps {
  status: 'green' | 'yellow' | 'red'
  score: number
  compact?: boolean
}

export function HealthPill({ status, score, compact = false }: HealthPillProps) {
  const map = {
    green: {
      bg: 'color-mix(in oklab, var(--good) 18%, transparent)',
      fg: 'var(--good)',
      label: 'On track',
    },
    yellow: {
      bg: 'color-mix(in oklab, var(--warn) 22%, transparent)',
      fg: 'var(--warn)',
      label: 'At risk',
    },
    red: {
      bg: 'color-mix(in oklab, var(--bad) 20%, transparent)',
      fg: 'var(--bad)',
      label: 'Critical',
    },
  }

  const s = map[status] || map.green

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: s.fg,
            boxShadow: `0 0 0 3px ${s.bg}`,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: s.fg,
            fontWeight: 500,
          }}
        >
          {score}
        </span>
      </div>
    )
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px',
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.04em',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.fg }} />
      {s.label} · {score}
    </span>
  )
}
