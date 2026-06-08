'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  // Brand side content
  brandEyebrow: string
  brandTitle: ReactNode
  brandSubtitle: string
  brandContent?: ReactNode
  // Form side header
  formHeader?: ReactNode
}

export function AuthLayout({
  children,
  brandEyebrow,
  brandTitle,
  brandSubtitle,
  brandContent,
  formHeader,
}: AuthLayoutProps) {
  return (
    <div className="auth-page min-h-screen grid md:grid-cols-[1fr_560px] grid-cols-1">
      {/* Brand side - dark */}
      <aside className="brand-side bg-ink text-cream p-10 md:p-12 flex flex-col relative overflow-hidden min-h-[320px] md:min-h-screen">
        {/* Gradient orbs */}
        <div className="absolute -top-[40%] -right-[30%] w-[600px] h-[600px] rounded-full opacity-30 bg-gradient-radial from-accent/30 to-transparent pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[15%] w-[400px] h-[400px] rounded-full opacity-25 bg-gradient-radial from-accent-deep/24 to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="brand-logo inline-flex items-center gap-3 relative z-10">
          <div className="brand-logo-mark w-10 h-10 rounded-xl bg-cream text-ink grid place-items-center font-display italic text-2xl">
            s
          </div>
          <span className="brand-logo-name font-display text-2xl text-cream tracking-tight">
            Spravio
          </span>
        </div>

        {/* Main content */}
        <div className="brand-content my-auto relative z-10 max-w-[440px]">
          <span className="brand-eyebrow font-mono text-[11px] tracking-[0.14em] uppercase text-cream/60 inline-flex items-center gap-3">
            <span className="w-6 h-px bg-cream/60" />
            {brandEyebrow}
          </span>
          <h2 className="brand-title font-display font-light text-4xl md:text-[48px] leading-tight tracking-tight mt-5 text-cream">
            {brandTitle}
          </h2>
          <p className="brand-sub mt-5 text-[15px] leading-relaxed text-cream/80">
            {brandSubtitle}
          </p>

          {brandContent}
        </div>

        {/* Footer */}
        <div className="brand-footer mt-auto relative z-10 font-mono text-[10px] tracking-wider text-cream/45 flex justify-between items-baseline">
          <span>© SPRAVIO 2026</span>
          <span className="flex gap-5">
            <Link href="/status" className="text-cream/70 hover:text-cream transition-colors">
              Status
            </Link>
            <Link href="/docs" className="text-cream/70 hover:text-cream transition-colors">
              Docs
            </Link>
            <Link href="/privacy" className="text-cream/70 hover:text-cream transition-colors">
              Privacidade
            </Link>
          </span>
        </div>
      </aside>

      {/* Form side - light */}
      <div className="form-side p-8 md:p-14 flex flex-col bg-paper">
        {/* Header */}
        {formHeader && (
          <div className="form-side-hdr flex justify-end items-center gap-3 font-mono text-[11px] text-ink-3 tracking-wide mb-8">
            {formHeader}
          </div>
        )}

        {/* Form content */}
        <div className="form-main my-auto max-w-[400px] w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

interface TestimonialProps {
  quote: string
  author: string
  role: string
  company: string
  initials: string
}

export function AuthTestimonial({ quote, author, role, company, initials }: TestimonialProps) {
  return (
    <div className="brand-testimonial mt-10 p-5 pl-6 border-l-2 border-accent bg-cream/6 rounded-r-xl">
      <p className="font-display font-light italic text-[17px] leading-snug text-cream">
        "{quote}"
      </p>
      <div className="brand-testimonial-meta flex items-center gap-3 mt-4 font-mono text-[10px] tracking-[0.14em] uppercase text-cream/55">
        <div className="brand-testimonial-avatar w-7 h-7 rounded-full bg-accent text-ink grid place-items-center font-body font-semibold text-[10px]">
          {initials}
        </div>
        <span>
          {author} · {role} · {company}
        </span>
      </div>
    </div>
  )
}

interface ProgressStepProps {
  steps: Array<{ label: string; description: string }>
  currentStep: number
}

export function AuthProgressSteps({ steps, currentStep }: ProgressStepProps) {
  return (
    <div className="flex flex-col gap-0.5 mt-10">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isPast = index < currentStep
        const opacity = isActive ? 'opacity-100' : 'opacity-50'

        return (
          <div
            key={index}
            className={`flex gap-4 items-center py-3.5 border-b border-cream/15 ${opacity}`}
          >
            <div
              className={`w-7 h-7 rounded-full border-[1.5px] grid place-items-center font-mono text-[11px] font-medium ${
                isActive || isPast
                  ? 'border-accent text-accent'
                  : 'border-cream/30 text-cream/60'
              }`}
            >
              {index + 1}
            </div>
            <div>
              <div className="text-cream font-medium text-sm">{step.label}</div>
              <div className="text-cream/55 text-xs mt-0.5">{step.description}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
