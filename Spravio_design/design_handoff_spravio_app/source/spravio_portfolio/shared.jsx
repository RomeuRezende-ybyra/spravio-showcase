// Shell compartilhado — sidebar, topbar, KPI strip, command palette, role switcher
const { useState, useEffect, useRef, useMemo } = React;

// ─── LOGO COMPACTA ────────────────────────────────────────────────────
function LogoMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: "block" }}>
      <defs>
        <linearGradient id="sprv-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-deep)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="url(#sprv-grad)" />
      <path d="M11 20 Q11 24 15 24 L19 24 Q23 24 23 20 Q23 17 19 17 L15 17 Q11 17 11 14 Q11 10 15 10 L19 10 Q23 10 23 14"
        fill="none" stroke="var(--cream)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoFull() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <LogoMark size={22} />
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em",
        color: "var(--ink)",
      }}>Spravio</span>
    </div>
  );
}

// ─── ICONS (stroke) ──────────────────────────────────────────────────
const I = {
  portfolio: (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="5.5" height="5.5" rx="1"/><rect x="8.5" y="3" width="5.5" height="5.5" rx="1"/><rect x="2" y="9.5" width="5.5" height="3.5" rx="1"/><rect x="8.5" y="9.5" width="5.5" height="3.5" rx="1"/></svg>),
  project:   (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4 L7 2 L14 4 L14 11 L8 14 L2 11 Z"/><path d="M2 4 L8 7 L14 4 M8 7 L8 14"/></svg>),
  sprint:    (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 4 L8 8 L11 10"/></svg>),
  devs:      (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="11.5" cy="6.5" r="2"/><path d="M2 13 Q2 9.5 6 9.5 Q10 9.5 10 13"/><path d="M10.5 12.5 Q10.5 10 11.5 10 Q14 10 14 13"/></svg>),
  prs:       (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="4" cy="4" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><path d="M4 5.5 L4 10.5"/><path d="M5.5 4 L8 4 Q11 4 11 7 L11 10.5"/></svg>),
  money:     (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2 L8 14"/><path d="M11 5 Q11 3 8 3 Q5 3 5 5 Q5 7 8 7 Q11 7 11 9 Q11 11 8 11 Q5 11 5 9"/></svg>),
  forecast:  (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12 L5 8 L8 10 L13 3"/><path d="M10 3 L13 3 L13 6"/></svg>),
  integ:     (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>),
  settings:  (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="2"/><path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8 M3.5 3.5 L5 5 M11 11 L12.5 12.5 M3.5 12.5 L5 11 M11 5 L12.5 3.5"/></svg>),
  search:    (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 L14 14"/></svg>),
  bell:      (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11 L4 7 Q4 4 8 4 Q12 4 12 7 L12 11 L13 12 L3 12 Z"/><path d="M7 13.5 Q7 14.5 8 14.5 Q9 14.5 9 13.5"/></svg>),
  plus:      (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2 L6 10 M2 6 L10 6"/></svg>),
  caret:     (<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4 L5 7 L8 4"/></svg>),
  sync:      (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5 Q2 2 5 2 Q7 2 8 3.5 M10 7 Q10 10 7 10 Q5 10 4 8.5"/><path d="M8 1.5 L8 3.5 L6 3.5 M4 10.5 L4 8.5 L6 8.5"/></svg>),
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────
function Sidebar({ current, onNav, data, role }) {
  const routes = (window.SpravioBoot && window.SpravioBoot.NAV_ROUTES) || {};
  const topItems = [
    { id: "portfolio", icon: I.portfolio, label: "Portfolio", roles: ["OWNER"] },
    { id: "projects",  icon: I.project,   label: "Projetos",  roles: ["OWNER","PM","VIEWER"] },
    { id: "sprints",   icon: I.sprint,    label: "Sprints",   roles: ["OWNER","PM","VIEWER"] },
    { id: "developers",icon: I.devs,      label: "Developers",roles: ["OWNER","PM"] },
    { id: "prs",       icon: I.prs,       label: "Pull Requests", roles: ["OWNER","PM","VIEWER"] },
    { id: "budget",    icon: I.money,     label: "Financials",roles: ["OWNER","PM"] },
    { id: "forecast",  icon: I.forecast,  label: "Forecast",  roles: ["OWNER","PM"] },
  ];
  const bottomItems = [
    { id: "integrations", icon: I.integ,   label: "Integrações", roles: ["OWNER","PM"] },
    { id: "settings",  icon: I.settings,   label: "Settings",    roles: ["OWNER","PM","VIEWER"] },
  ];

  const NavItem = ({ item }) => {
    const allowed = item.roles.includes(role);
    const href = routes[item.id];
    const isActive = current === item.id;
    const className = `sv-nav-item ${isActive ? "on" : ""} ${!allowed ? "locked" : ""}`;
    const title = !allowed ? `${item.label} — restrito ao seu role` : item.label;
    const content = (
      <>
        <span className="sv-nav-icon">{item.icon}</span>
        <span className="sv-nav-label">{item.label}</span>
        {!allowed && <span className="sv-nav-lock">◌</span>}
      </>
    );
    if (!allowed || !href || isActive) {
      return (
        <button
          onClick={(e) => { if (allowed) { e.preventDefault(); onNav && onNav(item.id); } }}
          className={className}
          disabled={!allowed}
          title={title}
        >{content}</button>
      );
    }
    return (
      <a href={href} className={className} title={title}>{content}</a>
    );
  };

  return (
    <aside className="sv-sidebar">
      <div className="sv-sb-head">
        <LogoFull />
        <button className="sv-org-switch" title="Switch organization">
          <span>Acme Digital</span>
          <span style={{ opacity: .5, marginLeft: 4 }}>{I.caret}</span>
        </button>
      </div>

      <nav className="sv-sb-nav">
        <div className="sv-sb-section">
          <div className="sv-sb-label">Visão</div>
          {topItems.map(it => <NavItem key={it.id} item={it} />)}
        </div>

        <div className="sv-sb-section">
          <div className="sv-sb-label">Projetos ativos</div>
          {data.projects.slice(0, 8).map(p => (
            <a key={p.id} className="sv-prj-item" href={`Spravio Project Detail.html?id=${encodeURIComponent(p.id)}`}>
              <span className="sv-prj-dot" data-h={p.health} />
              <span className="sv-prj-key">{p.key}</span>
              <span className="sv-prj-name">{p.name}</span>
            </a>
          ))}
          {data.projects.length > 8 && (
            <div className="sv-prj-more">+{data.projects.length - 8} mais</div>
          )}
        </div>
      </nav>

      <div className="sv-sb-foot">
        {bottomItems.map(it => <NavItem key={it.id} item={it} />)}
        <div className="sv-user">
          <div className="sv-user-avatar">MC</div>
          <div className="sv-user-info">
            <div className="sv-user-name">Maria Cristina</div>
            <div className="sv-user-role">{role === "OWNER" ? "Owner · Acme" : role === "PM" ? "Project Manager" : "Viewer"}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────────
function Topbar({ data, onOpenPalette, variation, onSwitchVariation, breadcrumb, showVariationToggle = false, rightExtra }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const bc = breadcrumb || [
    { label: "Acme Digital", muted: true },
    { label: "Portfolio" },
    { label: `${data.projects.length} projetos`, subtle: true },
  ];

  return (
    <header className="sv-topbar">
      <div className="sv-bread">
        {bc.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sv-bread-sep">{item.subtle ? "·" : "/"}</span>}
            <span className={`sv-bread-item ${item.muted ? "muted" : ""} ${item.subtle ? "subtle" : ""}`}>{item.label}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="sv-top-center">
        <button className="sv-cmd-btn" onClick={onOpenPalette}>
          {I.search}
          <span>Jump to… projetos, devs, PRs</span>
          <kbd>⌘K</kbd>
        </button>
      </div>

      <div className="sv-top-right">
        {showVariationToggle && (
          <div className="sv-variation-toggle">
            <button className={variation === "A" ? "on" : ""} onClick={() => onSwitchVariation && onSwitchVariation("A")}>A · Tabular</button>
            <button className={variation === "B" ? "on" : ""} onClick={() => onSwitchVariation && onSwitchVariation("B")}>B · Cards</button>
          </div>
        )}
        {rightExtra}
        <button className="sv-icon-btn" title="Notificações">
          {I.bell}
          <span className="sv-badge">3</span>
        </button>
        <div className="sv-last-sync">
          <span className="dot pulse" />
          <span className="label">Sincronizado</span>
          <span className="time">há 4min</span>
        </div>
        <button className="sv-new-btn" onClick={() => window.dispatchEvent(new CustomEvent("sv:new-project"))}>{I.plus} Novo projeto</button>
      </div>
    </header>
  );
}

// ─── KPI STRIP ───────────────────────────────────────────────────────
function KpiStrip({ data }) {
  const { kpis } = data;
  const { BurnTimeline, RingGauge, HealthPill } = window.SpravioCharts;

  return (
    <div className="sv-kpi-strip">
      <div className="sv-kpi sv-kpi-hero">
        <div className="sv-kpi-header">
          <span className="sv-kpi-label">Portfolio Health</span>
          <HealthPill status={kpis.avgHealth >= 70 ? "green" : kpis.avgHealth >= 45 ? "yellow" : "red"} score={kpis.avgHealth} compact />
        </div>
        <div className="sv-kpi-hero-row">
          <RingGauge value={kpis.avgHealth} size={72} thickness={7} />
          <div className="sv-kpi-hero-detail">
            <div className="sv-kpi-hero-meta">
              <span>{kpis.totalProjects - kpis.projectsAtRisk} on track</span>
              <span className="sep">·</span>
              <span style={{ color: "var(--warn)" }}>{kpis.projectsAtRisk} em risco</span>
            </div>
            <div className="sv-kpi-hero-sub">Score médio ponderado por orçamento</div>
          </div>
        </div>
      </div>

      <div className="sv-kpi">
        <div className="sv-kpi-label">Receita contratada (ano)</div>
        <div className="sv-kpi-value">
          R$ <span className="big">{(data.kpis.totalBudget / 1000).toFixed(1)}</span>
          <span className="suf">MM</span>
        </div>
        <div className="sv-kpi-sub">
          <span>Consumido R$ {(data.kpis.totalConsumed / 1000).toFixed(2)}MM</span>
          <span className="dim"> · {data.kpis.consumedPct}%</span>
        </div>
        <div style={{ marginTop: 6 }}>
          <window.SpravioCharts.BudgetMeter pct={data.kpis.consumedPct} height={4} />
        </div>
      </div>

      <div className="sv-kpi">
        <div className="sv-kpi-label">Burn rate (12 semanas)</div>
        <div style={{ marginTop: 4 }}>
          <BurnTimeline data={kpis.burnTimeline} width={220} height={44} />
        </div>
        <div className="sv-kpi-sub">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 2, background: "var(--accent)", borderRadius: 1 }} /> realizado
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 10 }}>
            <span style={{ width: 10, height: 0, borderTop: "1.5px dashed var(--ink-3)" }} /> planejado
          </span>
        </div>
      </div>

      <div className="sv-kpi">
        <div className="sv-kpi-label">PRs em atenção</div>
        <div className="sv-kpi-value">
          <span className="big">{kpis.totalStalePRs}</span>
          {kpis.criticalPRs > 0 && (
            <span className="sv-kpi-pill red">{kpis.criticalPRs} críticos</span>
          )}
        </div>
        <div className="sv-kpi-sub">
          <span>stale &gt;24h</span>
          <span className="dim"> · revisão pendente</span>
        </div>
      </div>

      <div className="sv-kpi">
        <div className="sv-kpi-label">Entregas no prazo</div>
        <div className="sv-kpi-value">
          <span className="big">{kpis.avgOnTime}</span>
          <span className="suf">%</span>
        </div>
        <div className="sv-kpi-sub">
          <span>prob. média · IA · 3+ sprints</span>
        </div>
      </div>

      <div className="sv-kpi">
        <div className="sv-kpi-label">Equipe ativa</div>
        <div className="sv-kpi-value">
          <span className="big">{kpis.totalDevelopers}</span>
          <span className="suf">devs</span>
        </div>
        <div className="sv-kpi-sub">
          <span>{kpis.totalIssuesActive} issues em execução</span>
        </div>
      </div>
    </div>
  );
}

// ─── COMMAND PALETTE ─────────────────────────────────────────────────
function CommandPalette({ open, onClose, data, onNav }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const items = useMemo(() => {
    const base = [
      ...data.projects.map(p => ({
        kind: "project", id: p.id, key: p.key, title: p.name, subtitle: p.client, meta: p.health,
      })),
      { kind: "action", id: "act-new-prj", title: "Novo projeto", subtitle: "Criar um novo projeto" },
      { kind: "action", id: "act-sync-all", title: "Sincronizar todos os projetos", subtitle: "Trigger manual · Jira, Azure, GitHub" },
      { kind: "action", id: "act-budget-report", title: "Exportar relatório financeiro", subtitle: "PDF mensal consolidado" },
      { kind: "nav", id: "nav-portfolio", title: "Portfolio", subtitle: "Visão consolidada" },
      { kind: "nav", id: "nav-forecast", title: "Forecast de entregas", subtitle: "Previsões IA" },
      { kind: "nav", id: "nav-devs", title: "Developers", subtitle: "Grid de performance" },
    ];
    if (!q) return base.slice(0, 8);
    const qLow = q.toLowerCase();
    return base.filter(it =>
      it.title.toLowerCase().includes(qLow) ||
      (it.subtitle && it.subtitle.toLowerCase().includes(qLow)) ||
      (it.key && it.key.toLowerCase().includes(qLow))
    ).slice(0, 12);
  }, [q, data]);

  if (!open) return null;

  return (
    <div className="sv-palette-bg" onClick={onClose}>
      <div className="sv-palette" onClick={e => e.stopPropagation()}>
        <div className="sv-palette-input">
          {I.search}
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Busque projetos, ações, navegue…" />
          <kbd>Esc</kbd>
        </div>
        <div className="sv-palette-list">
          {items.length === 0 && (
            <div className="sv-palette-empty">Nada encontrado para "{q}"</div>
          )}
          {items.map((it, i) => (
            <button key={it.id} className="sv-palette-item" onClick={() => { onClose(); it.kind === "nav" && onNav(it.id.replace("nav-","")); }}>
              <span className={`sv-palette-kind k-${it.kind}`}>
                {it.kind === "project" ? it.key : it.kind === "action" ? "→" : "#"}
              </span>
              <span className="sv-palette-title">{it.title}</span>
              <span className="sv-palette-sub">{it.subtitle}</span>
              {it.meta && <span className={`sv-health-dot h-${it.meta}`} />}
            </button>
          ))}
        </div>
        <div className="sv-palette-foot">
          <span><kbd>↑↓</kbd> navegar</span>
          <span><kbd>↵</kbd> selecionar</span>
          <span><kbd>⌘K</kbd> abrir / fechar</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  LogoMark, LogoFull, Sidebar, Topbar, KpiStrip, CommandPalette, I
});
