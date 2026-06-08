'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepConnectSourceProps {
  source: 'jira' | 'azure'
  onChange: (source: 'jira' | 'azure') => void
  onNext: () => void
  onSkip: () => void
}

export function StepConnectSource({ source, onChange, onNext, onSkip }: StepConnectSourceProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Welcome to Spravio!</h2>
      <p className="mt-1 text-sm text-gray-500">
        Let&apos;s set up your first project. Choose your issue tracking source.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('jira')}
          className={cn(
            'flex flex-col items-center rounded-lg border-2 p-6 transition-colors',
            source === 'jira'
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xl">
            J
          </div>
          <span className="mt-3 text-sm font-medium text-gray-900">Jira</span>
          <span className="mt-1 text-xs text-gray-500">Atlassian Jira Cloud</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('azure')}
          className={cn(
            'flex flex-col items-center rounded-lg border-2 p-6 transition-colors',
            source === 'azure'
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
            Az
          </div>
          <span className="mt-3 text-sm font-medium text-gray-900">Azure DevOps</span>
          <span className="mt-1 text-xs text-gray-500">Microsoft Azure Boards</span>
        </button>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onSkip}>
          Skip
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}
