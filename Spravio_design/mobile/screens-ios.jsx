// Telas iOS do Spravio Mobile
// Cada tela substitui a nav bar padrão do IOSDevice e implementa seu próprio header.

// Paleta warm-adaptada (igual ao sitemap)
const SPR = {
  cream: 'oklch(0.975 0.012 75)',
  cream2: 'oklch(0.955 0.018 72)',
  paper: 'oklch(0.99 0.008 80)',
  ink: 'oklch(0.22 0.02 40)',
  ink2: 'oklch(0.36 0.02 40)',
  ink3: 'oklch(0.56 0.015 45)',
  rule: 'oklch(0.88 0.015 60)',
  rule2: 'oklch(0.82 0.02 55)',
  accent: 'oklch(0.62 0.14 35)',
  accentDeep: 'oklch(0.42 0.12 35)',
  accentSoft: 'oklch(0.92 0.06 35)',
  good: 'oklch(0.58 0.12 145)',
  warn: 'oklch(0.72 0.15 75)',
  bad: 'oklch(0.58 0.18 25)',
};

const healthColor = (h) => h === 'on-track' ? SPR.good : h === 'at-risk' ? SPR.warn : SPR.bad;
const healthLabel = (h) => h === 'on-track' ? 'On track' : h === 'at-risk' ? 'Em risco' : 'Atrasado';

// ============== iOS Status Bar (inline, não usa o do starter) ==============
function IOSStatus() {
  return (
    <div style={{
      height: 54, padding: '21px 28px 0', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      fontFamily: '-apple-system, system-ui', fontSize: 17, fontWeight: 600, color: SPR.ink,
      position: 'relative', zIndex: 20,
    }}>
      <span>9:41</span>
      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="10" viewBox="0 0 18 10"><rect x="0" y="6" width="3" height="4" rx="0.6" fill={SPR.ink}/><rect x="4.5" y="4" width="3" height="6" rx="0.6" fill={SPR.ink}/><rect x="9" y="2" width="3" height="8" rx="0.6" fill={SPR.ink}/><rect x="13.5" y="0" width="3" height="10" rx="0.6" fill={SPR.ink}/></svg>
        <svg width="16" height="10" viewBox="0 0 16 10" fill={SPR.ink}><path d="M8 2.5c2 0 3.8.8 5.2 2.1l.9-.9A8.6 8.6 0 008 1.1a8.6 8.6 0 00-6.1 2.6l.9.9C4.2 3.3 6 2.5 8 2.5z"/><path d="M8 5.5c1.2 0 2.2.5 3 1.2l.9-.9A5.6 5.6 0 008 4.3a5.6 5.6 0 00-3.9 1.5l.9.9c.8-.7 1.8-1.2 3-1.2z"/><circle cx="8" cy="8.5" r="1.3"/></svg>
        <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke={SPR.ink} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="19" height="8" rx="1.5" fill={SPR.ink}/><rect x="23.5" y="4" width="1.5" height="4" rx="0.5" fill={SPR.ink} opacity="0.4"/></svg>
      </span>
    </div>
  );
}

// ============== Dynamic island spacer ==============
function IOSDynamic() {
  return (
    <div style={{
      position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
      width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
    }} />
  );
}

// ============== iOS Tab Bar ==============
function IOSTabBar({ active = 'portfolio' }) {
  const tabs = [
    { id: 'portfolio', label: 'Portfólio', icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg> },
    { id: 'sprint', label: 'Sprint', icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg> },
    { id: 'prs', label: 'PRs', icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M6 8.5v7"/><path d="M8.3 6.5c5 0 7 2 7 5.5"/></svg> },
    { id: 'inbox', label: 'Inbox', icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M4 6h16v10H7l-3 3z"/></svg> },
    { id: 'me', label: 'Eu', icon: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg> },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      paddingBottom: 28, background: `linear-gradient(to top, ${SPR.paper} 65%, ${SPR.paper}e0 85%, transparent)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 8px 4px' }}>
        {tabs.map(t => {
          const on = active === t.id;
          const col = on ? SPR.accentDeep : SPR.ink3;
          return (
            <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1 }}>
              {t.icon(col)}
              <span style={{ fontSize: 10, color: col, fontWeight: on ? 600 : 500, letterSpacing: 0.1 }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============== iOS Header (título grande + org) ==============
function IOSHeader({ title, eyebrow, trailing, onBack }) {
  return (
    <div style={{ padding: '8px 20px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 }}>
        {onBack ? (
          <button style={{ background: 'none', border: 0, padding: 0, display: 'flex', alignItems: 'center', gap: 4, color: SPR.accentDeep, fontSize: 15, fontWeight: 500 }}>
            <svg width="11" height="18" viewBox="0 0 11 18" fill="none"><path d="M9 2L2 9l7 7" stroke={SPR.accentDeep} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {typeof onBack === 'string' ? onBack : 'Voltar'}
          </button>
        ) : (
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.14, color: SPR.ink3, textTransform: 'uppercase', fontWeight: 500 }}>{eyebrow}</span>
        )}
        {trailing}
      </div>
      <h1 style={{
        fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 34, lineHeight: 1.02,
        letterSpacing: '-0.025em', color: SPR.ink, margin: '10px 0 0',
      }}>{title}</h1>
    </div>
  );
}

// ============== Health chip ==============
function HealthChip({ h, size = 'sm' }) {
  const c = healthColor(h);
  const pad = size === 'sm' ? '3px 8px' : '4px 10px';
  const fs = size === 'sm' ? 10 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pad, borderRadius: 100, fontFamily: 'JetBrains Mono, monospace',
      fontSize: fs, fontWeight: 500, letterSpacing: 0.08, textTransform: 'uppercase',
      background: `color-mix(in oklab, ${c} 14%, transparent)`, color: c,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 100, background: c }}/>
      {healthLabel(h)}
    </span>
  );
}

// ============== Project Card (iOS) ==============
function PortfolioCardIOS({ p }) {
  const c = healthColor(p.health);
  return (
    <div style={{
      background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 18,
      padding: 16, marginBottom: 10, position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: SPR.cream2, display: 'grid', placeItems: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500, color: SPR.ink2, letterSpacing: 0.1,
          border: `1px solid ${SPR.rule}`,
        }}>{p.key}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: SPR.ink, letterSpacing: -0.1 }}>{p.name}</h3>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SPR.ink3, letterSpacing: 0.08 }}>{p.sprintName}</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: SPR.ink3 }}>
            {p.gpInitials} · {p.devs} devs · {p.cards.done}/{p.cards.total} cards
          </div>
        </div>
      </div>

      {/* Progress bar combining progress + forecast */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <HealthChip h={p.health} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: SPR.ink2, letterSpacing: 0.06 }}>
            <span style={{ color: SPR.ink3 }}>IA</span> {p.forecast}%
          </span>
        </div>
        <div style={{ height: 6, background: SPR.cream2, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p.progress}%`, background: c, borderRadius: 3 }}/>
        </div>
      </div>

      {/* Footer meta */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${SPR.rule}`, display: 'flex', gap: 12, fontSize: 11, color: SPR.ink2 }}>
        <span>Budget <strong style={{ color: p.budget > 85 ? SPR.bad : SPR.ink, fontWeight: 600 }}>{p.budget}%</strong></span>
        {p.prStale > 0 && (
          <span style={{ color: SPR.bad, fontWeight: 500 }}>⚠ {p.prStale} PR{p.prStale > 1 ? 's' : ''} stale</span>
        )}
      </div>
    </div>
  );
}

// ============== Portfolio Screen (iOS) ==============
function PortfolioIOS() {
  const filters = ['Todos', 'On track', 'Em risco', 'Atrasado'];
  const [active, setActive] = React.useState('Todos');
  const items = SPRAVIO.projects.filter(p => active === 'Todos' || healthLabel(p.health) === active);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPR.cream, position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic />
      <IOSStatus />
      {/* Header */}
      <IOSHeader
        eyebrow="Studio Lapa · 5 projetos"
        title={<>Seu <em style={{ fontStyle: 'italic', color: SPR.accentDeep }}>portfólio</em>.</>}
        trailing={
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 100, background: SPR.paper, border: `1px solid ${SPR.rule}`, display: 'grid', placeItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPR.ink2} strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M16 16l4 4"/></svg>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 100, background: SPR.ink, color: SPR.cream, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>MS</div>
          </div>
        }
      />
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 12px', overflowX: 'auto' }}>
        {filters.map(f => {
          const on = f === active;
          return (
            <button key={f} onClick={() => setActive(f)} style={{
              padding: '6px 12px', borderRadius: 100, border: `1px solid ${on ? SPR.ink : SPR.rule}`,
              background: on ? SPR.ink : 'transparent', color: on ? SPR.cream : SPR.ink2,
              fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0,
            }}>{f}</button>
          );
        })}
      </div>
      {/* List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 120px' }}>
        {items.map(p => <PortfolioCardIOS key={p.id} p={p}/>)}
      </div>
      <IOSTabBar active="portfolio"/>
    </div>
  );
}

// ============== Sprint Screen (iOS) ==============
function SprintIOS() {
  const proj = SPRAVIO.projects[0]; // Meridian
  const kpis = [
    { label: 'Velocity', value: '24', unit: 'pts/sprint', delta: '−28%', bad: true },
    { label: 'Cycle time', value: '3.1', unit: 'dias', delta: '+0.4', bad: true },
    { label: 'PRs abertos', value: '7', unit: 'em review', delta: '2 stale', bad: true },
    { label: 'Cobertura', value: '84', unit: '%', delta: '+2', bad: false },
  ];
  const cols = [
    { label: 'Todo', count: 3, color: SPR.ink3 },
    { label: 'In Progress', count: 6, color: SPR.accent, hot: true },
    { label: 'Review', count: 4, color: SPR.warn },
    { label: 'Done', count: 33, color: SPR.good },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPR.cream, position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic />
      <IOSStatus />
      <IOSHeader
        eyebrow="Banco Meridian · Sprint 14"
        title={<>Sprint <em style={{ fontStyle: 'italic', color: SPR.accentDeep }}>14</em>.</>}
        onBack="Projetos"
        trailing={<HealthChip h="at-risk"/>}
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 120px' }}>

        {/* Forecast card — destaque */}
        <div style={{
          background: SPR.ink, color: SPR.cream, borderRadius: 18,
          padding: 18, marginBottom: 14, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 0.14, textTransform: 'uppercase', opacity: 0.55 }}>IA forecast · entrega</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 44, lineHeight: 1, marginTop: 8, letterSpacing: '-0.03em' }}>
                67<span style={{ fontSize: 20, opacity: 0.6 }}>%</span>
                <span style={{ fontStyle: 'italic', display: 'block', fontSize: 18, marginTop: 4, opacity: 0.7 }}>probabilidade no prazo</span>
              </div>
            </div>
            <div style={{ width: 60, height: 60, position: 'relative' }}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5"/>
                <circle cx="30" cy="30" r="24" fill="none" stroke={SPR.warn} strokeWidth="5" strokeDasharray={`${2 * Math.PI * 24 * 0.67} ${2 * Math.PI * 24}`} strokeDashoffset={0} transform="rotate(-90 30 30)" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <p style={{ fontSize: 12, opacity: 0.8, margin: '14px 0 0', lineHeight: 1.5 }}>3 cards em In Progress há +4 dias. Velocity 28% abaixo da média das últimas 6 sprints.</p>
          <button style={{
            marginTop: 12, padding: '8px 14px', borderRadius: 100, border: 0,
            background: 'rgba(255,255,255,0.12)', color: SPR.cream,
            fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>Ver raciocínio →</button>
        </div>

        {/* Burndown */}
        <div style={{
          background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 18,
          padding: 16, marginBottom: 14,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 20, margin: 0, letterSpacing: -0.015 }}>Burndown</h3>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SPR.ink3, letterSpacing: 0.08 }}>DIA 7 DE 10</span>
          </div>
          <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="none" style={{ display: 'block' }}>
            {[0, 1, 2, 3, 4].map(i => <line key={i} x1="0" y1={i * 30 + 5} x2="300" y2={i * 30 + 5} stroke={SPR.rule} strokeDasharray="2 3"/>)}
            {/* ideal */}
            <line x1="10" y1="10" x2="290" y2="115" stroke={SPR.ink3} strokeDasharray="4 3" strokeWidth="1.5"/>
            {/* actual */}
            <polyline points="10,10 40,22 70,35 100,52 130,68 160,72 190,75 220,82" fill="none" stroke={SPR.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {/* forecast continuation */}
            <polyline points="220,82 250,90 280,100" fill="none" stroke={SPR.accent} strokeWidth="2.5" strokeDasharray="4 4" opacity="0.5"/>
            <circle cx="220" cy="82" r="3.5" fill={SPR.paper} stroke={SPR.accent} strokeWidth="2"/>
          </svg>
          <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: SPR.ink3, letterSpacing: 0.06 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 1.5, background: SPR.ink3 }}/>IDEAL</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: SPR.accent }}/>REAL</span>
          </div>
        </div>

        {/* KPIs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 0.12, textTransform: 'uppercase', color: SPR.ink3 }}>{k.label}</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 28, letterSpacing: -0.025, color: SPR.ink, marginTop: 4, lineHeight: 1 }}>
                {k.value}<span style={{ fontSize: 12, color: SPR.ink3, marginLeft: 4 }}>{k.unit}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: k.bad ? SPR.bad : SPR.good, letterSpacing: 0.06 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Board columns — horizontal scroll */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '4px 0 10px' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 20, margin: 0 }}>Board</h3>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SPR.ink3, letterSpacing: 0.08 }}>SWIPE →</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {cols.map(c => (
            <div key={c.label} style={{
              background: c.hot ? `color-mix(in oklab, ${c.color} 10%, ${SPR.paper})` : SPR.paper,
              border: `1px solid ${c.hot ? `color-mix(in oklab, ${c.color} 30%, ${SPR.rule})` : SPR.rule}`,
              borderRadius: 14, padding: 12, minWidth: 128, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: SPR.ink, letterSpacing: -0.05 }}>{c.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500, color: c.color }}>{c.count}</span>
              </div>
              {/* mini card stubs */}
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...Array(Math.min(c.count, 3))].map((_, i) => (
                  <div key={i} style={{ background: SPR.cream2, borderRadius: 6, padding: '6px 8px' }}>
                    <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: SPR.ink3, letterSpacing: 0.06 }}>MRD-{410 + i + c.count}</div>
                    <div style={{ fontSize: 10, color: SPR.ink, marginTop: 2, lineHeight: 1.3 }}>
                      {['Extract payment service', 'Refactor auth middleware', 'Add pix instant', 'Fix session leak', 'Burndown v2', 'Dashboard skeleton'][i + c.count] || 'Task item'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <IOSTabBar active="sprint"/>
    </div>
  );
}

// ============== PR Detail Screen (iOS) ==============
function PRDetailIOS() {
  const pr = SPRAVIO.prs[0]; // #187 stale
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPR.cream, position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic />
      <IOSStatus />
      <IOSHeader
        eyebrow={`PR #${pr.id} · ${pr.project}`}
        title={<>PR em <em style={{ fontStyle: 'italic', color: SPR.bad }}>risco crítico</em>.</>}
        onBack="PRs"
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 120px' }}>

        {/* Alert banner */}
        <div style={{
          background: `color-mix(in oklab, ${SPR.bad} 8%, ${SPR.paper})`,
          border: `1px solid color-mix(in oklab, ${SPR.bad} 30%, ${SPR.rule})`,
          borderRadius: 14, padding: 14, display: 'flex', gap: 12, marginBottom: 14,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in oklab, ${SPR.bad} 15%, transparent)`, color: SPR.bad, display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0 }}>⚠</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: SPR.ink }}>Sem atividade há {pr.age}</div>
            <div style={{ fontSize: 11, color: SPR.ink2, marginTop: 2, lineHeight: 1.4 }}>Última ação: <strong>commit</strong> por {pr.author}, sem review nem comentários desde então.</div>
          </div>
        </div>

        {/* Title + meta */}
        <div style={{ padding: '4px 4px 14px' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: SPR.ink3, letterSpacing: 0.08, marginBottom: 6 }}>
            #{pr.id} · BRANCH feat/payment-refactor → main
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: SPR.ink, letterSpacing: -0.2, lineHeight: 1.3 }}>
            {pr.title}
          </h2>
        </div>

        {/* Author row */}
        <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 100, background: SPR.accentSoft, color: SPR.accentDeep, display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: 13 }}>{pr.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: SPR.ink }}>{pr.author}</div>
            <div style={{ fontSize: 11, color: SPR.ink3 }}>autor · abriu há {pr.age}</div>
          </div>
          <button style={{
            padding: '7px 12px', borderRadius: 100, background: SPR.ink, color: SPR.cream,
            border: 0, fontSize: 11, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M12 2a10 10 0 000 20 10 10 0 000-20zm0 4v6l4 2"/></svg>
            Ping
          </button>
        </div>

        {/* Diff stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase' }}>Additions</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: SPR.good, fontWeight: 500, marginTop: 4 }}>+{pr.additions}</div>
          </div>
          <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase' }}>Deletions</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: SPR.bad, fontWeight: 500, marginTop: 4 }}>−{pr.deletions}</div>
          </div>
          <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.1, textTransform: 'uppercase' }}>Comments</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: SPR.ink, fontWeight: 500, marginTop: 4 }}>{pr.comments}</div>
          </div>
        </div>

        {/* Linked card */}
        <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.12, textTransform: 'uppercase', marginBottom: 6 }}>Card vinculado</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '2px 6px', borderRadius: 4, background: SPR.cream2, color: SPR.ink2, letterSpacing: 0.06 }}>{pr.cardRef}</span>
            <span style={{ fontSize: 13, color: SPR.ink, flex: 1 }}>Extract payment service</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPR.ink3} strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{ padding: '14px', borderRadius: 14, background: SPR.accent, color: '#fff', border: 0, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4C24 5.7 18.6.3 12 .3z"/></svg>
            Abrir no GitHub
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button style={{ padding: '12px', borderRadius: 14, background: SPR.paper, color: SPR.ink, border: `1px solid ${SPR.rule}`, fontSize: 13, fontWeight: 500 }}>Ping autor (Slack)</button>
            <button style={{ padding: '12px', borderRadius: 14, background: SPR.paper, color: SPR.ink2, border: `1px solid ${SPR.rule}`, fontSize: 13, fontWeight: 500 }}>Snooze 24h</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== Inbox Screen (iOS) ==============
function InboxIOS() {
  const sevColor = { critical: SPR.bad, warn: SPR.warn, info: SPR.accent, good: SPR.good };
  const sevBg = (s) => `color-mix(in oklab, ${sevColor[s]} 14%, transparent)`;
  const sevIcon = { critical: '⚠', warn: '!', info: '◇', good: '✓' };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPR.cream, position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic />
      <IOSStatus />
      <IOSHeader
        eyebrow="3 não lidos · últimos 7 dias"
        title={<>Inbox.</>}
        trailing={
          <div style={{ width: 32, height: 32, borderRadius: 100, background: SPR.paper, border: `1px solid ${SPR.rule}`, display: 'grid', placeItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={SPR.ink2} strokeWidth="2"><path d="M6 12h12M6 6h12M6 18h12"/></svg>
          </div>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 120px' }}>
        {SPRAVIO.alerts.map(a => (
          <div key={a.id} style={{
            background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14,
            padding: 14, marginBottom: 10, display: 'flex', gap: 12, position: 'relative',
            opacity: a.unread ? 1 : 0.72,
          }}>
            {a.unread && <span style={{ position: 'absolute', left: -4, top: 20, width: 6, height: 6, borderRadius: 100, background: SPR.accent }}/>}
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: sevBg(a.sev), color: sevColor[a.sev],
              display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0,
            }}>{sevIcon[a.sev]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.12, textTransform: 'uppercase' }}>{a.project}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.08 }}>{a.time}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: a.unread ? 600 : 500, color: SPR.ink, marginTop: 4, lineHeight: 1.3 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: SPR.ink3, marginTop: 4, lineHeight: 1.4 }}>{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <IOSTabBar active="inbox"/>
    </div>
  );
}

// ============== Me / Profile Screen (iOS) ==============
function MeIOS() {
  const section = (title, items) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: SPR.ink3, letterSpacing: 0.14, textTransform: 'uppercase', padding: '0 6px 8px' }}>{title}</div>
      <div style={{ background: SPR.paper, border: `1px solid ${SPR.rule}`, borderRadius: 14, overflow: 'hidden' }}>
        {items.map((it, i) => (
          <div key={i} style={{
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            borderTop: i > 0 ? `1px solid ${SPR.rule}` : 'none',
          }}>
            {it.icon && <div style={{ width: 28, height: 28, borderRadius: 7, background: it.iconBg || SPR.cream2, color: it.iconColor || SPR.ink2, display: 'grid', placeItems: 'center' }}>{it.icon}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: SPR.ink, fontWeight: 500 }}>{it.label}</div>
              {it.sub && <div style={{ fontSize: 11, color: SPR.ink3, marginTop: 2 }}>{it.sub}</div>}
            </div>
            {it.value && <span style={{ fontSize: 12, color: SPR.ink3 }}>{it.value}</span>}
            {it.toggle !== undefined && (
              <div style={{ width: 36, height: 22, borderRadius: 100, background: it.toggle ? SPR.accent : SPR.rule2, position: 'relative', transition: 'all .2s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 100, background: '#fff', position: 'absolute', top: 2, left: it.toggle ? 16 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
              </div>
            )}
            {it.chevron && <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke={SPR.ink3} strokeWidth="1.8" strokeLinecap="round"/></svg>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: SPR.cream, position: 'relative', overflow: 'hidden' }}>
      <IOSDynamic />
      <IOSStatus />
      <IOSHeader
        eyebrow="Perfil & configurações"
        title={<>Oi, <em style={{ fontStyle: 'italic', color: SPR.accentDeep }}>Maria</em>.</>}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 120px' }}>

        {/* Profile card */}
        <div style={{
          background: SPR.ink, color: SPR.cream, borderRadius: 18, padding: 18, marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 100, background: SPR.accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 600 }}>MS</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Maria Schmidt</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Project Manager · Studio Lapa</div>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 0.12 }}>GP</div>
        </div>

        {section('Organização', [
          { icon: 'SL', iconBg: SPR.accentSoft, iconColor: SPR.accentDeep, label: 'Studio Lapa', sub: '5 projetos · 8 membros', value: 'Atual', chevron: true },
          { icon: '+', iconBg: SPR.cream2, iconColor: SPR.ink2, label: 'Trocar organização', chevron: true },
        ])}

        {section('Notificações', [
          { label: 'PR stale crítico (72h)', sub: 'Push imediato', toggle: true },
          { label: 'Sprint em risco (IA)', sub: 'Push imediato', toggle: true },
          { label: 'Budget threshold', sub: '70% e 85%', toggle: true },
          { label: 'Resumo diário (digest)', sub: '18:00, dias úteis', toggle: false },
          { label: 'Sync concluído', sub: 'Silent na inbox', toggle: false },
        ])}

        {section('Conta', [
          { label: 'Lançar horas', chevron: true, icon: '⏱', iconBg: SPR.cream2 },
          { label: 'Tema & idioma', value: 'Claro · PT', chevron: true, icon: '◐', iconBg: SPR.cream2 },
          { label: 'Integrações', value: '3 ativas', chevron: true, icon: '◇', iconBg: SPR.cream2 },
          { label: 'Ajuda & docs', chevron: true, icon: '?', iconBg: SPR.cream2 },
        ])}

        <button style={{
          width: '100%', padding: 14, borderRadius: 14, background: SPR.paper,
          border: `1px solid ${SPR.rule}`, color: SPR.bad, fontSize: 14, fontWeight: 500, marginTop: 8,
        }}>Sair</button>

        <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: SPR.ink3, letterSpacing: 0.08, marginTop: 18 }}>
          Spravio v1.0.0 · build 2026.04.19
        </div>
      </div>
      <IOSTabBar active="me"/>
    </div>
  );
}

Object.assign(window, {
  PortfolioIOS, SprintIOS, PRDetailIOS, InboxIOS, MeIOS, SPR,
});
