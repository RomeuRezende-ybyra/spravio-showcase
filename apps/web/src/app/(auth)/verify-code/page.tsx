'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/auth-layout'
import { CodeInput } from '@/components/auth/code-input'
import { Mail } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3010'

function VerifyCodeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  async function handleCodeComplete(fullCode: string) {
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Código inválido ou expirado')
      }

      // Navigate to reset password page with token
      router.push(`/reset-password?token=${data.data.resetToken}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar código')
      setCode(Array(6).fill('')) // Clear code on error
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!canResend) return

    setError('')
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        throw new Error('Erro ao reenviar código')
      }

      setResendTimer(60)
      setCanResend(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar código')
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AuthLayout
      brandEyebrow="Quase lá"
      brandTitle={
        <>
          Verifique <em className="italic text-accent">sua caixa.</em>
        </>
      }
      brandSubtitle="Se o email existe no sistema, você vai receber um código de 6 dígitos em menos de um minuto."
      brandContent={
        <div className="mt-9 p-5 rounded-xl bg-cream/8 border border-cream/15">
          <div className="font-mono text-[10px] tracking-[0.14em] text-cream/60 uppercase">
            ⏱ CÓDIGO VÁLIDO POR
          </div>
          <div className="font-display font-light text-4xl text-cream mt-1 leading-none">
            15 <span className="text-lg text-cream/60">minutos</span>
          </div>
          <div className="text-xs text-cream/65 mt-2.5 leading-relaxed">
            Expirou? Sem problema. Você pode pedir um novo código a qualquer momento.
          </div>
        </div>
      }
      formHeader={
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-accent-deep font-body font-medium text-[13px] hover:underline"
        >
          <span>←</span> Usar outro email
        </Link>
      }
    >
      <div className="success-icon w-16 h-16 rounded-full bg-good/14 text-good grid place-items-center mb-6">
        <Mail className="w-7 h-7" />
      </div>

      <span className="form-eyebrow font-mono text-[11px] tracking-[0.14em] uppercase text-accent-deep font-medium inline-flex items-center gap-3">
        <span className="w-6 h-px bg-accent" />
        Passo 2 de 3
      </span>
      <h2 className="form-title font-display font-light text-[42px] leading-tight tracking-tight mt-4">
        Cole o <em className="italic text-accent-deep">código.</em>
      </h2>
      <p className="form-sub mt-3.5 text-ink-2 text-[15px] leading-relaxed">
        Enviamos um código de 6 dígitos para{' '}
        <strong className="text-ink font-medium">{email}</strong>. Cole ou digite ele abaixo.
      </p>

      <form onSubmit={(e) => e.preventDefault()}>
        <CodeInput value={code} onChange={setCode} onComplete={handleCodeComplete} />

        <div className="code-resend text-center mt-4 text-[13px] text-ink-2">
          {canResend ? (
            <>
              Não chegou?{' '}
              <button
                type="button"
                onClick={handleResend}
                className="text-accent-deep font-medium hover:underline"
              >
                Reenviar código
              </button>
            </>
          ) : (
            <>
              Não chegou? Reenviar em{' '}
              <strong className="text-ink font-mono font-medium text-xs">
                {formatTimer(resendTimer)}
              </strong>
            </>
          )}
        </div>

        {error && <p className="text-xs text-bad mt-4 text-center">{error}</p>}

        <button
          type="button"
          onClick={() => code.every((d) => d) && handleCodeComplete(code.join(''))}
          disabled={loading || !code.every((d) => d)}
          className="cta-primary py-3.5 px-5 bg-ink text-cream border-0 rounded-xl font-body text-[15px] font-semibold cursor-pointer w-full flex items-center justify-center gap-2.5 transition-all hover:bg-ink/90 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {loading ? 'Verificando...' : 'Verificar código'}
          <span className="arr transition-transform">→</span>
        </button>
      </form>

      <p className="legal-micro font-mono text-[10px] text-ink-3 tracking-wider leading-relaxed mt-7 text-center">
        POR SEGURANÇA, O CÓDIGO EXPIRA EM 15 MINUTOS.
        <br />
        NÃO COMPARTILHE COM NINGUÉM.
      </p>
    </AuthLayout>
  )
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-ink">Carregando...</div>
        </div>
      }
    >
      <VerifyCodeForm />
    </Suspense>
  )
}
