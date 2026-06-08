'use client'

import { Badge } from '@/components/ui/badge'
import { Github, User } from 'lucide-react'

interface Card {
  id: string
  title: string
  jiraKey: string
  points: number
  assignee: {
    name: string
    avatarUrl: string | null
  }
  labels: string[]
  linkedPR?: number
}

interface KanbanBoardProps {
  cards: {
    backlog: Card[]
    doing: Card[]
    review: Card[]
    done: Card[]
  }
}

function KanbanCard({ card }: { card: Card }) {
  return (
    <div className="bg-bg-el border border-rule rounded-sv p-3 hover:border-accent transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-ink-3">{card.jiraKey}</span>
        <span className="text-xs font-mono text-accent">{card.points} pts</span>
      </div>

      <h4 className="text-sm text-ink mb-3">{card.title}</h4>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {card.labels.map((label) => (
            <Badge key={label} variant="muted" className="text-xs px-1.5 py-0.5">
              {label}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {card.linkedPR && (
            <div className="flex items-center gap-1 text-xs text-ink-3">
              <Github className="h-3 w-3" />
              <span>#{card.linkedPR}</span>
            </div>
          )}
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-mono text-accent border border-accent/20">
            {card.assignee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ title, cards, count }: { title: string; cards: Card[]; count: number }) {
  return (
    <div className="flex-1 bg-bg-el border border-rule rounded-sv p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-ink-3">{title}</h3>
        <Badge variant="muted" className="text-xs">{count}</Badge>
      </div>

      <div className="space-y-3 min-h-[400px]">
        {cards.map((card) => (
          <KanbanCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}

export function KanbanBoard({ cards }: KanbanBoardProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">
        <span className="text-xs font-mono uppercase tracking-wider text-ink-3">Sprint Board</span>
      </h2>

      <div className="grid grid-cols-4 gap-4">
        <KanbanColumn title="Backlog" cards={cards.backlog} count={cards.backlog.length} />
        <KanbanColumn title="Doing" cards={cards.doing} count={cards.doing.length} />
        <KanbanColumn title="Review" cards={cards.review} count={cards.review.length} />
        <KanbanColumn title="Done" cards={cards.done} count={cards.done.length} />
      </div>

      <div className="text-xs text-ink-3 text-center">
        <p>Drag and drop to move cards between columns (feature coming soon)</p>
      </div>
    </div>
  )
}
