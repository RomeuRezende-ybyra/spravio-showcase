'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout, AuthProgressSteps } from '@/components/auth/auth-layout'
import { Mail } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3010'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset code')
      }

      // Navigate to verify page with email in query
      router.push(`/verify-code?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar código')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { label: 'Informe seu email', description: 'Enviamos um código de 6 dígitos' },
    { label: 'Confirme o código', description: 'Válido por 15 minutos' },
    { label: 'Defina nova senha', description: 'E pronto, você volta' },
  ]

  return (
    <AuthLayout
      brandEyebrow="Acontece"
      brandTitle={
        <>
          Sem drama. <em className="italic text-accent">A gente resolve.</em>
        </>
      }
      brandSubtitle="Esquecer senha é universal. Em 3 passos você volta pro seu portfólio — sem perder nenhuma configuração ou dado."
      brandContent={<AuthProgressSteps steps={steps} currentStep={0} />}
      formHeader={
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-accent-deep font-body font-medium text-[13px] hover:underline"
        >
          <span>←</span> Voltar ao login
        </Link>
      }
    >
      <span className="form-eyebrow font-mono text-[11px] tracking-[0.14em] uppercase text-accent-deep font-medium inline-flex items-center gap-3">
        <span className="w-6 h-px bg-accent" />
        Passo 1 de 3
      </span>
      <h2 className="form-title font-display font-light text-[42px] leading-tight tracking-tight mt-4">
        Redefinir <em className="italic text-accent-deep">senha.</em>
      </h2>
      <p className="form-sub mt-3.5 text-ink-2 text-[15px] leading-relaxed">
        Informe o email da sua conta. Vamos enviar um código de 6 dígitos para você confirmar.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
        <div className="field flex flex-col gap-1.5">
          <label htmlFor="email" className="field-label font-body text-xs font-medium text-ink-2">
            Email da conta
          </label>
          <div className="field-wrap relative">
            <Mail className="icn absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="input w-full py-3 pl-11 pr-3.5 bg-paper border border-rule-2 rounded-xl font-body text-sm text-ink placeholder:text-ink-3 transition-all focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20"
              placeholder="voce@empresa.com"
            />
          </div>
        </div>

        {error && <p className="text-xs text-bad">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="cta-primary py-3.5 px-5 bg-ink text-cream border-0 rounded-xl font-body text-[15px] font-semibold cursor-pointer w-full flex items-center justify-center gap-2.5 transition-all hover:bg-ink/90 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar código de recuperação'}
          <span className="arr transition-transform">→</span>
        </button>
      </form>

      <div className="form-foot mt-7 text-center text-[13px] text-ink-2">
        Lembrou agora?{' '}
        <Link href="/login" className="text-accent-deep font-medium ml-1 hover:underline">
          Entrar
        </Link>
      </div>

      <p className="legal-micro font-mono text-[10px] text-ink-3 tracking-wider leading-relaxed mt-8 text-center">
        NÃO RECEBEU? CHEQUE O SPAM OU ENTRE EM CONTATO
        <br />
        <a href="mailto:suporte@spravio.io" className="text-ink-2 underline decoration-rule-2">
          SUPORTE@SPRAVIO.IO
        </a>
      </p>
    </AuthLayout>
  )
}
