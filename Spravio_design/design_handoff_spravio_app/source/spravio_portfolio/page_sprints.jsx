// Sprints — visão consolidada de sprints ativas em todos os projetos
const { useState, useEffect, useMemo } = React;

function SprintsPage() {
  const shell = useSpravioShell("sprints");
  const { tweaks, setTweak, data, role, paletteOpen, setPaletteOpen, tweaksOpen, setTweaksOpen, nav } = shell;

  const [selectedId, setSelectedId] = useState(data.projects[0]?.id);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, ontrack, atrisk, overdue

  const filteredPrjs = useMemo(() => {
    let arr = data.projects;
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(p => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q));
    }
    if (filter === "ontrack") arr = arr.filter(p => p.health === "green");
    if (filter === "atrisk") arr = arr.filter(p => p.health === "yellow");
    if (filter === "overdue") arr = arr.filter(p => p.health === "red");
    return arr;
  }, [data, search, filter]);

  const selected = data.projects.find(p => p.id === selectedId) || data.projects[0];

  const breadcrumb = [
    { label: "Acme Digital", muted: true },
    { label: "Sprints" },
    { label: `${filteredPrjs.length} ativas`, subtle: true },
  ];

  return (
    <>
      <div className="sv-app">
        <Sidebar current="sprints" onNav={nav} data={data} role={role} />
        <main className="sv-main">
          <Topbar data={data} onOpenPalette={() => setPaletteOpen(true)} breadcrumb={breadcrumb} />
          <RoleRestrictedNote role={role} pageId="sprints" />

          <div className="sv-sprints-content">
            <div>
              <div className="sv-filters-search" style={{ marginBottom: 10 }}>
                {I.search}
                <input placeholder="Buscar sprint ou projeto…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="sv-filter-chips" style={{ marginBottom: 12 }}>
                {[["all","Todas"],["ontrack","No prazo"],["atrisk","Atenção"],["overdue","Em risco"]].map(([v,l]) => (
                  <button key={v} className={`sv-fchip ${filter === v ? "active" : ""}`} onClick={() => setFilter(v)}>
                    <span className="sv-fchip-value">{l}</span>
                  </button>
                ))}
              </div>

              <div className="sv-sprint-list">
                {filteredPrjs.map(p => (
                  <div key={p.id} className={`sv-sprint-list-item ${selectedId === p.id ? "on" : ""}`} onClick={() => setSelectedId(p.id)}>
                    <div className="sv-sprint-list-row">
                      <span className="sv-sprint-list-key">{p.key}</span>
                      <window.SpravioCharts.HealthPill status={p.health} score={p.healthScore} compact />
                    </div>
                    <div className="sv-sprint-list-row">
                      <span className="sv-sprint-list-name">{p.name}</span>
                      <span className="sv-sprint-list-day">D{p.sprintDay}/{p.sprintLength}</span>
                    </div>
                    <div className="sv-sprint-list-goal">
                      {p.sprintHistory?.[p.sprintHistory.length - 1]?.goal || "—"}
                    </div>
                    <div>
                      <window.SpravioCharts.BudgetMeter pct={Math.round(p.sprintCompleted / p.sprintTotalPoints * 100)} height={3} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sv-sprint-main">
              {selected && <SprintDetail prj={selected} />}
            </div>
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

function SprintDetail({ prj }) {
  const { HealthPill, BudgetMeter } = window.SpravioCharts;
  const completed = prj.sprintCompleted;
  const total = prj.sprintTotalPoints;
  const pct = Math.round(completed / total * 100);

  // Burndown: ideal vs realizado
  const days = prj.sprintLength;
  const idealSeries = Array.from({ length: days + 1 }, (_, i) => total * (1 - i / days));
  const realizedSeries = Array.from({ length: prj.sprintDay + 1 }, (_, i) => {
    const variance = 0.1 * Math.sin(i * 0.7);
    const factor = (1 - (i / days) * (completed / total) * 1.05) + variance;
    return Math.max(0, Math.round(total * factor));
  });

  const lastSprint = prj.sprintHistory?.[prj.sprintHistory.length - 1];
  const goal = lastSprint?.goal || "Sem goal definida";

  // Fake kanban cards distribuídos pelos status
  const kanbanCards = [
    { st: "todo",    n: prj.issuesTodo,       titles: ["Validação CPF edge cases","Email templating refactor","Logs estruturados","Paginação admin","Metrics endpoint"] },
    { st: "doing",   n: prj.issuesInProgress, titles: ["Pricing service split","Bulk export XLSX","Typeahead search","Redis cache warming"] },
    { st: "review",  n: Math.ceil(prj.issuesInProgress / 2), titles: ["PR #2341 awaiting","Code review webhook","UX review homepage"] },
    { st: "test",    n: prj.issuesTest,       titles: ["QA homologação","Regression suite","Smoke tests mobile"] },
    { st: "done",    n: prj.issuesDone,       titles: ["Auth SSO AD","Index DB","Cron job nightly"] },
  ];

  return (
    <>
      <div className="sv-sprint-hero">
        <div className="sv-sprint-hero-top">
          <div>
            <h1 className="sv-sprint-title">
              <span className="sv-key-pill">{prj.key}</span> Sprint #{prj.sprintNum}
            </h1>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
              <b>Goal:</b> {goal} · <span style={{ color: "var(--ink-3)" }}>{prj.name}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <HealthPill status={prj.health} score={prj.healthScore} />
            <a className="sv-btn primary" href={`Spravio Project Detail.html?id=${encodeURIComponent(prj.id)}`}>Ver projeto →</a>
          </div>
        </div>

        <div className="sv-sprint-hero-kpis">
          <div className="sv-sprint-hero-kpi">
            <div className="sv-sprint-kpi-label">Progresso</div>
            <div className="sv-sprint-kpi-value">{completed}<span style={{ opacity: 0.5, fontSize: 13 }}>/{total}pts</span></div>
            <div style={{ marginTop: 4 }}><BudgetMeter pct={pct} height={4} /></div>
          </div>
          <div className="sv-sprint-hero-kpi">
            <div className="sv-sprint-kpi-label">Dia da sprint</div>
            <div className="sv-sprint-kpi-value">{prj.sprintDay}<span style={{ opacity: 0.5, fontSize: 13 }}>/{prj.sprintLength}</span></div>
          </div>
          <div className="sv-sprint-hero-kpi">
            <div className="sv-sprint-kpi-label">Velocity média</div>
            <div className="sv-sprint-kpi-value">{prj.velocityPoints}<span style={{ opacity: 0.5, fontSize: 13 }}>pts</span></div>
          </div>
          <div className="sv-sprint-hero-kpi">
            <div className="sv-sprint-kpi-label">% no prazo (IA)</div>
            <div className="sv-sprint-kpi-value" style={{ color: prj.onTimeProb >= 75 ? "var(--good)" : prj.onTimeProb >= 55 ? "var(--warn)" : "var(--bad)" }}>
              {prj.onTimeProb}<span style={{ fontSize: 13, opacity: 0.7 }}>%</span>
            </div>
          </div>
          <div className="sv-sprint-hero-kpi">
            <div className="sv-sprint-kpi-label">PRs abertos</div>
            <div className="sv-sprint-kpi-value">
              {prj.prsOpen}
              {prj.prsStale > 0 && <span style={{ fontSize: 11, color: "var(--warn)", marginLeft: 6 }}>⚠ {prj.prsStale}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Burndown chart */}
      <div className="sv-card">
        <div className="sv-card-head">
          <div>
            <div className="sv-card-title">Burndown</div>
            <div className="sv-card-sub">Ideal (linha) vs. realizado (área) em story points</div>
          </div>
          <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--ink-3)" }}>
            <span><span style={{ display: "inline-block", width: 10, height: 2, background: "var(--ink-3)", marginRight: 4, verticalAlign: "middle" }} /> ideal</span>
            <span><span style={{ display: "inline-block", width: 10, height: 6, background: "oklch(from var(--accent) l c h / 0.3)", border: "1px solid var(--accent)", marginRight: 4, verticalAlign: "middle" }} /> realizado</span>
          </div>
        </div>
        <BurndownChart ideal={idealSeries} realized={realizedSeries} total={total} dayLabels={days} currentDay={prj.sprintDay} />
      </div>

      {/* Kanban mini */}
      <div className="sv-card">
        <div className="sv-card-head">
          <div>
            <div className="sv-card-title">Board · {prj.issuesTodo + prj.issuesInProgress + prj.issuesTest + prj.issuesUAT + prj.issuesDone} issues</div>
            <div className="sv-card-sub">Snapshot da sprint atual · sync há 4min</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="sv-btn">Abrir no Jira ↗</button>
            <button className="sv-btn">Exportar</button>
          </div>
        </div>

        <div className="sv-kanban">
          {kanbanCards.map(col => (
            <div key={col.st} className="sv-kanban-col">
              <div className="sv-kanban-col-head">
                <span className="sv-kanban-col-title">{col.st === "todo" ? "To do" : col.st === "doing" ? "Doing" : col.st === "review" ? "Review" : col.st === "test" ? "QA" : "Done"}</span>
                <span className="sv-kanban-col-count">{col.n}</span>
              </div>
              <div className="sv-kanban-col-body">
                {Array.from({ length: Math.min(col.n, 6) }, (_, i) => {
                  const title = col.titles[i % col.titles.length];
                  const pts = [1,2,3,5,8][i % 5];
                  const who = prj.team[i % prj.team.length];
                  return (
                    <div key={i} className="sv-kanban-card">
                      <div className="sv-kanban-card-title">{title}</div>
                      <div className="sv-kanban-card-foot">
                        <span>{prj.key}-{200 + i + col.n * 3}</span>
                        <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <span className="sv-kanban-card-pts">{pts}pts</span>
                          <span className="sv-avatar-xs" style={{ background: `oklch(0.55 0.12 ${(i * 80) % 360})` }}>
                            {who.name.split(" ").map(s => s[0]).slice(0,2).join("")}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
                {col.n > 6 && <div style={{ textAlign: "center", fontSize: 10, color: "var(--ink-3)", padding: 4 }}>+ {col.n - 6} mais</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico */}
      <div className="sv-card">
        <div className="sv-card-head">
          <div>
            <div className="sv-card-title">Histórico das últimas sprints</div>
            <div className="sv-card-sub">Committed vs. delivered · carry-over</div>
          </div>
        </div>
        <table className="sv-prj-table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Sprint</th>
              <th>Goal</th>
              <th>Committed</th>
              <th>Delivered</th>
              <th>Carry-over</th>
              <th>Bugs</th>
              <th>Δ delivery</th>
            </tr>
          </thead>
          <tbody>
            {(prj.sprintHistory || []).map(s => {
              const delivery = Math.round(s.delivered / s.committed * 100);
              return (
                <tr key={s.num}>
                  <td><span className="sv-num">#{s.num}</span>{s.isCurrent && <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: 6 }}>atual</span>}</td>
                  <td style={{ color: "var(--ink-2)", whiteSpace: "normal" }}>{s.goal}</td>
                  <td><span className="sv-num">{s.committed}</span></td>
                  <td><span className="sv-num">{s.delivered}</span></td>
                  <td>{s.carryOver > 0 ? <span className="sv-num" style={{ color: "var(--warn)" }}>+{s.carryOver}</span> : <span style={{ color: "var(--ink-3)" }}>—</span>}</td>
                  <td>{s.bugs > 0 ? <span className="sv-num" style={{ color: "var(--bad)" }}>{s.bugs}</span> : <span style={{ color: "var(--ink-3)" }}>—</span>}</td>
                  <td>
                    <span style={{ color: delivery >= 85 ? "var(--good)" : delivery >= 60 ? "var(--warn)" : "var(--bad)" }} className="sv-num">{delivery}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BurndownChart({ ideal, realized, total, dayLabels, currentDay }) {
  const W = 900, H = 180, P = { t: 16, r: 16, b: 30, l: 40 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const maxY = total;
  const days = ideal.length - 1;
  const xAt = (i) => P.l + (i / days) * iw;
  const yAt = (v) => P.t + ih - (v / maxY) * ih;

  const idealPath = ideal.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(v)}`).join(" ");
  const realPath = realized.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(v)}`).join(" ");
  const realArea = realPath + ` L${xAt(realized.length - 1)},${yAt(0)} L${xAt(0)},${yAt(0)} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <g key={f}>
          <line x1={P.l} x2={W - P.r} y1={yAt(maxY * f)} y2={yAt(maxY * f)} stroke="var(--rule)" strokeDasharray="2 3" />
          <text x={P.l - 6} y={yAt(maxY * f) + 3} fill="var(--ink-3)" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">{Math.round(maxY * f)}</text>
        </g>
      ))}
      {/* X axis days */}
      {Array.from({ length: days + 1 }, (_, i) => (
        <text key={i} x={xAt(i)} y={H - 10} fill="var(--ink-3)" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">D{i}</text>
      ))}
      {/* Current day marker */}
      <line x1={xAt(currentDay)} x2={xAt(currentDay)} y1={P.t} y2={H - P.b} stroke="var(--accent)" strokeDasharray="3 2" opacity="0.5" />
      <text x={xAt(currentDay)} y={P.t - 4} fill="var(--accent)" fontSize="10" textAnchor="middle">hoje</text>

      {/* Ideal line */}
      <path d={idealPath} fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Realized area + line */}
      <path d={realArea} fill="oklch(from var(--accent) l c h / 0.15)" />
      <path d={realPath} fill="none" stroke="var(--accent)" strokeWidth="2" />
      {/* Dots */}
      {realized.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(v)} r="2.5" fill="var(--accent)" />
      ))}
    </svg>
  );
}

Object.assign(window, { SprintsPage });
ReactDOM.createRoot(document.getElementById("root")).render(<SprintsPage />);
