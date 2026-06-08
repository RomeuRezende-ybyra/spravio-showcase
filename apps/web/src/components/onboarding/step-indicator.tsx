'use client'

import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              currentStep === step.id
                ? 'bg-teal-600 text-white'
                : currentStep > step.id
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-gray-100 text-gray-400'
            )}
          >
            {step.id}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'mx-2 h-0.5 w-8',
                currentStep > step.id ? 'bg-teal-400' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
