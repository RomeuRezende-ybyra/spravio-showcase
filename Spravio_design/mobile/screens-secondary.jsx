// Telas secundárias: Login, Onboarding, Budget, Developers
// iOS + Android no mesmo arquivo pra simplicidade.

// ===================== LOGIN iOS =====================
function LoginIOS() {
  return (
    <div style={{ height: '100%', background: SPR.cream, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic/>
      <IOSStatus/>
      {/* Decorative bg */}
      <div style={{ position: 'absolute', top: -40, right: -80, width: 260, height: 260, borderRadius: 400, background: `radial-gradient(circle, ${SPR.accentSoft} 0%, transparent 65%)`, opacity: 0.7, pointerEvents: 'none' }}/>
      <div style={{ padding: '60px 28px 32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: SPR.ink, color: SPR.accent, display: 'grid', placeItems: 'center', fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 20, fontStyle: 'italic' }}>s</div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 22, letterSpacing: '-0.02em', color: SPR.ink }}>Spravio</span>
        </div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 42, letterSpacing: '-0.025em', lineHeight: 1.02, color: SPR.ink, margin: 0 }}>
          Seus sprints, <span style={{ fontStyle: 'italic', color: SPR.accentDeep }}>honestos.</span>
        </h1>
        <p style={{ color: SPR.ink2, fontSize: 15, marginTop: 16, lineHeight: 1.5, maxWidth: 300 }}>Entre com a conta que você usa no Spravio web. Suporte a biometria depois do primeiro login.</p>

        {/* Fields */}
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.12, textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 15, color: SPR.ink }}>maria@studiolapa.co</div>
          </div>
          <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.12, textTransform: 'uppercase', marginBottom: 4 }}>Senha</div>
            <div style={{ fontSize: 15, color: SPR.ink, letterSpacing: 4 }}>••••••••••</div>
          </div>
          <button style={{ marginTop: 8, padding: 16, borderRadius: 14, background: SPR.ink, color: SPR.cream, border: 0, fontSize: 15, fontWeight: 600 }}>Entrar</button>
          <button style={{ padding: 12, background: 'none', border: 0, color: SPR.accentDeep, fontSize: 13, fontWeight: 500 }}>Esqueci a senha</button>
        </div>
      </div>
      <div style={{ padding: '20px 28px 40px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SPR.ink3, letterSpacing: 0.1 }}>
        NÃO TEM CONTA? PEÇA ACESSO NO SPRAVIO WEB.
      </div>
    </div>
  );
}

// ===================== ONBOARDING (push permission) iOS =====================
function OnboardingIOS() {
  return (
    <div style={{ height: '100%', background: SPR.cream, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic/>
      <IOSStatus/>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: i === 1 ? 24 : 6, height: 6, borderRadius: 100, background: i === 1 ? SPR.accent : SPR.rule2, transition: 'all .2s' }}/>
        ))}
      </div>

      <div style={{ flex: 1, padding: '40px 28px 28px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SPR.ink3, letterSpacing: 0.14, textTransform: 'uppercase' }}>02 / 03 · Notificações</span>

        {/* Illustration: mock notification card */}
        <div style={{ marginTop: 28, position: 'relative', height: 200 }}>
          <div style={{
            position: 'absolute', top: 40, left: 10, right: 30,
            background: `color-mix(in oklab, ${SPR.paper} 90%, transparent)`,
            border: `1px solid ${SPR.rule}`, borderRadius: 18, padding: 14,
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
            transform: 'rotate(-3deg)', opacity: 0.6,
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.1 }}>SPRAVIO · 2H</div>
            <div style={{ fontSize: 12, color: SPR.ink, marginTop: 4 }}>3 PRs aguardando review há +24h</div>
          </div>
          <div style={{
            position: 'absolute', top: 20, left: 20, right: 20,
            background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 18, padding: 16,
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.18)',
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: `color-mix(in oklab, ${SPR.bad} 15%, transparent)`, color: SPR.bad, display: 'grid', placeItems: 'center', fontSize: 16 }}>⚠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.1 }}>SPRAVIO · AGORA</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: SPR.ink, marginTop: 2 }}>PR #187 parado há 76h</div>
              <div style={{ fontSize: 11, color: SPR.ink3, marginTop: 2 }}>Banco Meridian · toque para agir</div>
            </div>
          </div>
        </div>

        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, letterSpacing: '-0.025em', lineHeight: 1.05, color: SPR.ink, margin: '36px 0 0' }}>
          Quer saber antes <span style={{ fontStyle: 'italic', color: SPR.accentDeep }}>do problema virar fogo?</span>
        </h1>
        <p style={{ color: SPR.ink2, fontSize: 14, marginTop: 14, lineHeight: 1.55 }}>
          A gente só te avisa do que importa: PR stale, sprint em risco, budget acima do limite. Nunca spam.
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ padding: 16, borderRadius: 14, background: SPR.ink, color: SPR.cream, border: 0, fontSize: 15, fontWeight: 600 }}>Ativar notificações</button>
          <button style={{ padding: 12, background: 'none', border: 0, color: SPR.ink3, fontSize: 13, fontWeight: 500 }}>Agora não</button>
        </div>
      </div>
    </div>
  );
}

// ===================== BUDGET iOS =====================
function BudgetIOS() {
  const spent = 92;
  const devs = [
    { name: 'Lucas F.', hours: 142, rate: 280, pct: 34 },
    { name: 'Renata K.', hours: 118, rate: 260, pct: 26 },
    { name: 'Sofia R.', hours: 96, rate: 260, pct: 21 },
    { name: 'Daniel P.', hours: 74, rate: 240, pct: 14 },
    { name: 'Outros', hours: 22, rate: 0, pct: 5 },
  ];
  return (
    <div style={{ height: '100%', background: SPR.cream, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic/>
      <IOSStatus/>
      <IOSHeader
        eyebrow="E-comm Vora · budget"
        title={<>Orçamento <em style={{ fontStyle: 'italic', color: SPR.bad }}>crítico.</em></>}
        onBack="Projeto"
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 40px' }}>

        {/* Gauge card */}
        <div style={{
          background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 18,
          padding: 20, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 160, height: 90 }}>
              <svg width="160" height="90" viewBox="0 0 160 90">
                <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke={SPR.cream2} strokeWidth="14" strokeLinecap="round"/>
                <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke={SPR.bad} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 60 * (spent / 100)} ${Math.PI * 60}`}/>
                <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke={SPR.warn} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 60 * 0.85} ${Math.PI * 60}`} opacity="0"/>
                {/* 85% tick */}
                <line x1={80 + 67 * Math.cos(Math.PI - Math.PI * 0.85)} y1={80 - 67 * Math.sin(Math.PI - Math.PI * 0.85)}
                      x2={80 + 53 * Math.cos(Math.PI - Math.PI * 0.85)} y2={80 - 53 * Math.sin(Math.PI - Math.PI * 0.85)}
                      stroke={SPR.ink} strokeWidth="1.5"/>
              </svg>
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 44, color: SPR.bad, lineHeight: 1 }}>{spent}<span style={{ fontSize: 18, color: SPR.ink3 }}>%</span></div>
                <div style={{ fontSize: 11, color: SPR.ink3, letterSpacing: 0.1, fontFamily: 'JetBrains Mono, monospace' }}>GASTO</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: SPR.ink2 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.12, textTransform: 'uppercase' }}>Budget total</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: SPR.ink, marginTop: 2 }}>R$ 148.000</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.12, textTransform: 'uppercase' }}>Consumido</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: SPR.bad, marginTop: 2 }}>R$ 136.160</div>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div style={{
          background: `color-mix(in oklab, ${SPR.bad} 8%, ${SPR.paper})`,
          border: `1px solid color-mix(in oklab, ${SPR.bad} 25%, ${SPR.rule})`,
          borderRadius: 14, padding: 12, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `color-mix(in oklab, ${SPR.bad} 15%, transparent)`, color: SPR.bad, display: 'grid', placeItems: 'center', fontSize: 14 }}>⚠</div>
          <div style={{ flex: 1, fontSize: 12, color: SPR.ink2 }}>Ultrapassou 85%. <strong style={{ color: SPR.ink }}>Cliente foi notificado?</strong></div>
        </div>

        {/* Breakdown */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SPR.ink3, letterSpacing: 0.14, textTransform: 'uppercase', padding: '4px 6px 10px' }}>Breakdown por dev</div>
        <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, overflow: 'hidden' }}>
          {devs.map((d, i) => (
            <div key={d.name} style={{ padding: 14, borderTop: i > 0 ? `1px solid ${SPR.rule}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: SPR.ink }}>{d.name}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: SPR.ink2 }}>{d.hours}h{d.rate > 0 ? ` × R$${d.rate}` : ''}</span>
              </div>
              <div style={{ height: 4, background: SPR.cream2, borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ width: `${d.pct * 2.5}%`, maxWidth: '100%', height: '100%', background: SPR.accent }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Log hours */}
        <button style={{
          marginTop: 14, width: '100%', padding: 14, borderRadius: 14,
          background: SPR.ink, color: SPR.cream, border: 0,
          fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Lançar horas
        </button>
      </div>
    </div>
  );
}

// ===================== DEVELOPERS SCORECARD iOS =====================
function DevelopersIOS() {
  const devs = [
    { name: 'Lucas F.', initials: 'LF', role: 'Senior Backend', cards: 18, pr: 12, stale: 2, velocity: 24, trend: 'down' },
    { name: 'Renata K.', initials: 'RK', role: 'Full-stack', cards: 22, pr: 15, stale: 0, velocity: 32, trend: 'up' },
    { name: 'Sofia R.', initials: 'SR', role: 'Frontend', cards: 16, pr: 11, stale: 1, velocity: 28, trend: 'up' },
    { name: 'Daniel P.', initials: 'DP', role: 'Mobile', cards: 12, pr: 8, stale: 0, velocity: 19, trend: 'flat' },
  ];
  const trendIcon = {
    up: <span style={{ color: SPR.good }}>↑</span>,
    down: <span style={{ color: SPR.bad }}>↓</span>,
    flat: <span style={{ color: SPR.ink3 }}>→</span>,
  };
  return (
    <div style={{ height: '100%', background: SPR.cream, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic/>
      <IOSStatus/>
      <IOSHeader
        eyebrow="Banco Meridian · time"
        title={<>O <em style={{ fontStyle: 'italic', color: SPR.accentDeep }}>time.</em></>}
        onBack="Projeto"
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 40px' }}>

        {/* Sprint summary */}
        <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, padding: 14, marginBottom: 14, display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 400, color: SPR.ink, lineHeight: 1 }}>4</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase', marginTop: 4 }}>Devs</div>
          </div>
          <div style={{ width: 1, background: SPR.rule }}/>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 400, color: SPR.ink, lineHeight: 1 }}>68</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase', marginTop: 4 }}>Cards</div>
          </div>
          <div style={{ width: 1, background: SPR.rule }}/>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 400, color: SPR.bad, lineHeight: 1 }}>3</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase', marginTop: 4 }}>Stale</div>
          </div>
        </div>

        {/* Dev cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {devs.map(d => (
            <div key={d.name} style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 100, background: SPR.accentSoft, color: SPR.accentDeep, display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13 }}>{d.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: SPR.ink }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: SPR.ink3 }}>{d.role}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: SPR.ink }}>
                  {d.velocity} {trendIcon[d.trend]}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${SPR.rule}` }}>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase' }}>Cards</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: SPR.ink, marginTop: 2 }}>{d.cards}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase' }}>PRs</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: SPR.ink, marginTop: 2 }}>{d.pr}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase' }}>Stale</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: d.stale > 0 ? SPR.bad : SPR.ink3, marginTop: 2 }}>{d.stale}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// ANDROID VERSIONS
// ======================================================================

// ===================== LOGIN Android =====================
function LoginAnd() {
  return (
    <div style={{ height: '100%', background: AND_C.bg, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, right: -80, width: 260, height: 260, borderRadius: 400, background: `radial-gradient(circle, ${AND_C.primaryContainer} 0%, transparent 65%)`, opacity: 0.8, pointerEvents: 'none' }}/>
      <div style={{ padding: '60px 28px 32px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: AND_C.onSurface, color: AND_C.primary, display: 'grid', placeItems: 'center', fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 20, fontStyle: 'italic' }}>s</div>
          <span style={{ fontFamily: 'Roboto, system-ui', fontWeight: 500, fontSize: 20, color: AND_C.onSurface }}>Spravio</span>
        </div>
        <h1 style={{ fontFamily: 'Roboto, system-ui', fontWeight: 400, fontSize: 34, lineHeight: 1.1, color: AND_C.onSurface, margin: 0 }}>
          Bem-vinda de volta
        </h1>
        <p style={{ color: AND_C.onSurfaceVar, fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>Entre com a conta que você usa no Spravio web.</p>

        {/* M3 outlined text fields */}
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              border: `1px solid ${AND_C.outline}`, borderRadius: 4, padding: '12px 14px', background: 'transparent',
            }}>
              <div style={{ position: 'absolute', top: -7, left: 10, padding: '0 4px', background: AND_C.bg, fontSize: 12, color: AND_C.onSurfaceVar, fontFamily: 'Roboto, system-ui' }}>Email</div>
              <div style={{ fontSize: 15, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui' }}>maria@studiolapa.co</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              border: `2px solid ${AND_C.primary}`, borderRadius: 4, padding: '12px 14px', background: 'transparent',
            }}>
              <div style={{ position: 'absolute', top: -7, left: 10, padding: '0 4px', background: AND_C.bg, fontSize: 12, color: AND_C.primary, fontFamily: 'Roboto, system-ui', fontWeight: 500 }}>Senha</div>
              <div style={{ fontSize: 15, color: AND_C.onSurface, letterSpacing: 4 }}>••••••••••</div>
            </div>
          </div>
          <button style={{ marginTop: 12, padding: 14, borderRadius: 100, background: AND_C.primary, color: '#fff', border: 0, fontSize: 14, fontWeight: 500, fontFamily: 'Roboto, system-ui' }}>Entrar</button>
          <button style={{ padding: 10, background: 'none', border: 0, color: AND_C.primaryDeep, fontSize: 13, fontWeight: 500, fontFamily: 'Roboto, system-ui' }}>Esqueci a senha</button>
        </div>
      </div>
      <div style={{ padding: '20px 28px 24px', textAlign: 'center', fontFamily: 'Roboto, system-ui', fontSize: 12, color: AND_C.onSurfaceMuted }}>
        Não tem conta? Peça acesso no Spravio web.
      </div>
    </div>
  );
}

// ===================== ONBOARDING Android =====================
function OnboardingAnd() {
  return (
    <div style={{ height: '100%', background: AND_C.bg, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 16 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: i === 1 ? 24 : 6, height: 6, borderRadius: 100, background: i === 1 ? AND_C.primary : AND_C.outline }}/>
        ))}
      </div>

      <div style={{ flex: 1, padding: '32px 28px 28px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: AND_C.onSurfaceMuted, letterSpacing: 0.14, textTransform: 'uppercase' }}>02 / 03 · Notificações</span>

        <div style={{ marginTop: 24, position: 'relative', height: 200 }}>
          <div style={{
            position: 'absolute', top: 20, left: 20, right: 20,
            background: AND_C.surface, borderRadius: 12, padding: 14,
            boxShadow: '0 16px 36px -10px rgba(0,0,0,0.15)',
            display: 'flex', gap: 12, alignItems: 'center',
            border: `1px solid ${AND_C.outlineVariant}`,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 100, background: `color-mix(in oklab, ${AND_C.bad} 15%, transparent)`, color: AND_C.bad, display: 'grid', placeItems: 'center', fontSize: 15 }}>⚠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Roboto, system-ui', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.1, textTransform: 'uppercase' }}>SPRAVIO · AGORA</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: AND_C.onSurface, marginTop: 2, fontFamily: 'Roboto, system-ui' }}>PR #187 parado há 76h</div>
              <div style={{ fontSize: 11, color: AND_C.onSurfaceMuted, marginTop: 2 }}>Banco Meridian · toque para agir</div>
            </div>
          </div>
        </div>

        <h1 style={{ fontFamily: 'Roboto, system-ui', fontWeight: 400, fontSize: 26, lineHeight: 1.15, color: AND_C.onSurface, margin: '36px 0 0' }}>
          Saber antes do problema virar fogo
        </h1>
        <p style={{ color: AND_C.onSurfaceVar, fontSize: 13, marginTop: 12, lineHeight: 1.55 }}>
          Só te avisamos do que importa: PR stale, sprint em risco, budget acima do limite. Nunca spam.
        </p>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{ padding: 14, borderRadius: 100, background: AND_C.primary, color: '#fff', border: 0, fontSize: 14, fontWeight: 500, fontFamily: 'Roboto, system-ui' }}>Ativar notificações</button>
          <button style={{ padding: 10, background: 'none', border: 0, color: AND_C.primaryDeep, fontSize: 13, fontWeight: 500, fontFamily: 'Roboto, system-ui' }}>Agora não</button>
        </div>
      </div>
    </div>
  );
}

// ===================== BUDGET Android =====================
function BudgetAnd() {
  const spent = 92;
  const devs = [
    { name: 'Lucas F.', hours: 142, rate: 280, pct: 34 },
    { name: 'Renata K.', hours: 118, rate: 260, pct: 26 },
    { name: 'Sofia R.', hours: 96, rate: 260, pct: 21 },
    { name: 'Daniel P.', hours: 74, rate: 240, pct: 14 },
    { name: 'Outros', hours: 22, rate: 0, pct: 5 },
  ];
  return (
    <div style={{ height: '100%', background: AND_C.bg, display: 'flex', flexDirection: 'column' }}>
      <AndTopBar
        title="Orçamento"
        subtitle="E-COMM VORA · CRÍTICO"
        leading={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AND_C.onSurface} strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px' }}>

        <div style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 160, height: 90 }}>
              <svg width="160" height="90" viewBox="0 0 160 90">
                <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke={AND_C.surfaceVar} strokeWidth="14" strokeLinecap="round"/>
                <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke={AND_C.bad} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 60 * (spent / 100)} ${Math.PI * 60}`}/>
              </svg>
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Roboto, system-ui', fontWeight: 400, fontSize: 40, color: AND_C.bad, lineHeight: 1 }}>{spent}<span style={{ fontSize: 16, color: AND_C.onSurfaceMuted }}>%</span></div>
                <div style={{ fontSize: 10, color: AND_C.onSurfaceMuted, letterSpacing: 0.1, fontFamily: 'JetBrains Mono, monospace' }}>GASTO</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: AND_C.onSurfaceVar }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.12 }}>BUDGET TOTAL</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: AND_C.onSurface, marginTop: 2 }}>R$ 148.000</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.12 }}>CONSUMIDO</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: AND_C.bad, marginTop: 2 }}>R$ 136.160</div>
            </div>
          </div>
        </div>

        <div style={{ background: `color-mix(in oklab, ${AND_C.bad} 10%, ${AND_C.surface})`, border: `1px solid color-mix(in oklab, ${AND_C.bad} 25%, ${AND_C.outlineVariant})`, borderRadius: 12, padding: 12, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: 100, background: `color-mix(in oklab, ${AND_C.bad} 15%, transparent)`, color: AND_C.bad, display: 'grid', placeItems: 'center', fontSize: 14 }}>⚠</div>
          <div style={{ flex: 1, fontSize: 12, color: AND_C.onSurfaceVar, fontFamily: 'Roboto, system-ui' }}>Ultrapassou 85%. <strong style={{ color: AND_C.onSurface }}>Cliente foi notificado?</strong></div>
        </div>

        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: AND_C.onSurfaceMuted, letterSpacing: 0.14, padding: '4px 4px 10px' }}>BREAKDOWN POR DEV</div>
        <div style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, overflow: 'hidden' }}>
          {devs.map((d, i) => (
            <div key={d.name} style={{ padding: 14, borderTop: i > 0 ? `1px solid ${AND_C.outlineVariant}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui' }}>{d.name}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: AND_C.onSurfaceVar }}>{d.hours}h{d.rate > 0 ? ` × R$${d.rate}` : ''}</span>
              </div>
              <div style={{ height: 4, background: AND_C.surfaceVar, borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ width: `${d.pct * 2.5}%`, maxWidth: '100%', height: '100%', background: AND_C.primary }}/>
              </div>
            </div>
          ))}
        </div>

        <button style={{
          marginTop: 14, width: '100%', padding: 14, borderRadius: 100,
          background: AND_C.primary, color: '#fff', border: 0,
          fontSize: 14, fontWeight: 500, fontFamily: 'Roboto, system-ui',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Lançar horas
        </button>
      </div>
    </div>
  );
}

// ===================== DEVELOPERS Android =====================
function DevelopersAnd() {
  const devs = [
    { name: 'Lucas F.', initials: 'LF', role: 'Senior Backend', cards: 18, pr: 12, stale: 2, velocity: 24, trend: 'down' },
    { name: 'Renata K.', initials: 'RK', role: 'Full-stack', cards: 22, pr: 15, stale: 0, velocity: 32, trend: 'up' },
    { name: 'Sofia R.', initials: 'SR', role: 'Frontend', cards: 16, pr: 11, stale: 1, velocity: 28, trend: 'up' },
    { name: 'Daniel P.', initials: 'DP', role: 'Mobile', cards: 12, pr: 8, stale: 0, velocity: 19, trend: 'flat' },
  ];
  const trendIcon = {
    up: <span style={{ color: AND_C.good }}>↑</span>,
    down: <span style={{ color: AND_C.bad }}>↓</span>,
    flat: <span style={{ color: AND_C.onSurfaceMuted }}>→</span>,
  };
  return (
    <div style={{ height: '100%', background: AND_C.bg, display: 'flex', flexDirection: 'column' }}>
      <AndTopBar
        title="Time"
        subtitle="BANCO MERIDIAN · 4 DEVS"
        leading={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AND_C.onSurface} strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 24px' }}>

        <div style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 14, marginBottom: 14, display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Roboto, system-ui', fontSize: 24, fontWeight: 400, color: AND_C.onSurface, lineHeight: 1 }}>4</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: AND_C.onSurfaceMuted, letterSpacing: 0.1, marginTop: 4 }}>DEVS</div>
          </div>
          <div style={{ width: 1, background: AND_C.outlineVariant }}/>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Roboto, system-ui', fontSize: 24, fontWeight: 400, color: AND_C.onSurface, lineHeight: 1 }}>68</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: AND_C.onSurfaceMuted, letterSpacing: 0.1, marginTop: 4 }}>CARDS</div>
          </div>
          <div style={{ width: 1, background: AND_C.outlineVariant }}/>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Roboto, system-ui', fontSize: 24, fontWeight: 400, color: AND_C.bad, lineHeight: 1 }}>3</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: AND_C.onSurfaceMuted, letterSpacing: 0.1, marginTop: 4 }}>STALE</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {devs.map(d => (
            <div key={d.name} style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 100, background: AND_C.primaryContainer, color: AND_C.onPrimaryContainer, display: 'grid', placeItems: 'center', fontWeight: 500, fontSize: 13 }}>{d.initials}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui' }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: AND_C.onSurfaceMuted }}>{d.role}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: AND_C.onSurface }}>
                  {d.velocity} {trendIcon[d.trend]}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${AND_C.outlineVariant}` }}>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.1 }}>CARDS</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: AND_C.onSurface, marginTop: 2 }}>{d.cards}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.1 }}>PRS</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: AND_C.onSurface, marginTop: 2 }}>{d.pr}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.1 }}>STALE</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: d.stale > 0 ? AND_C.bad : AND_C.onSurfaceMuted, marginTop: 2 }}>{d.stale}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  LoginIOS, OnboardingIOS, BudgetIOS, DevelopersIOS,
  LoginAnd, OnboardingAnd, BudgetAnd, DevelopersAnd,
});
