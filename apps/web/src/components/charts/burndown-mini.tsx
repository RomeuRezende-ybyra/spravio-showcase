interface BurndownMiniProps {
  burndown: {
    ideal: number[]
    actual: number[]
  }
  width?: number
  height?: number
}

export function BurndownMini({ burndown, width = 120, height = 32 }: BurndownMiniProps) {
  const { ideal, actual } = burndown
  const max = Math.max(...ideal, ...actual)
  const step = width / (ideal.length - 1)

  const toPath = (arr: number[]) =>
    arr
      .map((v, i) => `${i === 0 ? 'M' : 'L'}${i * step},${height - (v / max) * (height - 2) - 1}`)
      .join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path
        d={toPath(ideal)}
        fill="none"
        stroke="var(--rule-2)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <path
        d={toPath(actual)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
