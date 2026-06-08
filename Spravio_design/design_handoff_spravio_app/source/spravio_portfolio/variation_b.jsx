// Variação B — Cards visuais + Portfolio Map (heatmap matricial)
// Mais visual, scan rápido por cor/forma. Cada projeto é um card rico + heatmap agregado em cima.

const { useState: useStateB, useMemo: useMemoB } = React;

function VariationB({ data, role }) {
  const { Sparkline, BudgetMeter, HealthPill, AvatarStack, BurndownMini, SourceIcon, Trend, ActivityHeat, RingGauge } = window.SpravioCharts;
  const [sortBy, setSortBy] = useStateB("health"); // health | budget | deadline | velocity
  const [filter, setFilter] = useStateB("all");
  const [hovered, setHovered] = useStateB(null);

  const filtered = useMemoB(() => {
    let list = [...data.projects];
    if (filter === "risk") list = list.filter(p => p.health === "yellow");
    if (filter === "critical") list = list.filter(p => p.health === "red");
    if (filter === "ontrack") list = list.filter(p => p.health === "green");

    if (sortBy === "health") list.sort((a, b) => a.healthScore - b.healthScore);
    else if (sortBy === "budget") list.sort((a, b) => b.consumedPct - a.consumedPct);
    else if (sortBy === "deadline") list.sort((a, b) => a.deadlineMonthsAway - b.deadlineMonthsAway);
    else if (sortBy === "velocity") list.sort((a, b) => b.velocityPoints - a.velocityPoints);
    return list;
  }, [data, sortBy, filter]);

  const counts = {
    all: data.projects.length,
    ontrack: data.projects.filter(p => p.health === "green").length,
    risk: data.projects.filter(p => p.health === "yellow").length,
    critical: data.projects.filter(p => p.health === "red").length,
  };

  return (
    <section className="sv-vb">
      {/* Portfolio Map — vista matricial: orçamento x risco */}
      <div className="sv-panel sv-portfolio-map">
        <div className="sv-panel-head">
          <div className="sv-panel-title-wrap">
            <h2 className="sv-panel-title">Mapa do Portfolio</h2>
            <span className="sv-panel-subtitle">Orçamento consumido × probabilidade de entrega · tamanho = receita</span>
          </div>
          <div className="sv-map-legend">
            <div><span className="sv-health-dot h-green" /> on track</div>
            <div><span className="sv-health-dot h-yellow" /> em risco</div>
            <div><span className="sv-health-dot h-red" /> crítico</div>
          </div>
        </div>
        <ScatterMap projects={data.projects} hovered={hovered} setHovered={setHovered} />
      </div>

      {/* Filter bar */}
      <div className="sv-vb-toolbar">
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
        <div className="sv-sort-group">
          <span className="sv-sort-label">Ordenar:</span>
          {[
            ["health", "Saúde"],
            ["budget", "Consumo $"],
            ["deadline", "Prazo"],
            ["velocity", "Velocity"],
          ].map(([k, l]) => (
            <button key={k} onClick={() => setSortBy(k)} className={sortBy === k ? "on" : ""}>{l}</button>
          ))}
        </div>
      </div>

      {/* Project cards */}
      <div className="sv-vb-grid">
        {filtered.map(p => (
          <ProjectCard key={p.id} project={p}
            hovered={hovered === p.id}
            onHover={() => setHovered(p.id)}
            onLeave={() => setHovered(null)}
          />
        ))}
      </div>
    </section>
  );
}

// ─── SCATTER MAP ─────────────────────────────────────────────────────
function ScatterMap({ projects, hovered, setHovered }) {
  const W = 1160, H = 300;
  const pad = { t: 20, r: 40, b: 34, l: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  // x = consumedPct (0-100), y = onTimeProb inverted (0 top, 100 bottom)
  const xScale = v => pad.l + (v / 100) * innerW;
  const yScale = v => pad.t + (1 - v / 100) * innerH;

  const maxBudget = Math.max(...projects.map(p => p.budgetK));
  const rScale = v => 6 + (v / maxBudget) * 16;

  return (
    <div className="sv-scatter-wrap">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="sv-scatter-svg">
        {/* Quadrant background */}
        <rect x={pad.l} y={pad.t} width={innerW / 2} height={innerH / 2}
          fill="color-mix(in oklab, var(--good) 5%, transparent)" />
        <rect x={pad.l + innerW/2} y={pad.t + innerH/2} width={innerW/2} height={innerH/2}
          fill="color-mix(in oklab, var(--bad) 8%, transparent)" />

        {/* Grid */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={`gx-${v}`}>
            <line x1={xScale(v)} y1={pad.t} x2={xScale(v)} y2={pad.t + innerH}
              stroke="var(--rule)" strokeWidth="1" strokeDasharray={v === 70 || v === 85 ? "0" : "2 4"} opacity={v === 70 || v === 85 ? 0.6 : 0.35} />
            <text x={xScale(v)} y={pad.t + innerH + 18} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)">{v}%</text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={`gy-${v}`}>
            <line x1={pad.l} y1={yScale(v)} x2={pad.l + innerW} y2={yScale(v)}
              stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 4" opacity="0.35" />
            <text x={pad.l - 8} y={yScale(v) + 3} textAnchor="end"
              fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)">{v}%</text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={pad.l + innerW/2} y={H - 6} textAnchor="middle"
          fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)"
          letterSpacing="0.1em">ORÇAMENTO CONSUMIDO →</text>
        <text x={10} y={pad.t + innerH/2} textAnchor="middle"
          transform={`rotate(-90 10 ${pad.t + innerH/2})`}
          fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-3)"
          letterSpacing="0.1em">← PROB. ENTREGA</text>

        {/* Quadrant labels */}
        <text x={pad.l + 12} y={pad.t + 18}
          fontFamily="var(--font-mono)" fontSize="9" fill="var(--good)"
          letterSpacing="0.1em" fontWeight="600">SAUDÁVEL</text>
        <text x={pad.l + innerW - 12} y={pad.t + innerH - 8} textAnchor="end"
          fontFamily="var(--font-mono)" fontSize="9" fill="var(--bad)"
          letterSpacing="0.1em" fontWeight="600">ZONA CRÍTICA</text>

        {/* Data points */}
        {projects.map(p => {
          const cx = xScale(p.consumedPct);
          const cy = yScale(p.onTimeProb);
          const r = rScale(p.budgetK);
          const color = p.health === "green" ? "var(--good)" : p.health === "yellow" ? "var(--warn)" : "var(--bad)";
          const isHovered = hovered === p.id;
          return (
            <g key={p.id} style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}>
              <circle cx={cx} cy={cy} r={r}
                fill={color} fillOpacity={isHovered ? 0.7 : 0.4}
                stroke={color} strokeWidth={isHovered ? 2 : 1.3} />
              <text x={cx} y={cy + 3} textAnchor="middle"
                fontFamily="var(--font-mono)" fontSize={Math.max(8, Math.min(11, r * 0.55))}
                fontWeight="600" fill={isHovered ? "white" : color}
                style={{ pointerEvents: "none" }}>{p.key}</text>
              {isHovered && (
                <g>
                  <rect x={cx + r + 8} y={cy - 22} width="180" height="44" rx="4"
                    fill="var(--paper)" stroke="var(--rule-2)" strokeWidth="1" />
                  <text x={cx + r + 14} y={cy - 9}
                    fontFamily="var(--font-body)" fontSize="11" fontWeight="600" fill="var(--ink)">{p.name}</text>
                  <text x={cx + r + 14} y={cy + 5}
                    fontFamily="var(--font-mono)" fontSize="9" fill="var(--ink-3)">{p.client}</text>
                  <text x={cx + r + 14} y={cy + 16}
                    fontFamily="var(--font-mono)" fontSize="10" fill={color} fontWeight="600">
                    R$ {p.budgetK}k · {p.onTimeProb}% prazo
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── PROJECT CARD ────────────────────────────────────────────────────
function ProjectCard({ project: p, hovered, onHover, onLeave }) {
  const { Sparkline, BudgetMeter, HealthPill, AvatarStack, BurndownMini, SourceIcon, Trend, ActivityHeat, RingGauge } = window.SpravioCharts;
  const sprintPct = Math.round((p.sprintCompleted / p.sprintTotalPoints) * 100);

  return (
    <article className={`sv-card ${hovered ? "hover" : ""}`}
      onMouseEnter={onHover} onMouseLeave={onLeave}
      data-health={p.health}>
      <div className="sv-card-accent" />

      <header className="sv-card-head">
        <div className="sv-card-head-l">
          <SourceIcon source={p.source} size={10} />
          <span className="sv-card-key">{p.key}</span>
          <HealthPill status={p.health} score={p.healthScore} compact />
        </div>
        <button className="sv-card-menu" title="Ações">⋯</button>
      </header>

      <div className="sv-card-body">
        <div className="sv-card-title-row">
          <h3 className="sv-card-title">{p.name}</h3>
          <RingGauge value={p.healthScore} size={42} thickness={4} />
        </div>
        <div className="sv-card-client">{p.client} · <span className="sv-sector">{p.clientSector}</span></div>

        <div className="sv-card-metrics">
          {/* Sprint */}
          <div className="sv-m">
            <div className="sv-m-label">Sprint {p.sprintNum}</div>
            <div className="sv-m-value">{p.sprintCompleted}<span className="dim">/{p.sprintTotalPoints}</span> <span className="suf">pts</span></div>
            <div className="sv-m-sub">
              <div className="sv-sp-bar slim">
                <div className="sv-sp-fill" style={{ width: `${sprintPct}%` }} />
              </div>
              <span>dia {p.sprintDay}/{p.sprintLength}</span>
            </div>
          </div>

          {/* Budget */}
          <div className="sv-m">
            <div className="sv-m-label">Orçamento</div>
            <div className="sv-m-value">
              <span className="sv-m-main">{p.consumedPct}<span className="suf">%</span></span>
              <span className="sv-m-side">R$ {p.budgetK}k</span>
            </div>
            <div className="sv-m-sub">
              <BudgetMeter pct={p.consumedPct} height={3} />
            </div>
          </div>

          {/* Forecast */}
          <div className="sv-m">
            <div className="sv-m-label">Entrega · IA</div>
            <div className="sv-m-value">
              <span className="sv-m-main" data-prob={p.onTimeProb >= 70 ? "good" : p.onTimeProb >= 45 ? "ok" : "bad"}>
                {p.onTimeProb}<span className="suf">%</span>
              </span>
              <span className="sv-m-side">{p.deadlineMonthsAway}mo</span>
            </div>
            <div className="sv-m-sub">
              <span>confiança {p.onTimeProb >= 70 ? "alta" : p.onTimeProb >= 45 ? "média" : "baixa"}</span>
            </div>
          </div>

          {/* Velocity */}
          <div className="sv-m">
            <div className="sv-m-label">Velocity</div>
            <div className="sv-m-value">
              <span className="sv-m-main">{p.velocityPoints}</span>
              <Trend direction={p.velocityTrend} />
            </div>
            <div className="sv-m-sub">
              <Sparkline data={p.velocitySpark} width={60} height={14} stroke="var(--ink-2)" fill />
            </div>
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="sv-card-activity">
          <div className="sv-ca-label">Últimos 14 dias</div>
          <ActivityHeat activity={p.activity} cell={11} gap={2} />
        </div>
      </div>

      <footer className="sv-card-foot">
        <div className="sv-card-foot-l">
          <AvatarStack people={p.team} max={4} size={22} />
          <span className="sv-team-label">{p.teamSize} devs</span>
        </div>
        <div className="sv-card-foot-r">
          {p.prsStale > 0 && (
            <span className={`sv-pr-chip ${p.prsCritical > 0 ? "red" : "yellow"}`}>
              <span className="dot" /> {p.prsStale} PRs stale
            </span>
          )}
          <span className="sv-sync-txt">↻ {p.lastSyncMin}m</span>
        </div>
      </footer>
    </article>
  );
}

Object.assign(window, { VariationB });
