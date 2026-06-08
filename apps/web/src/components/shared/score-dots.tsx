export function ScoreDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= Math.floor(score) ? 'bg-teal-500' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500 font-mono">{score.toFixed(1)}</span>
    </div>
  )
}
