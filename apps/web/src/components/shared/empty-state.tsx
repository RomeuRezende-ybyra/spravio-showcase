'use client'

import { Card } from '@/components/ui/card'
import { FolderOpen, type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-gray-400">
        {Icon ? <Icon className="mx-auto h-12 w-12" /> : <FolderOpen className="mx-auto h-12 w-12" />}
      </div>
      <h3 className="mt-4 text-base font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </Card>
  )
}
