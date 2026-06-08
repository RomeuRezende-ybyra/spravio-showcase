'use client'

import { useEffect, useState } from 'react'

interface PasswordStrengthProps {
  password: string
  showHints?: boolean
}

interface PasswordRules {
  len: boolean
  upper: boolean
  num: boolean
  sym: boolean
}

export function PasswordStrength({ password, showHints = true }: PasswordStrengthProps) {
  const [rules, setRules] = useState<PasswordRules>({
    len: false,
    upper: false,
    num: false,
    sym: false,
  })

  useEffect(() => {
    setRules({
      len: password.length >= 8,
      upper: /[A-Z]/.test(password),
      num: /[0-9]/.test(password),
      sym: /[^A-Za-z0-9]/.test(password),
    })
  }, [password])

  const passedCount = Object.values(rules).filter(Boolean).length
  const strength =
    passedCount >= 4 ? 'strong' : passedCount >= 2 ? 'medium' : passedCount >= 1 ? 'weak' : 'none'

  return (
    <div>
      {/* Strength bars */}
      <div className="pw-strength flex gap-1 mt-2">
        <div
          className={`flex-1 h-0.5 rounded-full transition-colors ${
            strength === 'weak'
              ? 'bg-bad'
              : strength === 'medium' || strength === 'strong'
                ? strength === 'medium'
                  ? 'bg-warn'
                  : 'bg-good'
                : 'bg-rule'
          }`}
        />
        <div
          className={`flex-1 h-0.5 rounded-full transition-colors ${
            strength === 'medium' || strength === 'strong'
              ? strength === 'medium'
                ? 'bg-warn'
                : 'bg-good'
              : 'bg-rule'
          }`}
        />
        <div
          className={`flex-1 h-0.5 rounded-full transition-colors ${
            strength === 'strong' ? 'bg-good' : 'bg-rule'
          }`}
        />
      </div>

      {/* Hints */}
      {showHints && (
        <div className="pw-hints grid grid-cols-2 gap-1.5 mt-2.5 font-mono text-[10px] tracking-wide text-ink-3">
          <span className={`flex items-center gap-1.5 ${rules.len ? 'text-good' : ''}`}>
            <span className="text-[10px]">{rules.len ? '●' : '○'}</span>
            8+ caracteres
          </span>
          <span className={`flex items-center gap-1.5 ${rules.upper ? 'text-good' : ''}`}>
            <span className="text-[10px]">{rules.upper ? '●' : '○'}</span>
            1 maiúscula
          </span>
          <span className={`flex items-center gap-1.5 ${rules.num ? 'text-good' : ''}`}>
            <span className="text-[10px]">{rules.num ? '●' : '○'}</span>
            1 número
          </span>
          <span className={`flex items-center gap-1.5 ${rules.sym ? 'text-good' : ''}`}>
            <span className="text-[10px]">{rules.sym ? '●' : '○'}</span>
            1 símbolo
          </span>
        </div>
      )}
    </div>
  )
}
