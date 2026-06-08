'use client'

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'

interface CodeInputProps {
  length?: number
  value: string[]
  onChange: (value: string[]) => void
  onComplete?: (code: string) => void
}

export function CodeInput({ length = 6, value, onChange, onComplete }: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    // Check if code is complete
    if (value.every((digit) => digit.length === 1)) {
      onComplete?.(value.join(''))
    }
  }, [value, onComplete])

  const handleInput = (index: number, inputValue: string) => {
    // Only allow single digit
    const digit = inputValue.slice(-1)
    if (!/^\d*$/.test(digit)) return

    const newValue = [...value]
    newValue[index] = digit
    onChange(newValue)

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').trim()

    // Extract only digits
    const digits = pastedData.replace(/\D/g, '').slice(0, length)

    if (digits) {
      const newValue = Array.from({ length }, (_, i) => digits[i] || '')
      onChange(newValue)

      // Focus last filled input or next empty
      const nextIndex = Math.min(digits.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="code-input flex gap-2.5 justify-center my-8">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className={`w-[52px] h-[60px] text-center font-display text-[26px] bg-paper border rounded-xl transition-all focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20 ${
            value[index] ? 'bg-cream-2 border-ink-3' : 'border-rule-2'
          }`}
        />
      ))}
    </div>
  )
}
