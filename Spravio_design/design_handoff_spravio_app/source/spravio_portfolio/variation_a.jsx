// Variação A — Tabela densa Bloomberg/Linear
// Uma linha por projeto, muitas colunas, sparklines inline, hover-reveal de detalhes.

const { useState: useStateA, useMemo: useMemoA } = React;

function VariationA({ data, role }) {
  const { Sparkline, BudgetMeter, HealthPill, Stars, AvatarStack, BurndownMini, SourceIcon, Trend } = window.SpravioCharts;
  const [sortKey, setSortKey] = useStateA("healthScore");
  const [sortDir, setSortDir] = useStateA("asc");
  const [filter, setFilter] = useStateA("all"); // all | risk | critical | ontrack
  const [search, setSearch] = useStateA("");
  const [expanded, setExpanded] = useStateA(null);

  const sorted = useMemoA(() => {
    let list = [...data.projects];
    if (filter === "risk") list = list.filter(p => p.health === "yellow");
    if (filter === "critical") list = list.filter(p => p.health === "red");
    if (filter === "ontrack") list = list.filter(p => p.health === "green");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, sortKey, sortDir, filter, search]);

  const handleSort = (key) => {
    if (key === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortHeader = ({ k, label, align = "left" }) => (
    <th onClick={() => handleSort(k)} className="sv-th sortable" style={{ textAlign: align }}>
      <span>{label}</span>
      {sortKey === k && <span className="sv-sort-arrow">{sortDir === "asc" ? "↑" : "↓"}</span>}
    </th>
  );

  const counts = {
    all: data.projects.length,
    ontrack: data.projects.filter(p => p.health === "green").length,
    risk: data.projects.filter(p => p.health === "yellow").length,
    critical: data.projects.filter(p => p.health === "red").length,
  };

  return (
    <section className="sv-panel sv-va">
      <div className="sv-panel-head">
        <div className="sv-panel-title-wrap">
          <h2 className="sv-panel-title">Projetos</h2>
          <span className="sv-panel-count">{sorted.length} de {data.projects.length}</span>
        </div>

        <div className="sv-filter-chips">
          <button onClick={() => setFilter("all")} className={filter === "all" ? "on" : ""}>
            Todos <span className="n">{counts.all}</span>
          </button>
          <button onClick={() => setFilter("ontrack")} className={filter === "ontrack" ? "on" : ""}>
            <span className="sv-health-dot h-green" /> On track <span className="n">{counts.ontrack}</span>
          </button>
          <button onClick={() => setFilter("risk")} className={filter === "risk" ? "on" : ""}>
            <span className="sv-health-dot h-yellow" /> Em risco <span className="n">{counts.risk}</span>
          </button>
          <button onClick={() => setFilter("critical")} className={filter === "critical" ? "on" : ""}>
            <span className="sv-health-dot h-red" /> Crítico <span className="n">{counts.critical}</span>
          </button>
        </div>

        <div className="sv-panel-actions">
          <div className="sv-search">
            <span>{window.I.search}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar projetos..." />
          </div>
          <button className="sv-btn-ghost">Export CSV</button>
          <button className="sv-btn-ghost">{window.I.sync} Sync all</button>
        </div>
      </div>

      <div className="sv-table-wrap">
        <table className="sv-table">
          <thead>
            <tr>
              <th style={{ width: 16 }}></th>
              <SortHeader k="key" label="Key" />
              <SortHeader k="name" label="Projeto / Cliente" />
              <SortHeader k="healthScore" label="Health" />
              <th className="sv-th">Sprint atual</th>
              <th className="sv-th">Burndown</th>
              <SortHeader k="velocityPoints" label="Velocity" align="right" />
              <SortHeader k="consumedPct" label="Orçamento" align="right" />
              <th className="sv-th">Time</th>
              <SortHeader k="prsStale" label="PRs" align="right" />
              <SortHeader k="onTimeProb" label="Forecast" align="right" />
              <th className="sv-th" style={{ textAlign: "right" }}>Sync</th>
              <th style={{ width: 24 }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <React.Fragment key={p.id}>
                <tr className={`sv-row ${expanded === p.id ? "expanded" : ""}`}
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                  <td className="sv-cell">
                    <span className={`sv-row-indicator h-${p.health}`} />
                  </td>
                  <td className="sv-cell sv-cell-key">
                    <div className="sv-key-wrap">
                      <SourceIcon source={p.source} size={10} />
                      <span className="sv-key">{p.key}</span>
                    </div>
                  </td>
                  <td className="sv-cell sv-cell-name">
                    <div className="sv-name-wrap">
                      <div className="sv-prj-name">{p.name}</div>
                      <div className="sv-prj-client">{p.client} · <span className="sv-sector">{p.clientSector}</span></div>
                    </div>
                  </td>
                  <td className="sv-cell">
                    <HealthPill status={p.health} score={p.healthScore} compact />
                  </td>
                  <td className="sv-cell sv-sprint-col">
                    <div className="sv-sprint-info">
                      <div className="sv-sprint-label">S{p.sprintNum} · dia {p.sprintDay}/{p.sprintLength}</div>
                      <div className="sv-sprint-progress">
                        <div className="sv-sp-bar">
                          <div className="sv-sp-fill" style={{ width: `${(p.sprintCompleted / p.sprintTotalPoints) * 100}%` }} />
                        </div>
                        <span className="sv-sp-text">{p.sprintCompleted}/{p.sprintTotalPoints} pts</span>
                      </div>
                    </div>
                  </td>
                  <td className="sv-cell">
                    <BurndownMini burndown={p.burndown} width={80} height={22} />
                  </td>
                  <td className="sv-cell sv-num">
                    <div className="sv-velocity-cell">
                      <Sparkline data={p.velocitySpark} width={50} height={18} stroke="var(--ink-2)" />
                      <div className="sv-velocity-num">
                        <span className="sv-velocity-val">{p.velocityPoints}</span>
                        <Trend direction={p.velocityTrend} />
                      </div>
                    </div>
                  </td>
                  <td className="sv-cell sv-budget-col">
                    <div className="sv-budget-cell">
                      <div className="sv-budget-line">
                        <span className="sv-budget-pct">{p.consumedPct}%</span>
                        <span className="sv-budget-total">R$ {p.budgetK}k</span>
                      </div>
                      <BudgetMeter pct={p.consumedPct} height={4} />
                    </div>
                  </td>
                  <td className="sv-cell">
                    <AvatarStack people={p.team} max={4} size={20} />
                  </td>
                  <td className="sv-cell sv-num">
                    <div className="sv-pr-cell">
                      <span className={`sv-pr-open ${p.prsCritical > 0 ? "critical" : p.prsStale > 0 ? "stale" : ""}`}>
                        {p.prsOpen}
                      </span>
                      {p.prsStale > 0 && (
                        <span className="sv-pr-stale" title={`${p.prsStale} stale`}>
                          <span className={`dot ${p.prsCritical > 0 ? "red" : "yellow"}`} />
                          {p.prsStale}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="sv-cell sv-num">
                    <div className="sv-forecast-cell" data-prob={p.onTimeProb >= 70 ? "good" : p.onTimeProb >= 45 ? "ok" : "bad"}>
                      <div className="sv-forecast-bar">
                        <div className="sv-forecast-fill" style={{ width: `${p.onTimeProb}%` }} />
                      </div>
                      <span className="sv-forecast-num">{p.onTimeProb}%</span>
                    </div>
                  </td>
                  <td className="sv-cell sv-sync">
                    <span className="sv-sync-txt">há {p.lastSyncMin}min</span>
                  </td>
                  <td className="sv-cell">
                    <span className="sv-caret">{window.I.caret}</span>
                  </td>
                </tr>
                {expanded === p.id && <ExpandedRow project={p} />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className="sv-empty">
          Nenhum projeto corresponde ao filtro atual.
          <button className="sv-btn-ghost" onClick={() => { setFilter("all"); setSearch(""); }}>Limpar</button>
        </div>
      )}
    </section>
  );
}

function ExpandedRow({ project: p }) {
  const { Donut, Stars, ActivityHeat, Sparkline } = window.SpravioCharts;
  const segments = [
    { value: p.issuesDone, color: "var(--good)" },
    { value: p.issuesUAT, color: "var(--warn)" },
    { value: p.issuesTest, color: "var(--accent)" },
    { value: p.issuesInProgress, color: "var(--ink-2)" },
    { value: p.issuesTodo, color: "var(--rule-2)" },
  ];
  const totalIssues = segments.reduce((s, x) => s + x.value, 0);
  return (
    <tr className="sv-row-expand">
      <td colSpan={13}>
        <div className="sv-expand-grid">
          <div className="sv-expand-card">
            <div className="sv-expand-head">Distribuição de issues</div>
            <div className="sv-expand-donut">
              <Donut segments={segments} size={80} thickness={10} />
              <div className="sv-donut-legend">
                <div><span className="sw" style={{ background: "var(--good)" }} /> Done <b>{p.issuesDone}</b></div>
                <div><span className="sw" style={{ background: "var(--warn)" }} /> UAT <b>{p.issuesUAT}</b></div>
                <div><span className="sw" style={{ background: "var(--accent)" }} /> Test <b>{p.issuesTest}</b></div>
                <div><span className="sw" style={{ background: "var(--ink-2)" }} /> Dev <b>{p.issuesInProgress}</b></div>
                <div><span className="sw" style={{ background: "var(--rule-2)" }} /> Todo <b>{p.issuesTodo}</b></div>
              </div>
            </div>
          </div>

          <div className="sv-expand-card">
            <div className="sv-expand-head">Atividade — últimos 14 dias</div>
            <ActivityHeat activity={p.activity} cell={14} gap={3} />
            <div className="sv-expand-sub">
              <span>{p.activity.reduce((s,v)=>s+v,0)} eventos</span>
              <span className="dim">commits, PRs, status changes</span>
            </div>
          </div>

          <div className="sv-expand-card">
            <div className="sv-expand-head">Time & performance</div>
            <div className="sv-team-grid">
              {p.team.slice(0, 6).map((d, i) => (
                <div key={i} className="sv-team-row">
                  <div className="sv-team-avatar" style={{ background: d.color }}>{d.avatar}</div>
                  <div className="sv-team-info">
                    <div className="sv-team-name">{d.name}</div>
                    <div className="sv-team-role">{d.role} · R$ {d.rate}/h</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sv-expand-card">
            <div className="sv-expand-head">Forecast IA</div>
            <div className="sv-forecast-block">
              <div className="sv-forecast-big">{p.onTimeProb}<span>%</span></div>
              <div className="sv-forecast-label">prob. entrega no prazo</div>
              <div className="sv-forecast-reasoning">
                {p.onTimeProb >= 70
                  ? `Velocity estável em ${p.velocityPoints}pts/sprint. ${p.sprintTotalPoints - p.sprintCompleted}pts restantes são viáveis no ritmo atual.`
                  : p.onTimeProb >= 45
                  ? `Velocity em desaceleração. ${p.prsStale} PRs stale indicam gargalo em review. Considere redistribuir carga.`
                  : `Risco alto. Consumo orçamentário em ${p.consumedPct}% vs ${Math.round((p.sprintCompleted / p.sprintTotalPoints) * 100)}% do escopo. Recomenda-se revisão com o cliente.`
                }
              </div>
              <button className="sv-btn-ghost sm">Ver análise completa →</button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

Object.assign(window, { VariationA });
