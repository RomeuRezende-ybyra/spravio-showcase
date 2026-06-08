interface ActivityHeatProps {
  activity: number[]
  cell?: number
  gap?: number
}

export function ActivityHeat({ activity, cell = 10, gap = 2 }: ActivityHeatProps) {
  const max = 5

  return (
    <div style={{ display: 'flex', gap }}>
      {activity.map((v, i) => {
        const intensity = v / max
        const bg =
          v === 0
            ? 'var(--rule)'
            : `color-mix(in oklab, var(--accent) ${20 + intensity * 80}%, var(--cream-3))`

        return (
          <div
            key={i}
            title={`${v} events`}
            style={{
              width: cell,
              height: cell,
              background: bg,
              borderRadius: 2,
              opacity: v === 0 ? 0.4 : 1,
            }}
          />
        )
      })}
    </div>
  )
}
