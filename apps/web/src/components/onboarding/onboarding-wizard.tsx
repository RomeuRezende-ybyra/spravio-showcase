'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { StepIndicator } from './step-indicator'
import { StepConnectSource } from './step-connect-source'
import { StepConnectGithub } from './step-connect-github'
import { StepCreateProject } from './step-create-project'

const STEPS = [
  { id: 1, title: 'Connect Source' },
  { id: 2, title: 'Connect GitHub' },
  { id: 3, title: 'Create Project' },
]

const WIZARD_DISMISSED_KEY = 'spravio:wizard:dismissed'

interface OnboardingWizardProps {
  orgId: string
}

export function OnboardingWizard({ orgId }: OnboardingWizardProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [source, setSource] = useState<'jira' | 'azure'>('jira')

  useEffect(() => {
    // Check if wizard was previously dismissed
    const dismissed = localStorage.getItem(WIZARD_DISMISSED_KEY)
    if (!dismissed) {
      setOpen(true)
    }

    // Listen for wizard open event
    const handleOpenWizard = () => {
      setOpen(true)
      setStep(1) // Reset to first step
    }

    window.addEventListener('spravio:open-wizard', handleOpenWizard)
    return () => window.removeEventListener('spravio:open-wizard', handleOpenWizard)
  }, [])

  const handleComplete = () => {
    setOpen(false)
  }

  const handleDismiss = () => {
    // Mark wizard as dismissed permanently
    localStorage.setItem(WIZARD_DISMISSED_KEY, 'true')
    setOpen(false)
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={handleDismiss} className="max-w-xl">
      <StepIndicator steps={STEPS} currentStep={step} />

      {step === 1 && (
        <StepConnectSource
          source={source}
          onChange={setSource}
          onNext={() => setStep(2)}
          onSkip={handleDismiss}
        />
      )}

      {step === 2 && (
        <StepConnectGithub
          onNext={() => setStep(3)}
          onSkip={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepCreateProject
          source={source}
          orgId={orgId}
          onComplete={handleComplete}
          onBack={() => setStep(2)}
          onSkip={handleDismiss}
        />
      )}
    </Dialog>
  )
}
