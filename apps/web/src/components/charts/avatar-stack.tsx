interface Person {
  name: string
  avatar: string
  color?: string
}

interface AvatarStackProps {
  people: Person[]
  max?: number
  size?: number
}

export function AvatarStack({ people, max = 4, size = 22 }: AvatarStackProps) {
  const show = people.slice(0, max)
  const rest = people.length - show.length

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {show.map((p, i) => (
        <div
          key={i}
          title={p.name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: p.color || 'var(--accent)',
            border: '1.5px solid var(--paper)',
            marginLeft: i === 0 ? 0 : -6,
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: size * 0.42,
            fontWeight: 600,
            color: 'white',
            letterSpacing: '-0.02em',
            zIndex: show.length - i,
          }}
        >
          {p.avatar}
        </div>
      ))}
      {rest > 0 && (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--cream-3)',
            border: '1.5px solid var(--paper)',
            marginLeft: -6,
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--ink-2)',
          }}
        >
          +{rest}
        </div>
      )}
    </div>
  )
}
