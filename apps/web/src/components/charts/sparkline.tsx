interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: boolean
  strokeWidth?: number
}

export function Sparkline({
  data,
  width = 80,
  height = 22,
  stroke = 'currentColor',
  fill = false,
  strokeWidth = 1.25,
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)

  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 2) - 1])
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = fill ? `${d} L${width},${height} L0,${height} Z` : null
  const last = pts[pts.length - 1]

  if (!last) return null

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {fill && area && <path d={area} fill={stroke} fillOpacity="0.12" />}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2" fill={stroke} />
    </svg>
  )
}
