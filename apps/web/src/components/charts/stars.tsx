interface StarsProps {
  value: number
  size?: number
}

export function Stars({ value, size = 10 }: StarsProps) {
  const full = Math.floor(value)
  const frac = value - full

  return (
    <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {[0, 1, 2, 3, 4].map((i) => {
        let fill
        if (i < full) fill = 1
        else if (i === full) fill = frac
        else fill = 0

        const gradientId = `star-grad-${i}-${value.toFixed(2).replace('.', '-')}`

        return (
          <svg key={i} width={size} height={size} viewBox="0 0 10 10">
            <defs>
              <linearGradient id={gradientId}>
                <stop offset={`${fill * 100}%`} stopColor="var(--accent)" />
                <stop offset={`${fill * 100}%`} stopColor="var(--rule-2)" />
              </linearGradient>
            </defs>
            <path
              d="M5 0.5 L6.3 3.8 L9.7 4 L7.1 6.3 L7.9 9.5 L5 7.8 L2.1 9.5 L2.9 6.3 L0.3 4 L3.7 3.8 Z"
              fill={`url(#${gradientId})`}
            />
          </svg>
        )
      })}
    </span>
  )
}
