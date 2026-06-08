// Forecast — previsão de receita + capacity + risco de entrega
const { useState, useMemo } = React;

function ForecastPage() {
  const shell = useSpravioShell("forecast");
  const { tweaks, setTweak, data, role, paletteOpen, setPaletteOpen, tweaksOpen, setTweaksOpen, nav } = shell;

  const [horizon, setHorizon] = useState("12m"); // 3m 6m 12m
  const [scenario, setScenario] = useState("base"); // pessim base optim

  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const fc = data.revenueForecast || [];
  const showMonths = horizon === "3m" ? 3 : horizon === "6m" ? 6 : 12;
  const scMult = scenario === "pessim" ? 0.78 : scenario === "optim" ? 1.15 : 1;
  const fcSlice = fc.slice(0, showMonths);

  const totals = useMemo(() => {
    const contracted = fcSlice.reduce((s, m) => s + m.contracted, 0);
    const pipeline = fcSlice.reduce((s, m) => s + m.pipeline, 0);
    const forecast = Math.round(fcSlice.reduce((s, m) => s + m.forecast, 0) * scMult);
    const goal = Math.round(contracted * 1.35);
    return { contracted, pipeline, forecast, goal, gap: forecast - goal };
  }, [fcSlice, scMult]);

  const breadcrumb = [
    { label: "Acme Digital", muted: true },
    { label: "Forecast" },
    { label: `Horizonte ${horizon} · cenário ${scenario === "pessim" ? "pessimista" : scenario === "optim" ? "otimista" : "base"}`, subtle: true },
  ];

  return (
    <>
      <div className="sv-app">
        <Sidebar current="forecast" onNav={nav} data={data} role={role} />
        <main className="sv-main">
          <Topbar data={data} onOpenPalette={() => setPaletteOpen(true)} breadcrumb={breadcrumb} />
          <RoleRestrictedNote role={role} pageId="forecast" />

          <div className="sv-filters-bar" style={{ gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Horizonte</span>
              <div className="sv-view-toggle">
                {[["3m","3m"],["6m","6m"],["12m","12m"]].map(([v,l]) => (
                  <button key={v} className={horizon === v ? "on" : ""} onClick={() => setHorizon(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cenário</span>
              <div className="sv-view-toggle">
                {[["pessim","Pessimista"],["base","Base"],["optim","Otimista"]].map(([v,l]) => (
                  <button key={v} className={scenario === v ? "on" : ""} onClick={() => setScenario(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button className="sv-btn">Export CSV</button>
              <button className="sv-btn">Compartilhar</button>
            </div>
          </div>

          <div className="sv-fc-content">
            {/* KPI strip */}
            <div className="sv-fc-kpi-grid">
              <ForecastKPI
                label="Contratado"
                value={`R$ ${(totals.contracted / 1000).toFixed(2)}`}
                unit="MM"
                sub={`${fcSlice.length} meses · ${data.projects.length} projetos ativos`}
              />
              <ForecastKPI
                label="Pipeline ponderado"
                value={`R$ ${(totals.pipeline / 1000).toFixed(2)}`}
                unit="MM"
                sub="Weighted por prob. de fechamento"
              />
              <ForecastKPI
                label={`Forecast · ${scenario === "pessim" ? "pessimista" : scenario === "optim" ? "otimista" : "base"}`}
                value={`R$ ${(totals.forecast / 1000).toFixed(2)}`}
                unit="MM"
                sub={`${totals.gap >= 0 ? "▲" : "▼"} R$ ${Math.abs(totals.gap / 1000).toFixed(2)}MM vs. meta`}
                subTone={totals.gap >= 0 ? "good" : "bad"}
                accent
              />
              <ForecastKPI
                label="Meta trimestre"
                value={`R$ ${(totals.goal / 1000).toFixed(2)}`}
                unit="MM"
                sub="Stretch goal · +35% vs. contratado"
              />
            </div>

            {/* Revenue forecast chart */}
            <ForecastChart fcSlice={fcSlice} months={months} scMult={scMult} />

            {/* Two-col: capacity + risk pipeline */}
            <div className="sv-fc-split">
              <CapacityHeatmap data={data} />
              <RiskPipeline data={data} scMult={scMult} />
            </div>

            {/* Scenarios + assumptions */}
            <ScenarioAssumptions totals={totals} scenario={scenario} />
          </div>

          <div className="sv-tweak-fab" onClick={() => setTweaksOpen(true)} title="Tweaks">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8"/></svg>
          </div>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} data={data} onNav={nav} />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} visible={tweaksOpen} onClose={() => setTweaksOpen(false)} />
    </>
  );
}

// ─── KPI tile ─────────────────────────────────────────────────────────
function ForecastKPI({ label, value, unit, sub, subTone, accent }) {
  return (
    <div
      className="sv-card"
      style={{
        padding: 16,
        background: accent ? "color-mix(in oklab, var(--accent) 6%, var(--bg-el))" : undefined,
        borderColor: accent ? "color-mix(in oklab, var(--accent) 30%, var(--rule))" : undefined,
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: accent ? "var(--accent)" : "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--ink)", letterSpacing: "-0.02em", marginTop: 6, lineHeight: 1 }}>
        {value}
        {unit && <span style={{ fontSize: 14, color: "var(--ink-3)", marginLeft: 2 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 11, color: subTone === "good" ? "var(--good)" : subTone === "bad" ? "var(--bad)" : "var(--ink-3)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

// ─── Revenue forecast chart (stacked bars + line) ─────────────────────
function ForecastChart({ fcSlice, months, scMult }) {
  const width = 960;
  const height = 300;
  const padL = 48;
  const padR = 24;
  const padT = 24;
  const padB = 42;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const maxVal = Math.max(
    ...fcSlice.map(m => m.contracted + m.pipeline),
    ...fcSlice.map(m => m.forecast * scMult)
  );
  const yMax = Math.ceil(maxVal / 500) * 500;
  const barW = (chartW / fcSlice.length) * 0.62;
  const step = chartW / fcSlice.length;

  const yFor = (v) => padT + chartH - (v / yMax) * chartH;

  const forecastPath = fcSlice.map((m, i) => {
    const x = padL + step * i + step / 2;
    const y = yFor(m.forecast * scMult);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(yMax * t));

  return (
    <div className="sv-card" style={{ padding: 20 }}>
      <div className="sv-card-head" style={{ marginBottom: 12 }}>
        <div>
          <div className="sv-card-title">Receita projetada por mês</div>
          <div className="sv-card-sub">Contratado + pipeline ponderado · linha = forecast no cenário selecionado</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--ink-2)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, background: "var(--accent)", borderRadius: 2 }} /> Contratado
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, background: "color-mix(in oklab, var(--accent) 35%, transparent)", borderRadius: 2, border: "1px dashed color-mix(in oklab, var(--accent) 60%, transparent)" }} /> Pipeline
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 14, height: 2, background: "var(--ink)", borderRadius: 1 }} /> Forecast
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Y grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={width - padR} y1={yFor(t)} y2={yFor(t)} stroke="var(--rule)" strokeDasharray={i === 0 ? "" : "2 3"} />
            <text x={padL - 8} y={yFor(t) + 3} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)">
              {t === 0 ? "0" : `${(t / 1000).toFixed(1)}M`}
            </text>
          </g>
        ))}

        {/* Bars */}
        {fcSlice.map((m, i) => {
          const x = padL + step * i + (step - barW) / 2;
          const contractedH = (m.contracted / yMax) * chartH;
          const pipelineH = (m.pipeline / yMax) * chartH;
          const baseY = padT + chartH;
          return (
            <g key={i}>
              <rect
                x={x}
                y={baseY - contractedH}
                width={barW}
                height={contractedH}
                fill="var(--accent)"
              />
              <rect
                x={x}
                y={baseY - contractedH - pipelineH}
                width={barW}
                height={pipelineH}
                fill="color-mix(in oklab, var(--accent) 25%, transparent)"
                stroke="color-mix(in oklab, var(--accent) 55%, transparent)"
                strokeDasharray="3 2"
                strokeWidth="1"
              />
              <text
                x={x + barW / 2}
                y={baseY + 18}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill="var(--ink-3)"
              >
                {months[m.month]}
              </text>
            </g>
          );
        })}

        {/* Forecast line */}
        <path d={forecastPath} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        {fcSlice.map((m, i) => {
          const x = padL + step * i + step / 2;
          const y = yFor(m.forecast * scMult);
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--bg-el)" stroke="var(--ink)" strokeWidth="1.5" />;
        })}
      </svg>

      {/* Monthly breakdown table */}
      <div className="sv-fc-breakdown">
        <div className="sv-fc-breakdown-head">
          <span>Mês</span>
          <span>Contratado</span>
          <span>Pipeline</span>
          <span>Forecast</span>
          <span>Δ vs. contratado</span>
        </div>
        {fcSlice.map(m => {
          const fcVal = Math.round(m.forecast * scMult);
          const delta = fcVal - m.contracted;
          return (
            <div key={m.month} className="sv-fc-breakdown-row">
              <span style={{ color: "var(--ink)" }}>{months[m.month]}</span>
              <span>R$ {(m.contracted / 1000).toFixed(2)}MM</span>
              <span style={{ color: "var(--ink-3)" }}>R$ {(m.pipeline / 1000).toFixed(2)}MM</span>
              <span style={{ color: "var(--ink)", fontWeight: 500 }}>R$ {(fcVal / 1000).toFixed(2)}MM</span>
              <span style={{ color: delta >= 0 ? "var(--good)" : "var(--bad)" }}>
                {delta >= 0 ? "+" : ""}{(delta / 1000).toFixed(2)}MM
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Capacity heatmap ─────────────────────────────────────────────────
function CapacityHeatmap({ data }) {
  const cap = (data.capacity || []).slice(0, 12);
  const weekLabels = Array.from({ length: 8 }, (_, i) => `W${i + 1}`);

  const legend = [
    { v: 0, label: "Livre", color: "color-mix(in oklab, var(--ink-3) 14%, var(--bg-el))" },
    { v: 1, label: "Ok", color: "color-mix(in oklab, var(--good) 32%, var(--bg-el))" },
    { v: 2, label: "Carregado", color: "color-mix(in oklab, var(--accent) 38%, var(--bg-el))" },
    { v: 3, label: "Saturado", color: "color-mix(in oklab, var(--warn) 60%, var(--bg-el))" },
    { v: 4, label: "Over", color: "color-mix(in oklab, var(--bad) 78%, var(--bg-el))" },
  ];
  const colorFor = (v) => legend[v].color;

  const totals = useMemo(() => {
    const flat = cap.flatMap(r => r.weeks);
    return {
      free: flat.filter(v => v === 0).length,
      ok: flat.filter(v => v === 1).length,
      loaded: flat.filter(v => v === 2).length,
      saturated: flat.filter(v => v === 3).length,
      over: flat.filter(v => v === 4).length,
      total: flat.length,
    };
  }, [cap]);

  const overPct = Math.round(((totals.saturated + totals.over) / Math.max(totals.total, 1)) * 100);

  return (
    <div className="sv-card" style={{ padding: 16 }}>
      <div className="sv-card-head" style={{ marginBottom: 12 }}>
        <div>
          <div className="sv-card-title">Capacity · próximas 8 semanas</div>
          <div className="sv-card-sub">{overPct}% da capacidade em saturação ou overallocation</div>
        </div>
        <button className="sv-btn" style={{ padding: "4px 10px", fontSize: 11 }}>Rebalancear</button>
      </div>

      <div className="sv-cap-heat">
        <div className="sv-cap-header">
          <span />
          {weekLabels.map(w => (
            <span key={w} className="sv-cap-wk">{w}</span>
          ))}
        </div>
        {cap.map((row, i) => (
          <div key={i} className="sv-cap-row">
            <div className="sv-cap-dev">
              <span className="sv-cap-dev-name">{row.dev.name}</span>
              <span className="sv-cap-dev-role">{row.dev.role || row.dev.seniority}</span>
            </div>
            {row.weeks.map((v, j) => (
              <div
                key={j}
                className="sv-cap-cell"
                style={{ background: colorFor(v) }}
                title={`${row.dev.name} · W${j + 1} · ${legend[v].label}`}
              >
                {v === 4 && <span className="sv-cap-cell-glyph">!</span>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="sv-cap-legend">
        {legend.map(l => (
          <span key={l.v} className="sv-cap-legend-item">
            <span className="sv-cap-legend-sw" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Risk pipeline (projetos × prob de entrega no prazo) ──────────────
function RiskPipeline({ data, scMult }) {
  const rows = useMemo(() => {
    return data.projects.map(p => {
      // Heurística leve: health + consumedPct → prob entrega no prazo
      const healthScore = p.healthStatus === "green" ? 85 : p.healthStatus === "yellow" ? 58 : 28;
      const burnPenalty = p.consumedPct > 90 ? -18 : p.consumedPct > 75 ? -6 : 2;
      const prob = Math.max(8, Math.min(98, healthScore + burnPenalty + Math.round((p.margin - 30) * 0.3)));
      return { p, prob };
    }).sort((a, b) => a.prob - b.prob);
  }, [data]);

  const avg = Math.round(rows.reduce((s, r) => s + r.prob, 0) / Math.max(rows.length, 1));

  return (
    <div className="sv-card" style={{ padding: 16 }}>
      <div className="sv-card-head" style={{ marginBottom: 12 }}>
        <div>
          <div className="sv-card-title">Risco de entrega por projeto</div>
          <div className="sv-card-sub">Probabilidade de entrega no prazo · média {avg}%</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>{rows.length} projetos</div>
      </div>

      <div className="sv-risk-list">
        {rows.map(({ p, prob }) => {
          const tone = prob < 40 ? "bad" : prob < 65 ? "warn" : "good";
          const toneVar = tone === "bad" ? "var(--bad)" : tone === "warn" ? "var(--warn)" : "var(--good)";
          return (
            <div key={p.id} className="sv-risk-row">
              <div className="sv-risk-lead">
                <span className="sv-risk-key" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)" }}>{p.key}</span>
                <span className="sv-risk-name">{p.name}</span>
                <span className="sv-risk-client">{p.client}</span>
              </div>
              <div className="sv-risk-bar-wrap">
                <div className="sv-risk-bar-track">
                  <div className="sv-risk-bar-fill" style={{ width: `${prob}%`, background: toneVar }} />
                </div>
                <span className="sv-risk-prob" style={{ color: toneVar }}>{prob}%</span>
              </div>
              <div className="sv-risk-meta">
                <span style={{ color: "var(--ink-3)" }}>R$ {(p.budgetK / 1000).toFixed(1)}MM</span>
                <span style={{ color: p.consumedPct > 90 ? "var(--bad)" : "var(--ink-3)" }}>{p.consumedPct}% burn</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Scenario assumptions ─────────────────────────────────────────────
function ScenarioAssumptions({ totals, scenario }) {
  const assumptions = {
    pessim: [
      ["Close rate de pipeline", "45%", "vs. histórico de 62%"],
      ["Churn mensal", "3.2%", "2 contratos perdidos"],
      ["Novos deals (mês)", "2", "pipeline frio"],
      ["Expansão em contas", "+5%", "receita conservadora"],
    ],
    base: [
      ["Close rate de pipeline", "62%", "média histórica dos últimos 12m"],
      ["Churn mensal", "1.8%", "~1 contrato por trimestre"],
      ["Novos deals (mês)", "4", "pipeline saudável"],
      ["Expansão em contas", "+12%", "upsell em 3 clientes"],
    ],
    optim: [
      ["Close rate de pipeline", "78%", "deals quentes + 2 RFPs em finalização"],
      ["Churn mensal", "0.5%", "sem perda esperada"],
      ["Novos deals (mês)", "6", "pipeline forte"],
      ["Expansão em contas", "+22%", "3 upsells + 1 novo projeto"],
    ],
  };
  const rows = assumptions[scenario];

  return (
    <div className="sv-card" style={{ padding: 16 }}>
      <div className="sv-card-head" style={{ marginBottom: 12 }}>
        <div>
          <div className="sv-card-title">Premissas do cenário</div>
          <div className="sv-card-sub">Variáveis usadas para calcular o forecast · edite para ajustar ao seu pipeline real</div>
        </div>
        <button className="sv-btn" style={{ padding: "4px 10px", fontSize: 11 }}>Editar premissas</button>
      </div>
      <div className="sv-fc-assum-grid">
        {rows.map(([k, v, hint], i) => (
          <div key={i} className="sv-fc-assum">
            <div className="sv-fc-assum-label">{k}</div>
            <div className="sv-fc-assum-val">{v}</div>
            <div className="sv-fc-assum-hint">{hint}</div>
          </div>
        ))}
      </div>
      <div className="sv-fc-assum-foot">
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Última revisão</span>
          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>há 3 dias · por <b>M. Costa</b></div>
        </div>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Confiança</span>
          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
            {scenario === "optim" ? "Baixa · 30%" : scenario === "pessim" ? "Alta · 80%" : "Média · 65%"}
          </div>
        </div>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Gap vs. meta</span>
          <div style={{ fontSize: 12, color: totals.gap >= 0 ? "var(--good)" : "var(--bad)" }}>
            {totals.gap >= 0 ? "+" : ""}R$ {(totals.gap / 1000).toFixed(2)}MM
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ForecastPage });
ReactDOM.createRoot(document.getElementById("root")).render(<ForecastPage />);
