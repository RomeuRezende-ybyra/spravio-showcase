// Telas Android (Material 3) do Spravio Mobile
// Segue o mesmo layout conceitual das telas iOS, adaptando para M3:
// - Sem large title Fraunces: uso Roboto Flex/Inter, Medium Title
// - Chips M3, cards com elevation sutil, FAB onde fizer sentido
// - Bottom nav bar M3 (5 itens)
// - Status bar e nav gesture vêm do AndroidDevice

const AND_C = {
  bg: 'oklch(0.975 0.012 75)',       // cream (mantém identidade)
  surface: 'oklch(0.99 0.008 80)',   // paper
  surfaceVar: 'oklch(0.955 0.018 72)',
  outline: 'oklch(0.82 0.02 55)',
  outlineVariant: 'oklch(0.88 0.015 60)',
  onSurface: 'oklch(0.22 0.02 40)',
  onSurfaceVar: 'oklch(0.36 0.02 40)',
  onSurfaceMuted: 'oklch(0.56 0.015 45)',
  primary: 'oklch(0.62 0.14 35)',
  primaryDeep: 'oklch(0.42 0.12 35)',
  primaryContainer: 'oklch(0.92 0.06 35)',
  onPrimaryContainer: 'oklch(0.42 0.12 35)',
  good: 'oklch(0.58 0.12 145)',
  warn: 'oklch(0.72 0.15 75)',
  bad: 'oklch(0.58 0.18 25)',
};

const andHealthColor = (h) => h === 'on-track' ? AND_C.good : h === 'at-risk' ? AND_C.warn : AND_C.bad;
const andHealthLabel = (h) => h === 'on-track' ? 'On track' : h === 'at-risk' ? 'Em risco' : 'Atrasado';

// ============== Top App Bar (center-aligned M3) ==============
function AndTopBar({ title, subtitle, leading, trailing }) {
  return (
    <div style={{ background: AND_C.bg, padding: '8px 4px 4px' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
        <div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center' }}>
          {leading || (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AND_C.onSurface} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          )}
        </div>
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui', letterSpacing: 0.15 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: AND_C.onSurfaceMuted, marginTop: 2, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.08 }}>{subtitle}</div>}
        </div>
        <div style={{ width: 48, height: 48, display: 'grid', placeItems: 'center' }}>
          {trailing || <div style={{ width: 32, height: 32, borderRadius: 100, background: AND_C.primary, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>MS</div>}
        </div>
      </div>
    </div>
  );
}

// ============== Bottom nav bar M3 ==============
function AndBottomNav({ active = 'portfolio' }) {
  const tabs = [
    { id: 'portfolio', label: 'Portfólio', icon: (c, on) => <svg width="24" height="24" viewBox="0 0 24 24" fill={on ? c : 'none'} stroke={c} strokeWidth="1.6"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg> },
    { id: 'sprint', label: 'Sprint', icon: (c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg> },
    { id: 'prs', label: 'PRs', icon: (c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7"/><path d="M8.3 6.5c5 0 7 2 7 5.5"/></svg> },
    { id: 'inbox', label: 'Inbox', icon: (c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M4 6h16v10H7l-3 3z"/></svg> },
    { id: 'me', label: 'Eu', icon: (c) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg> },
  ];
  return (
    <div style={{ background: AND_C.surface, borderTop: `1px solid ${AND_C.outlineVariant}`, padding: '6px 4px', display: 'flex', justifyContent: 'space-around' }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 12px', flex: 1 }}>
            <div style={{
              padding: '4px 16px', borderRadius: 100,
              background: on ? AND_C.primaryContainer : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {t.icon(on ? AND_C.primaryDeep : AND_C.onSurfaceVar, on)}
            </div>
            <span style={{ fontSize: 10, color: on ? AND_C.onSurface : AND_C.onSurfaceMuted, fontWeight: on ? 600 : 500, fontFamily: 'Roboto, system-ui', letterSpacing: 0.4 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============== M3 Chip (filter) ==============
function AndChip({ on, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 8,
      border: `1px solid ${on ? 'transparent' : AND_C.outline}`,
      background: on ? AND_C.primaryContainer : 'transparent',
      color: on ? AND_C.onPrimaryContainer : AND_C.onSurface,
      fontSize: 13, fontWeight: 500, fontFamily: 'Roboto, system-ui',
      whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>}
      {children}
    </button>
  );
}

// ============== Health chip M3 ==============
function AndHealthChip({ h }) {
  const c = andHealthColor(h);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 8,
      background: `color-mix(in oklab, ${c} 14%, transparent)`, color: c,
      fontFamily: 'Roboto, system-ui', fontSize: 11, fontWeight: 500, letterSpacing: 0.3,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 100, background: c }}/>
      {andHealthLabel(h)}
    </span>
  );
}

// ============== Portfolio Card (Android / M3) ==============
function PortfolioCardAnd({ p }) {
  const c = andHealthColor(p.health);
  return (
    <div style={{
      background: AND_C.surface, borderRadius: 12, padding: 16, marginBottom: 8,
      border: `1px solid ${AND_C.outlineVariant}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: AND_C.primaryContainer,
          color: AND_C.onPrimaryContainer, display: 'grid', placeItems: 'center',
          fontFamily: 'Roboto, system-ui', fontSize: 12, fontWeight: 500,
        }}>{p.key}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui', letterSpacing: 0.15 }}>{p.name}</h3>
          <div style={{ fontSize: 12, color: AND_C.onSurfaceMuted, marginTop: 3 }}>{p.sprintName} · {p.gpInitials} · {p.devs} devs</div>
        </div>
        <AndHealthChip h={p.health}/>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: AND_C.onSurfaceMuted }}>
          <span>{p.cards.done}/{p.cards.total} cards concluídos</span>
          <span><strong style={{ color: AND_C.onSurface }}>IA {p.forecast}%</strong> no prazo</span>
        </div>
        <div style={{ height: 4, background: AND_C.surfaceVar, borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ width: `${p.progress}%`, height: '100%', background: c, borderRadius: 100 }}/>
        </div>
      </div>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${AND_C.outlineVariant}`, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: AND_C.onSurfaceVar }}>
        <span>Budget <strong style={{ color: p.budget > 85 ? AND_C.bad : AND_C.onSurface, fontWeight: 600 }}>{p.budget}%</strong></span>
        {p.prStale > 0 && <span style={{ color: AND_C.bad, fontWeight: 500 }}>⚠ {p.prStale} PR{p.prStale > 1 ? 's' : ''} stale</span>}
      </div>
    </div>
  );
}

// ============== Portfolio Screen (Android) ==============
function PortfolioAnd() {
  const [active, setActive] = React.useState('Todos');
  const filters = ['Todos', 'On track', 'Em risco', 'Atrasado'];
  const items = SPRAVIO.projects.filter(p => active === 'Todos' || andHealthLabel(p.health) === active);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: AND_C.bg }}>
      <AndTopBar title="Portfólio" subtitle="STUDIO LAPA · 5 PROJETOS"/>

      {/* Big title (M3 medium top app bar style inline) */}
      <div style={{ padding: '4px 20px 14px' }}>
        <h1 style={{
          fontFamily: 'Roboto, system-ui', fontWeight: 400, fontSize: 28,
          color: AND_C.onSurface, margin: 0, letterSpacing: 0,
        }}>Todos os projetos</h1>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto' }}>
        {filters.map(f => <AndChip key={f} on={f === active} onClick={() => setActive(f)}>{f}</AndChip>)}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
        {items.map(p => <PortfolioCardAnd key={p.id} p={p}/>)}
      </div>

      {/* FAB */}
      <div style={{ position: 'absolute', right: 20, bottom: 90, zIndex: 5 }}>
        <button style={{
          width: 56, height: 56, borderRadius: 16,
          background: AND_C.primary, color: '#fff', border: 0,
          boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
          display: 'grid', placeItems: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      <AndBottomNav active="portfolio"/>
    </div>
  );
}

// ============== Sprint Screen (Android) ==============
function SprintAnd() {
  const kpis = [
    { label: 'VELOCITY', value: '24', unit: 'pts/sprint', delta: '−28%', bad: true },
    { label: 'CYCLE TIME', value: '3.1', unit: 'dias', delta: '+0.4', bad: true },
    { label: 'PRs ABERTOS', value: '7', unit: 'em review', delta: '2 stale', bad: true },
    { label: 'COBERTURA', value: '84', unit: '%', delta: '+2', bad: false },
  ];
  const cols = [
    { label: 'Todo', count: 3, color: AND_C.onSurfaceMuted },
    { label: 'In Progress', count: 6, color: AND_C.primary, hot: true },
    { label: 'Review', count: 4, color: AND_C.warn },
    { label: 'Done', count: 33, color: AND_C.good },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: AND_C.bg }}>
      <AndTopBar
        title="Sprint 14"
        subtitle="BANCO MERIDIAN · DIA 7/10"
        leading={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AND_C.onSurface} strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>}
        trailing={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AND_C.onSurface} strokeWidth="2"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>

        {/* Forecast card */}
        <div style={{
          background: AND_C.onSurface, color: AND_C.bg, borderRadius: 16,
          padding: 18, marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.14, textTransform: 'uppercase', opacity: 0.55 }}>IA FORECAST</div>
              <div style={{ fontSize: 40, fontWeight: 400, lineHeight: 1, marginTop: 8, fontFamily: 'Roboto, system-ui' }}>
                67<span style={{ fontSize: 18, opacity: 0.6 }}>%</span>
              </div>
              <div style={{ fontSize: 13, marginTop: 4, opacity: 0.75 }}>probabilidade no prazo</div>
            </div>
            <div style={{ width: 60, height: 60 }}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5"/>
                <circle cx="30" cy="30" r="24" fill="none" stroke={AND_C.warn} strokeWidth="5" strokeDasharray={`${2 * Math.PI * 24 * 0.67} ${2 * Math.PI * 24}`} transform="rotate(-90 30 30)" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <p style={{ fontSize: 12, opacity: 0.8, margin: '14px 0 0', lineHeight: 1.5 }}>3 cards em In Progress há +4 dias. Velocity 28% abaixo da média.</p>
          <button style={{
            marginTop: 12, padding: '8px 16px', borderRadius: 100, border: 0,
            background: 'rgba(255,255,255,0.12)', color: AND_C.bg,
            fontSize: 13, fontWeight: 500, fontFamily: 'Roboto, system-ui',
          }}>Ver raciocínio</button>
        </div>

        {/* Burndown */}
        <div style={{ background: AND_C.surface, borderRadius: 12, padding: 16, marginBottom: 12, border: `1px solid ${AND_C.outlineVariant}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui' }}>Burndown</h3>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: AND_C.onSurfaceMuted, letterSpacing: 0.08 }}>DIA 7 DE 10</span>
          </div>
          <svg width="100%" height="120" viewBox="0 0 300 120" preserveAspectRatio="none" style={{ display: 'block' }}>
            {[0, 1, 2, 3, 4].map(i => <line key={i} x1="0" y1={i * 28 + 5} x2="300" y2={i * 28 + 5} stroke={AND_C.outlineVariant} strokeDasharray="2 3"/>)}
            <line x1="10" y1="10" x2="290" y2="105" stroke={AND_C.onSurfaceMuted} strokeDasharray="4 3" strokeWidth="1.5"/>
            <polyline points="10,10 40,20 70,32 100,48 130,62 160,66 190,68 220,75" fill="none" stroke={AND_C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="220,75 250,82 280,92" fill="none" stroke={AND_C.primary} strokeWidth="2.5" strokeDasharray="4 4" opacity="0.5"/>
            <circle cx="220" cy="75" r="3.5" fill={AND_C.surface} stroke={AND_C.primary} strokeWidth="2"/>
          </svg>
          <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: AND_C.onSurfaceMuted, letterSpacing: 0.06 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 1.5, background: AND_C.onSurfaceMuted }}/>IDEAL</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: AND_C.primary }}/>REAL</span>
          </div>
        </div>

        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.12 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 400, color: AND_C.onSurface, marginTop: 4, lineHeight: 1, fontFamily: 'Roboto, system-ui' }}>
                {k.value}<span style={{ fontSize: 12, color: AND_C.onSurfaceMuted, marginLeft: 4 }}>{k.unit}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: k.bad ? AND_C.bad : AND_C.good, letterSpacing: 0.06 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Board */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '4px 0 10px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui' }}>Board</h3>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: AND_C.onSurfaceMuted, letterSpacing: 0.08 }}>SWIPE →</span>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {cols.map(c => (
            <div key={c.label} style={{
              background: c.hot ? `color-mix(in oklab, ${c.color} 10%, ${AND_C.surface})` : AND_C.surface,
              border: `1px solid ${c.hot ? `color-mix(in oklab, ${c.color} 30%, ${AND_C.outlineVariant})` : AND_C.outlineVariant}`,
              borderRadius: 12, padding: 12, minWidth: 128, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: AND_C.onSurface }}>{c.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: c.color }}>{c.count}</span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...Array(Math.min(c.count, 3))].map((_, i) => (
                  <div key={i} style={{ background: AND_C.surfaceVar, borderRadius: 8, padding: '6px 8px' }}>
                    <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: AND_C.onSurfaceMuted, letterSpacing: 0.06 }}>MRD-{410 + i + c.count}</div>
                    <div style={{ fontSize: 10, color: AND_C.onSurface, marginTop: 2, lineHeight: 1.3 }}>
                      {['Extract payment', 'Refactor auth', 'Add pix instant', 'Fix session', 'Burndown v2', 'Dashboard skel'][i + c.count] || 'Task item'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AndBottomNav active="sprint"/>
    </div>
  );
}

// ============== PR Detail (Android) ==============
function PRDetailAnd() {
  const pr = SPRAVIO.prs[0];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: AND_C.bg }}>
      <AndTopBar
        title={`PR #${pr.id}`}
        subtitle={`${pr.project} · CRÍTICO`}
        leading={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={AND_C.onSurface} strokeWidth="2"><path d="M15 6l-6 6 6 6"/></svg>}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>

        {/* Alert banner M3 */}
        <div style={{
          background: `color-mix(in oklab, ${AND_C.bad} 10%, ${AND_C.surface})`,
          border: `1px solid color-mix(in oklab, ${AND_C.bad} 30%, ${AND_C.outlineVariant})`,
          borderRadius: 12, padding: 14, display: 'flex', gap: 12, marginBottom: 12,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 100, background: `color-mix(in oklab, ${AND_C.bad} 15%, transparent)`, color: AND_C.bad, display: 'grid', placeItems: 'center', fontSize: 18 }}>⚠</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui' }}>Sem atividade há {pr.age}</div>
            <div style={{ fontSize: 12, color: AND_C.onSurfaceVar, marginTop: 2, lineHeight: 1.4 }}>Última ação: commit por {pr.author}</div>
          </div>
        </div>

        <div style={{ padding: '4px 4px 12px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: AND_C.onSurfaceMuted, letterSpacing: 0.08, marginBottom: 6 }}>
            BRANCH feat/payment-refactor → main
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: AND_C.onSurface, lineHeight: 1.3, fontFamily: 'Roboto, system-ui', letterSpacing: 0 }}>{pr.title}</h2>
        </div>

        {/* Author */}
        <div style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 100, background: AND_C.primaryContainer, color: AND_C.onPrimaryContainer, display: 'grid', placeItems: 'center', fontWeight: 500, fontSize: 13 }}>{pr.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: AND_C.onSurface }}>{pr.author}</div>
            <div style={{ fontSize: 12, color: AND_C.onSurfaceMuted }}>autor · abriu há {pr.age}</div>
          </div>
          <button style={{
            padding: '8px 14px', borderRadius: 100, background: AND_C.primary, color: '#fff',
            border: 0, fontSize: 12, fontWeight: 500, fontFamily: 'Roboto, system-ui',
          }}>Ping</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.1 }}>ADDED</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: AND_C.good, fontWeight: 500, marginTop: 4 }}>+{pr.additions}</div>
          </div>
          <div style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.1 }}>REMOVED</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: AND_C.bad, fontWeight: 500, marginTop: 4 }}>−{pr.deletions}</div>
          </div>
          <div style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.1 }}>COMMENTS</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: AND_C.onSurface, fontWeight: 500, marginTop: 4 }}>{pr.comments}</div>
          </div>
        </div>

        {/* Card link */}
        <div style={{ background: AND_C.surface, border: `1px solid ${AND_C.outlineVariant}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.12, marginBottom: 8 }}>CARD VINCULADO</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '2px 8px', borderRadius: 6, background: AND_C.surfaceVar, color: AND_C.onSurfaceVar }}>{pr.cardRef}</span>
            <span style={{ fontSize: 13, color: AND_C.onSurface, flex: 1 }}>Extract payment service</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AND_C.onSurfaceMuted} strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
          </div>
        </div>

        {/* Actions M3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{
            padding: '16px', borderRadius: 100, background: AND_C.primary, color: '#fff', border: 0,
            fontSize: 14, fontWeight: 500, fontFamily: 'Roboto, system-ui',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.7 18.6.3 12 .3z"/></svg>
            Abrir no GitHub
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button style={{ padding: '12px', borderRadius: 100, background: 'transparent', color: AND_C.primaryDeep, border: `1px solid ${AND_C.outline}`, fontSize: 13, fontWeight: 500, fontFamily: 'Roboto, system-ui' }}>Ping autor</button>
            <button style={{ padding: '12px', borderRadius: 100, background: 'transparent', color: AND_C.onSurfaceVar, border: `1px solid ${AND_C.outline}`, fontSize: 13, fontWeight: 500, fontFamily: 'Roboto, system-ui' }}>Snooze 24h</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== Inbox (Android) ==============
function InboxAnd() {
  const sevColor = { critical: AND_C.bad, warn: AND_C.warn, info: AND_C.primary, good: AND_C.good };
  const sevBg = (s) => `color-mix(in oklab, ${sevColor[s]} 14%, transparent)`;
  const sevIcon = { critical: '⚠', warn: '!', info: '◇', good: '✓' };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: AND_C.bg }}>
      <AndTopBar title="Inbox" subtitle="3 NÃO LIDOS · 7 DIAS"/>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 16px 16px' }}>
        {SPRAVIO.alerts.map(a => (
          <div key={a.id} style={{
            background: AND_C.surface, borderRadius: 12, padding: 14, marginBottom: 8,
            border: `1px solid ${AND_C.outlineVariant}`, display: 'flex', gap: 12,
            opacity: a.unread ? 1 : 0.7, position: 'relative',
          }}>
            {a.unread && <span style={{ position: 'absolute', left: 4, top: 18, width: 4, height: 24, borderRadius: 2, background: AND_C.primary }}/>}
            <div style={{ width: 40, height: 40, borderRadius: 100, background: sevBg(a.sev), color: sevColor[a.sev], display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>{sevIcon[a.sev]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted, letterSpacing: 0.12, textTransform: 'uppercase' }}>{a.project}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: AND_C.onSurfaceMuted }}>{a.time}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: a.unread ? 500 : 400, color: AND_C.onSurface, marginTop: 4, lineHeight: 1.3, fontFamily: 'Roboto, system-ui' }}>{a.title}</div>
              <div style={{ fontSize: 12, color: AND_C.onSurfaceVar, marginTop: 4, lineHeight: 1.4 }}>{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <AndBottomNav active="inbox"/>
    </div>
  );
}

// ============== Me (Android) ==============
function MeAnd() {
  const section = (title, items) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: AND_C.onSurfaceMuted, letterSpacing: 0.14, textTransform: 'uppercase', padding: '0 16px 8px' }}>{title}</div>
      <div style={{ background: AND_C.surface, borderRadius: 12, overflow: 'hidden', border: `1px solid ${AND_C.outlineVariant}` }}>
        {items.map((it, i) => (
          <div key={i} style={{
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
            borderTop: i > 0 ? `1px solid ${AND_C.outlineVariant}` : 'none',
          }}>
            {it.icon && <div style={{ width: 32, height: 32, borderRadius: 100, background: AND_C.primaryContainer, color: AND_C.onPrimaryContainer, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 500 }}>{it.icon}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: AND_C.onSurface, fontFamily: 'Roboto, system-ui' }}>{it.label}</div>
              {it.sub && <div style={{ fontSize: 12, color: AND_C.onSurfaceMuted, marginTop: 2 }}>{it.sub}</div>}
            </div>
            {it.value && <span style={{ fontSize: 12, color: AND_C.onSurfaceMuted }}>{it.value}</span>}
            {it.toggle !== undefined && (
              <div style={{ width: 44, height: 24, borderRadius: 100, background: it.toggle ? AND_C.primary : AND_C.surfaceVar, border: `2px solid ${it.toggle ? AND_C.primary : AND_C.outline}`, position: 'relative' }}>
                <div style={{ width: it.toggle ? 18 : 12, height: it.toggle ? 18 : 12, borderRadius: 100, background: it.toggle ? '#fff' : AND_C.outline, position: 'absolute', top: it.toggle ? 1 : 4, left: it.toggle ? 20 : 4, transition: 'all .15s' }}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: AND_C.bg }}>
      <AndTopBar title="Eu" subtitle="PERFIL & CONFIGURAÇÕES"/>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 16px' }}>
        {/* Profile card */}
        <div style={{
          margin: '0 16px 18px', background: AND_C.onSurface, color: AND_C.bg, borderRadius: 12, padding: 18,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 100, background: AND_C.primary, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 500 }}>MS</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Maria Schmidt</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Project Manager · Studio Lapa</div>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.12)', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 0.12 }}>GP</div>
        </div>

        {section('Organização', [
          { icon: 'SL', label: 'Studio Lapa', sub: '5 projetos · 8 membros', value: 'Atual' },
          { icon: '+', label: 'Trocar organização' },
        ])}

        {section('Notificações', [
          { label: 'PR stale crítico (72h)', sub: 'Push imediato', toggle: true },
          { label: 'Sprint em risco (IA)', sub: 'Push imediato', toggle: true },
          { label: 'Budget threshold', sub: '70% e 85%', toggle: true },
          { label: 'Resumo diário', sub: '18:00, dias úteis', toggle: false },
          { label: 'Sync concluído', sub: 'Silent na inbox', toggle: false },
        ])}

        {section('Conta', [
          { icon: '⏱', label: 'Lançar horas' },
          { icon: '◐', label: 'Tema & idioma', value: 'Claro · PT' },
          { icon: '◇', label: 'Integrações', value: '3 ativas' },
          { icon: '?', label: 'Ajuda & docs' },
        ])}

        <div style={{ padding: '0 16px' }}>
          <button style={{
            width: '100%', padding: 14, borderRadius: 100, background: 'transparent',
            border: `1px solid ${AND_C.outline}`, color: AND_C.bad, fontSize: 14, fontWeight: 500,
            fontFamily: 'Roboto, system-ui',
          }}>Sair</button>
        </div>

        <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: AND_C.onSurfaceMuted, letterSpacing: 0.08, marginTop: 18 }}>
          Spravio v1.0.0 · build 2026.04.19
        </div>
      </div>
      <AndBottomNav active="me"/>
    </div>
  );
}

Object.assign(window, {
  PortfolioAnd, SprintAnd, PRDetailAnd, InboxAnd, MeAnd, AND_C,
});
