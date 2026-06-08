'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordStrength } from '@/components/auth/password-strength'
import { Lock, Eye, EyeOff, Check } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3010'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoutOthers, setLogoutOthers] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    // Validate password strength (basic check)
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Token inválido ou expirado')
      }

      // TODO: If logoutOthers is true, implement session invalidation

      // Redirect to login with success message
      router.push('/login?reset=success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-ink text-center">
          <p className="text-lg font-medium">Link inválido</p>
          <a href="/forgot-password" className="text-accent-deep hover:underline mt-2 inline-block">
            Solicitar novo código
          </a>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout
      brandEyebrow="Último passo"
      brandTitle={
        <>
          Senha forte, <em className="italic text-accent">sprint sossegado.</em>
        </>
      }
      brandSubtitle="Escolha uma senha que só você conhece. A gente usa bcrypt, criptografia em trânsito e em repouso — nem nossos devs veem sua senha."
      brandContent={
        <>
          <div className="mt-9 p-4 rounded-xl bg-good/18 border border-good/35">
            <div className="flex items-center gap-2.5 text-cream font-medium text-sm">
              <Check className="w-[18px] h-[18px]" />
              Código verificado
            </div>
            <div className="text-xs text-cream/70 mt-1.5 leading-relaxed">
              Sua identidade foi confirmada. Agora é só definir uma nova senha e você volta direto
              pro seu portfólio.
            </div>
          </div>
          <div className="mt-6 font-mono text-[10px] tracking-[0.12em] text-cream/55 uppercase">
            🔒 HASH COM BCRYPT · TLS 1.3 · GDPR/LGPD
          </div>
        </>
      }
    >
      <span className="form-eyebrow font-mono text-[11px] tracking-[0.14em] uppercase text-accent-deep font-medium inline-flex items-center gap-3">
        <span className="w-6 h-px bg-accent" />
        Passo 3 de 3
      </span>
      <h2 className="form-title font-display font-light text-[42px] leading-tight tracking-tight mt-4">
        Defina uma <em className="italic text-accent-deep">nova senha.</em>
      </h2>
      <p className="form-sub mt-3.5 text-ink-2 text-[15px] leading-relaxed">
        Use uma senha forte que você não usa em nenhum outro lugar. Gerenciador de senhas funciona
        — recomendamos.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
        <div className="field flex flex-col gap-1.5">
          <label htmlFor="password" className="field-label font-body text-xs font-medium text-ink-2">
            Nova senha
          </label>
          <div className="field-wrap relative">
            <Lock className="icn absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="input w-full py-3 pl-11 pr-12 bg-paper border border-rule-2 rounded-xl font-body text-sm text-ink placeholder:text-ink-3 transition-all focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20"
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="trail-btn absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 text-ink-3 hover:text-ink cursor-pointer p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        <div className="field flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="field-label font-body text-xs font-medium text-ink-2"
          >
            Confirme a senha
          </label>
          <div className="field-wrap relative">
            <Lock className="icn absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input w-full py-3 pl-11 pr-12 bg-paper border border-rule-2 rounded-xl font-body text-sm text-ink placeholder:text-ink-3 transition-all focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20"
              placeholder="Digite novamente"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="trail-btn absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 text-ink-3 hover:text-ink cursor-pointer p-1"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="checkbox flex items-center gap-2.5 text-[13px] text-ink-2 cursor-pointer select-none mt-1">
          <input
            type="checkbox"
            checked={logoutOthers}
            onChange={(e) => setLogoutOthers(e.target.checked)}
            className="w-[18px] h-[18px] rounded-md border border-rule-2 bg-paper cursor-pointer"
          />
          Desconectar de outros dispositivos
        </label>

        {error && <p className="text-xs text-bad">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="cta-primary py-3.5 px-5 bg-ink text-cream border-0 rounded-xl font-body text-[15px] font-semibold cursor-pointer w-full flex items-center justify-center gap-2.5 transition-all hover:bg-ink/90 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Atualizando...' : 'Atualizar senha e entrar'}
          <span className="arr transition-transform">→</span>
        </button>
      </form>

      <p className="legal-micro font-mono text-[10px] text-ink-3 tracking-wider leading-relaxed mt-8 text-center">
        VOCÊ SERÁ REDIRECIONADO AO SEU PORTFÓLIO.
        <br />
        SESSÕES ANTERIORES PODEM CONTINUAR ATIVAS SE DESMARCADO.
      </p>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-ink">Carregando...</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
