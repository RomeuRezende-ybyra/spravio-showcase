interface BarsProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  gap?: number
}

export function Bars({ data, width = 80, height = 22, color = 'currentColor', gap = 1 }: BarsProps) {
  if (!data || !data.length) return null

  const max = Math.max(...data) || 1
  const barW = (width - gap * (data.length - 1)) / data.length

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = (v / max) * height
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            fill={color}
            rx="0.5"
          />
        )
      })}
    </svg>
  )
}
