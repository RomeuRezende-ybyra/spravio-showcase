'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/auth-layout'
import { PasswordStrength } from '@/components/auth/password-strength'
import { Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3010'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agencyName, setAgencyName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!acceptTerms) {
      setError('Você deve aceitar os termos e a política de privacidade')
      return
    }

    setLoading(true)

    try {
      console.log('🔍 Registering user at:', `${API_URL}/auth/register`)
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, agencyName }),
      })

      console.log('📡 Response status:', res.status)
      const data = await res.json()
      console.log('📦 Response data:', data)

      if (!res.ok) {
        setError(data.error?.message ?? 'Erro ao criar conta')
        setLoading(false)
        return
      }

      // Establish NextAuth session
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Conta criada, mas erro ao fazer login. Faça login manualmente.')
        setLoading(false)
        return
      }

      router.push('/portfolio')
      router.refresh()
    } catch (err) {
      console.error('❌ Registration error:', err)
      setError(`Erro ao criar conta: ${err instanceof Error ? err.message : 'Tente novamente.'}`)
      setLoading(false)
    }
  }

  async function handleSSO(provider: 'google' | 'github') {
    // TODO: Implement SSO providers in NextAuth config
    await signIn(provider, { callbackUrl: '/portfolio' })
  }

  return (
    <AuthLayout
      brandEyebrow="Comece grátis"
      brandTitle={
        <>
          Honestidade <em className="italic text-accent">que escala.</em>
        </>
      }
      brandSubtitle="De freelancer solo a agência com 50 pessoas — o Spravio cresce contigo. Comece com um trial de 14 dias. Sem cartão, sem compromisso."
      brandContent={
        <div className="flex flex-col gap-0.5 mt-10">
          {[
            { icon: '✓', label: 'Ilimitado projetos e usuários', note: '(no plano Studio)' },
            { icon: '✓', label: 'Suporte a 14 integrações', note: 'Jira, Azure, Trello...' },
            { icon: '✓', label: 'Forecasting com IA', note: 'Powered by Claude Sonnet' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-4 items-center py-3.5 border-b border-cream/15 last:border-0"
            >
              <div className="w-7 h-7 rounded-full bg-accent/20 text-accent grid place-items-center font-body font-semibold text-sm">
                {item.icon}
              </div>
              <div>
                <div className="text-cream font-medium text-sm">{item.label}</div>
                <div className="text-cream/55 text-xs mt-0.5">{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      }
      formHeader={
        <>
          <span className="text-ink-3">Já tem conta?</span>
          <Link
            href="/login"
            className="text-accent-deep font-body font-medium text-[13px] hover:underline"
          >
            Entrar →
          </Link>
        </>
      }
    >
      <span className="form-eyebrow font-mono text-[11px] tracking-[0.14em] uppercase text-accent-deep font-medium inline-flex items-center gap-3">
        <span className="w-6 h-px bg-accent" />
        Cadastro
      </span>
      <h2 className="form-title font-display font-light text-[42px] leading-tight tracking-tight mt-4">
        Trial de <em className="italic text-accent-deep">14 dias.</em>
      </h2>
      <p className="form-sub mt-3.5 text-ink-2 text-[15px] leading-relaxed">
        Crie sua conta em 30 segundos. Comece a rastrear seus sprints hoje — sem cartão, sem
        compromisso.
      </p>

      {/* SSO buttons */}
      <div className="sso-block flex flex-col gap-2.5 mt-8">
        <button
          onClick={() => handleSSO('google')}
          type="button"
          className="sso-btn flex items-center justify-center gap-2.5 px-5 py-3 bg-paper border border-rule-2 rounded-xl font-body text-sm font-medium text-ink hover:bg-cream-2 hover:border-ink-3 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
            />
          </svg>
          Continuar com Google
        </button>
        <button
          onClick={() => handleSSO('github')}
          type="button"
          className="sso-btn flex items-center justify-center gap-2.5 px-5 py-3 bg-paper border border-rule-2 rounded-xl font-body text-sm font-medium text-ink hover:bg-cream-2 hover:border-ink-3 transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a140c">
            <path d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.7 18.6.3 12 .3z" />
          </svg>
          Continuar com GitHub
        </button>
      </div>

      <div className="divider flex items-center gap-3.5 my-5 font-mono text-[10px] tracking-[0.14em] uppercase text-ink-3">
        <span className="flex-1 h-px bg-rule" />
        Ou preencha abaixo
        <span className="flex-1 h-px bg-rule" />
      </div>

      {/* Register form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="field flex flex-col gap-1.5">
            <label htmlFor="name" className="field-label font-body text-xs font-medium text-ink-2">
              Seu nome
            </label>
            <div className="field-wrap relative">
              <User className="icn absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input w-full py-3 pl-11 pr-3.5 bg-paper border border-rule-2 rounded-xl font-body text-sm text-ink placeholder:text-ink-3 transition-all focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20"
                placeholder="Maria Silva"
              />
            </div>
          </div>

          <div className="field flex flex-col gap-1.5">
            <label
              htmlFor="agencyName"
              className="field-label font-body text-xs font-medium text-ink-2"
            >
              Empresa
            </label>
            <div className="field-wrap relative">
              <Building className="icn absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4" />
              <input
                id="agencyName"
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                required
                className="input w-full py-3 pl-11 pr-3.5 bg-paper border border-rule-2 rounded-xl font-body text-sm text-ink placeholder:text-ink-3 transition-all focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20"
                placeholder="Studio Lapa"
              />
            </div>
          </div>
        </div>

        <div className="field flex flex-col gap-1.5">
          <label htmlFor="email" className="field-label font-body text-xs font-medium text-ink-2">
            Email do trabalho
          </label>
          <div className="field-wrap relative">
            <Mail className="icn absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input w-full py-3 pl-11 pr-3.5 bg-paper border border-rule-2 rounded-xl font-body text-sm text-ink placeholder:text-ink-3 transition-all focus:outline-none focus:border-accent focus:ring-3 focus:ring-accent/20"
              placeholder="voce@empresa.com"
            />
          </div>
        </div>

        <div className="field flex flex-col gap-1.5">
          <label htmlFor="password" className="field-label font-body text-xs font-medium text-ink-2">
            Senha
          </label>
          <div className="field-wrap relative">
            <Lock className="icn absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 w-4 h-4" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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

        <label className="checkbox flex items-start gap-2.5 text-[12px] text-ink-2 cursor-pointer select-none mt-1 leading-snug">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-[18px] h-[18px] rounded-md border border-rule-2 bg-paper cursor-pointer mt-0.5"
          />
          <span>
            Aceito os{' '}
            <a href="/terms" className="text-accent-deep hover:underline">
              termos
            </a>{' '}
            e a{' '}
            <a href="/privacy" className="text-accent-deep hover:underline">
              política de privacidade
            </a>
          </span>
        </label>

        {error && <p className="text-xs text-bad">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="cta-primary py-3.5 px-5 bg-ink text-cream border-0 rounded-xl font-body text-[15px] font-semibold cursor-pointer w-full flex items-center justify-center gap-2.5 transition-all hover:bg-ink/90 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Criando conta...' : 'Criar conta grátis'}
          <span className="arr transition-transform">→</span>
        </button>
      </form>

      <p className="legal-micro font-mono text-[10px] text-ink-3 tracking-wider leading-relaxed mt-5 text-center">
        AO CONTINUAR VOCÊ INICIA UM TRIAL DE 14 DIAS.
        <br />
        SEM CARTÃO. CANCELE QUANDO QUISER.
      </p>
    </AuthLayout>
  )
}
