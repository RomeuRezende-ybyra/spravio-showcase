// Integrations — lista de serviços conectados (Jira, GitHub, Slack, Stripe, etc.)
const { useState, useMemo } = React;

function IntegrationsPage() {
  const shell = useSpravioShell("integrations");
  const { tweaks, setTweak, data, role, paletteOpen, setPaletteOpen, tweaksOpen, setTweaksOpen, nav } = shell;

  const integs = window.SPRAVIO_INTEGRATIONS || [];
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const counts = useMemo(() => ({
    all: integs.length,
    connected: integs.filter(i => i.status === "connected").length,
    disconnected: integs.filter(i => i.status === "disconnected").length,
    error: integs.filter(i => i.status === "error").length,
  }), [integs]);

  const filtered = useMemo(() => {
    let arr = integs;
    if (filter !== "all") arr = arr.filter(i => i.status === filter);
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(i => i.name.toLowerCase().includes(q) || i.vendor.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q));
    }
    return arr;
  }, [integs, filter, search]);

  // Agrupar por categoria
  const groups = useMemo(() => {
    const m = new Map();
    filtered.forEach(i => {
      if (!m.has(i.cat)) m.set(i.cat, []);
      m.get(i.cat).push(i);
    });
    return [...m.entries()];
  }, [filtered]);

  const events24h = integs.reduce((s, i) => s + i.events24h, 0);
  const errored = integs.filter(i => i.status === "error");

  const breadcrumb = [
    { label: "Acme Digital", muted: true },
    { label: "Integrações" },
    { label: `${counts.connected} de ${counts.all} conectadas`, subtle: true },
  ];

  return (
    <>
      <div className="sv-app">
        <Sidebar current="integrations" onNav={nav} data={data} role={role} />
        <main className="sv-main">
          <Topbar data={data} onOpenPalette={() => setPaletteOpen(true)} breadcrumb={breadcrumb} />
          <RoleRestrictedNote role={role} pageId="integrations" />

          <div className="sv-filters-bar">
            <div className="sv-filters-search">
              {I.search}
              <input placeholder="Buscar integração…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="sv-clear-btn" onClick={() => setSearch("")}>×</button>}
            </div>
            <div className="sv-filter-chips">
              {[["all", "Todas"], ["connected", "Conectadas"], ["disconnected", "Disponíveis"], ["error", "Com erro"]].map(([v, l]) => (
                <button key={v} className={`sv-fchip ${filter === v ? "active" : ""}`} onClick={() => setFilter(v)}>
                  <span className="sv-fchip-label">{l}</span>
                  <span className="sv-fchip-value" style={{ color: "var(--ink-3)" }}>{counts[v]}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="sv-btn">Ver logs</button>
              <button className="sv-btn primary">+ Adicionar</button>
            </div>
          </div>

          <div className="sv-int-content">
            {/* Hero: stats row */}
            <div className="sv-card" style={{ marginBottom: 16, padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                <StatBlock label="Eventos · 24h" value={events24h.toLocaleString("pt-BR")} sub={`${integs.filter(i=>i.status==="connected").length} fontes ativas`} />
                <StatBlock label="Última sync" value="há 1min" sub="GitHub · automático" />
                <StatBlock label="Integrações com erro" value={errored.length} sub={errored.length ? errored.map(e => e.name).join(" · ") : "Tudo em ordem"} tone={errored.length ? "bad" : "good"} />
                <StatBlock label="Projetos cobertos" value={`${data.projects.length}/${data.projects.length}`} sub="100% sincronizados" tone="good" />
              </div>
            </div>

            {errored.length > 0 && (
              <div className="sv-card" style={{ marginBottom: 16, padding: 14, borderColor: "oklch(from var(--bad) l c h / 0.4)", background: "oklch(from var(--bad) l c h / 0.08)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "oklch(from var(--bad) l c h / 0.2)", color: "var(--bad)", display: "grid", placeItems: "center", fontWeight: 700 }}>!</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{errored.length} integração{errored.length > 1 ? "ões" : ""} precisa{errored.length > 1 ? "m" : ""} de atenção</div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
                      {errored.map(e => e.name).join(", ")} — reautentique para continuar recebendo eventos.
                    </div>
                  </div>
                  <button className="sv-btn primary">Resolver</button>
                </div>
              </div>
            )}

            {groups.map(([cat, list]) => (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {cat} <span style={{ marginLeft: 4, color: "var(--ink-3)", opacity: 0.7 }}>· {list.length}</span>
                  </div>
                </div>
                <div className="sv-int-grid">
                  {list.map(integ => <IntegrationCard key={integ.id} integ={integ} onClick={() => setSelected(integ)} />)}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ padding: 60, textAlign: "center", color: "var(--ink-3)" }}>
                Nenhuma integração encontrada para "{search}"
              </div>
            )}
          </div>
        </main>

        <div className="sv-tweak-fab" onClick={() => setTweaksOpen(true)} title="Tweaks">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8"/></svg>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} data={data} onNav={nav} />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} visible={tweaksOpen} onClose={() => setTweaksOpen(false)} />
      {selected && <IntegrationDetail integ={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function StatBlock({ label, value, sub, tone }) {
  const color = tone === "bad" ? "var(--bad)" : tone === "good" ? "var(--good)" : "var(--ink)";
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color, letterSpacing: "-0.02em", marginTop: 4, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function IntegrationCard({ integ, onClick }) {
  const letter = integ.name[0].toUpperCase();
  return (
    <div className="sv-int-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="sv-int-card-head">
        <div className="sv-int-logo" style={{ background: integ.color }}>{letter}</div>
        <div className="sv-int-name">
          <div className="sv-int-vendor">{integ.name}</div>
          <div className="sv-int-cat">{integ.vendor} · {integ.cat}</div>
        </div>
        <div className={`sv-int-status-pill ${integ.status}`}>
          <span className="dot"></span>
          {integ.status === "connected" ? "Conectado" : integ.status === "error" ? "Erro" : "Off"}
        </div>
      </div>

      {integ.scopes.length > 0 && (
        <div className="sv-int-scopes">
          {integ.scopes.slice(0, 3).map(s => <span key={s} className="sv-int-scope">{s}</span>)}
          {integ.scopes.length > 3 && <span className="sv-int-scope">+{integ.scopes.length - 3}</span>}
        </div>
      )}

      <div className="sv-int-stats">
        <div>
          <div className="sv-int-stat-label">Projetos</div>
          <div className="sv-int-stat-value">{integ.projects}</div>
        </div>
        <div>
          <div className="sv-int-stat-label">Eventos 24h</div>
          <div className="sv-int-stat-value">{integ.events24h.toLocaleString("pt-BR")}</div>
        </div>
        <div>
          <div className="sv-int-stat-label">Última sync</div>
          <div className="sv-int-stat-value">{integ.lastSync}</div>
        </div>
      </div>

      <div className="sv-int-actions">
        {integ.status === "connected" ? (
          <>
            <button className="sv-int-btn">Configurar</button>
            <button className="sv-int-btn danger">Desconectar</button>
          </>
        ) : integ.status === "error" ? (
          <button className="sv-int-btn primary" style={{ flex: 1 }}>Reconectar</button>
        ) : (
          <button className="sv-int-btn primary" style={{ flex: 1 }}>Conectar</button>
        )}
      </div>
    </div>
  );
}

function IntegrationDetail({ integ, onClose }) {
  const letter = integ.name[0].toUpperCase();
  return (
    <div className="sv-modal-bg" onClick={onClose}>
      <div className="sv-modal" onClick={e => e.stopPropagation()} style={{ width: 640 }}>
        <div className="sv-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="sv-int-logo" style={{ background: integ.color, width: 40, height: 40 }}>{letter}</div>
            <div>
              <h2 className="sv-modal-title">{integ.name}</h2>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{integ.vendor} · {integ.cat}</div>
            </div>
          </div>
          <button className="sv-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="sv-modal-body">
          <div style={{ marginBottom: 20 }}>
            <div className={`sv-int-status-pill ${integ.status}`} style={{ marginBottom: 12 }}>
              <span className="dot"></span>
              {integ.status === "connected" ? `Conectado · sync há ${integ.lastSync}` : integ.status === "error" ? "Erro de autenticação" : "Não conectado"}
            </div>
            {integ.status === "error" && (
              <div style={{ padding: 10, background: "oklch(from var(--bad) l c h / 0.1)", border: "1px solid oklch(from var(--bad) l c h / 0.3)", borderRadius: 6, fontSize: 12, color: "var(--ink-2)" }}>
                <b>OAuth token expirou em 2026-01-18.</b> Todos os eventos desta integração estão pausados. Reconecte para retomar.
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Eventos últimas 24h</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>{integ.events24h.toLocaleString("pt-BR")}</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Projetos conectados</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>{integ.projects}</div>
            </div>
          </div>

          {integ.scopes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Escopos autorizados</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {integ.scopes.map(s => <span key={s} className="sv-int-scope" style={{ fontSize: 11, padding: "3px 8px" }}>{s}</span>)}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Mapeamento de dados</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6 }}>
              {integ.cat === "Issue Tracking" && <>Issues → cards do sprint · Epics → milestones · Comments → activity feed. Sincronização a cada 5min.</>}
              {integ.cat === "Code" && <>Commits → métricas de dev · PRs → tela de reviews · Branches ignoradas: <code style={{fontFamily:"var(--font-mono)"}}>dependabot/*</code></>}
              {integ.cat === "Financeiro" && <>NFs emitidas → faturamento · Contas a receber → overdue tracker · Clientes → link automático.</>}
              {integ.cat === "Time Tracking" && <>Entries → horas por dev/projeto · Projetos mapeados manualmente.</>}
              {!["Issue Tracking","Code","Financeiro","Time Tracking"].includes(integ.cat) && <>Sincronização automática a cada 15min. Configure filtros em "Configurar".</>}
            </div>
          </div>
        </div>
        <div className="sv-modal-foot">
          <button className="sv-btn" onClick={onClose}>Fechar</button>
          <div style={{ display: "flex", gap: 8 }}>
            {integ.status === "connected" && <button className="sv-btn">Forçar sync</button>}
            {integ.status === "connected" ? (
              <button className="sv-btn primary">Configurar</button>
            ) : (
              <button className="sv-btn primary">Conectar agora</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IntegrationsPage });
ReactDOM.createRoot(document.getElementById("root")).render(<IntegrationsPage />);
