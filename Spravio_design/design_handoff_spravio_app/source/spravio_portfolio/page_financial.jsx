// Financial — Budget tracker por projeto, faturamento, margem
const { useState, useMemo } = React;

function FinancialPage() {
  const shell = useSpravioShell("budget");
  const { tweaks, setTweak, data, role, paletteOpen, setPaletteOpen, tweaksOpen, setTweaksOpen, nav } = shell;
  const [period, setPeriod] = useState("ytd"); // ytd, q, m
  const [view, setView] = useState("overview"); // overview, projects, invoices

  const totals = useMemo(() => {
    const totalBudget = data.projects.reduce((s, p) => s + p.budgetK, 0);
    const totalConsumed = data.projects.reduce((s, p) => s + p.consumed, 0);
    const totalBilled = data.projects.reduce((s, p) => s + (p.billed || 0), 0);
    const totalOverdue = data.projects.reduce((s, p) => s + (p.overdue || 0), 0);
    const avgMargin = Math.round(data.projects.reduce((s, p) => s + p.margin, 0) / data.projects.length);
    const inbudget = data.projects.filter(p => p.consumedPct < 90).length;
    const overbudget = data.projects.filter(p => p.consumedPct >= 100).length;
    return { totalBudget, totalConsumed, totalBilled, totalOverdue, avgMargin, inbudget, overbudget };
  }, [data]);

  const breadcrumb = [
    { label: "Acme Digital", muted: true },
    { label: "Financials" },
    { label: `R$ ${(totals.totalBudget / 1000).toFixed(1)}MM contratado`, subtle: true },
  ];

  return (
    <>
      <div className="sv-app">
        <Sidebar current="budget" onNav={nav} data={data} role={role} />
        <main className="sv-main">
          <Topbar data={data} onOpenPalette={() => setPaletteOpen(true)} breadcrumb={breadcrumb} />
          <RoleRestrictedNote role={role} pageId="budget" />

          <div className="sv-tabs">
            <button className={`sv-tab ${view === "overview" ? "on" : ""}`} onClick={() => setView("overview")}>Overview</button>
            <button className={`sv-tab ${view === "projects" ? "on" : ""}`} onClick={() => setView("projects")}>Por projeto <span className="sv-tab-badge">{data.projects.length}</span></button>
            <button className={`sv-tab ${view === "invoices" ? "on" : ""}`} onClick={() => setView("invoices")}>Faturamento</button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingRight: 4 }}>
              <div className="sv-view-toggle">
                {[["ytd","YTD"],["q","Trimestre"],["m","Mês"]].map(([v,l]) => (
                  <button key={v} className={period === v ? "on" : ""} onClick={() => setPeriod(v)}>{l}</button>
                ))}
              </div>
              <button className="sv-btn">Export PDF</button>
            </div>
          </div>

          <div className="sv-fin-content">
            {view === "overview" && <FinOverview data={data} totals={totals} />}
            {view === "projects" && <FinProjects data={data} />}
            {view === "invoices" && <FinInvoices data={data} />}
          </div>
        </main>

        <div className="sv-tweak-fab" onClick={() => setTweaksOpen(true)} title="Tweaks">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8"/></svg>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} data={data} onNav={nav} />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} visible={tweaksOpen} onClose={() => setTweaksOpen(false)} />
    </>
  );
}

function FinOverview({ data, totals }) {
  const { BudgetMeter } = window.SpravioCharts;
  return (
    <>
      {/* KPI cards */}
      <div className="sv-fin-grid">
        <div className="sv-card">
          <div className="sv-card-sub" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Receita contratada</div>
          <div style={{ fontSize: 24, fontFamily: "var(--font-mono)", color: "var(--ink)", marginTop: 4 }}>
            R$ {(totals.totalBudget / 1000).toFixed(2)}<span style={{ fontSize: 14, opacity: 0.5, marginLeft: 2 }}>MM</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{data.projects.length} projetos ativos</div>
        </div>
        <div className="sv-card">
          <div className="sv-card-sub" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Consumido</div>
          <div style={{ fontSize: 24, fontFamily: "var(--font-mono)", color: "var(--ink)", marginTop: 4 }}>
            R$ {(totals.totalConsumed / 1000).toFixed(2)}<span style={{ fontSize: 14, opacity: 0.5, marginLeft: 2 }}>MM</span>
          </div>
          <div style={{ marginTop: 6 }}><BudgetMeter pct={Math.round(totals.totalConsumed / totals.totalBudget * 100)} height={4} /></div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{Math.round(totals.totalConsumed / totals.totalBudget * 100)}% do contratado</div>
        </div>
        <div className="sv-card">
          <div className="sv-card-sub" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Faturado (pago)</div>
          <div style={{ fontSize: 24, fontFamily: "var(--font-mono)", color: "var(--good)", marginTop: 4 }}>
            R$ {(totals.totalBilled / 1000).toFixed(2)}<span style={{ fontSize: 14, opacity: 0.5, marginLeft: 2 }}>MM</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>NF-e pagas · ano</div>
        </div>
        <div className="sv-card">
          <div className="sv-card-sub" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Em atraso</div>
          <div style={{ fontSize: 24, fontFamily: "var(--font-mono)", color: totals.totalOverdue > 0 ? "var(--bad)" : "var(--ink-3)", marginTop: 4 }}>
            R$ {totals.totalOverdue}<span style={{ fontSize: 14, opacity: 0.5, marginLeft: 2 }}>k</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
            {data.projects.filter(p => p.overdue > 0).length} projetos com overdue
          </div>
        </div>
      </div>

      {/* Burn timeline + Margin distribution */}
      <div className="sv-fin-main-grid">
        <div className="sv-card">
          <div className="sv-card-head">
            <div>
              <div className="sv-card-title">Burn mensal (12 meses)</div>
              <div className="sv-card-sub">Consumido vs. contratado · acumulado</div>
            </div>
          </div>
          <BurnMonthly timeline={data.kpis.burnTimeline} />
        </div>
        <div className="sv-card">
          <div className="sv-card-head">
            <div>
              <div className="sv-card-title">Distribuição de margem</div>
              <div className="sv-card-sub">{totals.avgMargin}% média · alvo 25%</div>
            </div>
          </div>
          <MarginDistribution projects={data.projects} target={25} />
        </div>
      </div>

      {/* Projects at risk */}
      <div className="sv-card">
        <div className="sv-card-head">
          <div>
            <div className="sv-card-title">Projetos em risco financeiro</div>
            <div className="sv-card-sub">Burn &gt; 85% ou margem &lt; 15%</div>
          </div>
        </div>
        <table className="sv-prj-table">
          <thead>
            <tr>
              <th>Projeto</th>
              <th>PM</th>
              <th>Orçamento</th>
              <th>Burn</th>
              <th>Margem</th>
              <th>Sinal</th>
              <th>Ação sugerida</th>
            </tr>
          </thead>
          <tbody>
            {data.projects.filter(p => p.consumedPct > 85 || p.margin < 15).map(p => (
              <tr key={p.id}>
                <td>
                  <a className="sv-project-link" href={`Spravio Project Detail.html?id=${encodeURIComponent(p.id)}`}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="sv-key-pill">{p.key}</span>
                      <span className="sv-p-name">{p.name}</span>
                    </span>
                    <span className="sv-p-client">{p.client}</span>
                  </a>
                </td>
                <td>{p.pm}</td>
                <td><span className="sv-num">R$ {p.budgetK}k</span></td>
                <td>
                  <BudgetMeter pct={p.consumedPct} width={80} height={4} />
                  <span className="sv-pct" style={{ color: p.consumedPct >= 100 ? "var(--bad)" : p.consumedPct >= 85 ? "var(--warn)" : "var(--ink-3)" }}>{p.consumedPct}%</span>
                </td>
                <td>
                  <span className="sv-num" style={{ color: p.margin < 10 ? "var(--bad)" : p.margin < 15 ? "var(--warn)" : "var(--good)" }}>{p.margin}%</span>
                </td>
                <td>
                  {p.consumedPct >= 100 && <span className="sv-sig bad">OVERBUDGET</span>}
                  {p.consumedPct >= 85 && p.consumedPct < 100 && <span className="sv-sig warn">ALTO BURN</span>}
                  {p.margin < 10 && <span className="sv-sig bad">MARGEM BAIXA</span>}
                </td>
                <td style={{ fontSize: 11, color: "var(--ink-2)" }}>
                  {p.consumedPct >= 100 ? "Abrir aditivo · conversar com cliente" :
                   p.consumedPct >= 85 ? "Revisar escopo restante, priorizar entregas" :
                   "Revisar alocação e seniority do time"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BurnMonthly({ timeline }) {
  const W = 520, H = 180, P = { t: 14, r: 14, b: 26, l: 36 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const n = timeline.length;
  const maxY = Math.max(...timeline.map(t => Math.max(t.spent, t.budget))) * 1.1;
  const xAt = (i) => P.l + (i / (n - 1)) * iw;
  const yAt = (v) => P.t + ih - (v / maxY) * ih;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <g key={f}>
          <line x1={P.l} x2={W - P.r} y1={yAt(maxY * f)} y2={yAt(maxY * f)} stroke="var(--rule)" strokeDasharray="2 3" />
          <text x={P.l - 6} y={yAt(maxY * f) + 3} fill="var(--ink-3)" fontSize="9" textAnchor="end" fontFamily="var(--font-mono)">{Math.round(maxY * f)}k</text>
        </g>
      ))}
      {timeline.map((t, i) => (
        <g key={i}>
          <rect x={xAt(i) - 12} y={yAt(t.spent)} width="24" height={ih - (yAt(t.spent) - P.t)} fill="oklch(from var(--accent) l c h / 0.7)" rx="1" />
          <line x1={xAt(i) - 14} x2={xAt(i) + 14} y1={yAt(t.budget)} y2={yAt(t.budget)} stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x={xAt(i)} y={H - 8} fill="var(--ink-3)" fontSize="8" textAnchor="middle">W{i+1}</text>
        </g>
      ))}
    </svg>
  );
}

function MarginDistribution({ projects, target }) {
  // Bucket by margin range
  const buckets = [
    { range: "< 0%",    min: -100, max: 0,    items: [], color: "var(--bad)" },
    { range: "0–10%",   min: 0,    max: 10,   items: [], color: "var(--bad)" },
    { range: "10–20%",  min: 10,   max: 20,   items: [], color: "var(--warn)" },
    { range: "20–30%",  min: 20,   max: 30,   items: [], color: "var(--good)" },
    { range: "30–40%",  min: 30,   max: 40,   items: [], color: "var(--good)" },
    { range: "> 40%",   min: 40,   max: 200,  items: [], color: "oklch(0.7 0.14 145)" },
  ];
  projects.forEach(p => {
    const b = buckets.find(b => p.margin >= b.min && p.margin < b.max);
    if (b) b.items.push(p);
  });
  const max = Math.max(...buckets.map(b => b.items.length));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "6px 0" }}>
      {buckets.map(b => (
        <div key={b.range} style={{ display: "grid", gridTemplateColumns: "60px 1fr 30px", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)" }}>{b.range}</span>
          <div style={{ background: "var(--bg-el-2)", borderRadius: 3, overflow: "hidden", height: 18 }}>
            <div style={{
              height: "100%",
              width: `${(b.items.length / max) * 100}%`,
              background: b.color,
              display: "flex",
              alignItems: "center",
              paddingLeft: 4,
              fontSize: 9,
              color: "var(--cream)",
              fontFamily: "var(--font-mono)",
            }}>
              {b.items.slice(0,3).map(p => p.key).join(" · ")}
            </div>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", textAlign: "right" }}>{b.items.length}</span>
        </div>
      ))}
    </div>
  );
}

function FinProjects({ data }) {
  const { BudgetMeter } = window.SpravioCharts;
  return (
    <div className="sv-card" style={{ padding: 0 }}>
      <table className="sv-prj-table">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Cliente</th>
            <th>Contratado</th>
            <th>Consumido</th>
            <th>Burn</th>
            <th>Faturado</th>
            <th>Em aberto</th>
            <th>Em atraso</th>
            <th>Margem</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.projects.map(p => {
            const open = (p.invoices || []).filter(i => i.status === "open").reduce((s,i)=>s+i.amount,0);
            return (
              <tr key={p.id}>
                <td>
                  <a className="sv-project-link" href={`Spravio Project Detail.html?id=${encodeURIComponent(p.id)}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="sv-key-pill">{p.key}</span>
                    <span className="sv-p-name">{p.name}</span>
                  </a>
                </td>
                <td style={{ color: "var(--ink-2)" }}>{p.client}</td>
                <td><span className="sv-num">R$ {p.budgetK}k</span></td>
                <td><span className="sv-num">R$ {Math.round(p.consumed)}k</span></td>
                <td>
                  <BudgetMeter pct={p.consumedPct} width={70} height={4} />
                  <span className="sv-pct">{p.consumedPct}%</span>
                </td>
                <td><span className="sv-num" style={{ color: "var(--good)" }}>R$ {p.billed || 0}k</span></td>
                <td><span className="sv-num" style={{ color: "var(--ink-2)" }}>R$ {open}k</span></td>
                <td>{p.overdue > 0 ? <span className="sv-num" style={{ color: "var(--bad)" }}>R$ {p.overdue}k</span> : <span style={{ color: "var(--ink-3)" }}>—</span>}</td>
                <td><span className="sv-num" style={{ color: p.margin < 15 ? "var(--bad)" : p.margin < 25 ? "var(--warn)" : "var(--good)" }}>{p.margin}%</span></td>
                <td>
                  {p.consumedPct >= 100 ? <span className="sv-sig bad">Overbudget</span>
                   : p.consumedPct >= 85 ? <span className="sv-sig warn">Alerta</span>
                   : <span className="sv-sig good">OK</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FinInvoices({ data }) {
  const allInvoices = data.projects.flatMap(p => (p.invoices || []).map(i => ({ ...i, project: p.key, projectName: p.name, client: p.client, pId: p.id })));
  allInvoices.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  return (
    <div className="sv-card" style={{ padding: 0 }}>
      <table className="sv-prj-table">
        <thead>
          <tr>
            <th>NF-e</th>
            <th>Projeto</th>
            <th>Cliente</th>
            <th>Vencimento</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Pago em</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {allInvoices.map((inv, i) => (
            <tr key={i}>
              <td><span className="sv-num">{inv.number}</span></td>
              <td><a href={`Spravio Project Detail.html?id=${encodeURIComponent(inv.pId)}`} className="sv-project-link" style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><span className="sv-key-pill">{inv.project}</span><span className="sv-p-name">{inv.projectName}</span></a></td>
              <td style={{ color: "var(--ink-2)" }}>{inv.client}</td>
              <td><span className="sv-num">{inv.dueDate}</span></td>
              <td><span className="sv-num" style={{ fontWeight: 600 }}>R$ {inv.amount}k</span></td>
              <td>
                {inv.status === "paid"    && <span className="sv-sig good">Pago</span>}
                {inv.status === "open"    && <span className="sv-sig warn">Em aberto</span>}
                {inv.status === "overdue" && <span className="sv-sig bad">Em atraso</span>}
              </td>
              <td style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{inv.paidDate || "—"}</td>
              <td>
                <button className="sv-btn" style={{ padding: "3px 8px", fontSize: 11 }}>PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { FinancialPage });
ReactDOM.createRoot(document.getElementById("root")).render(<FinancialPage />);
