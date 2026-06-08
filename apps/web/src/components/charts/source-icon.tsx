interface SourceIconProps {
  source: string
  size?: number
}

export function SourceIcon({ source, size = 12 }: SourceIconProps) {
  const labels: Record<string, string> = {
    jira: 'J',
    azure: 'A',
    github: 'G',
    trello: 'T',
    linear: 'L',
    clickup: 'C',
    monday: 'M',
    asana: 'S',
  }

  const colors: Record<string, string> = {
    jira: '#4B8BF5',
    azure: '#4b8bf5',
    github: '#888',
    trello: '#4B8BF5',
    linear: '#9e7cd9',
  }

  return (
    <span
      title={source}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: size + 4,
        height: size + 4,
        borderRadius: 3,
        background: `color-mix(in oklab, ${colors[source] || 'var(--ink-3)'} 20%, transparent)`,
        color: colors[source] || 'var(--ink-2)',
        fontFamily: 'var(--font-mono)',
        fontSize: size - 2,
        fontWeight: 700,
        letterSpacing: 0,
      }}
    >
      {labels[source] || '?'}
    </span>
  )
}
