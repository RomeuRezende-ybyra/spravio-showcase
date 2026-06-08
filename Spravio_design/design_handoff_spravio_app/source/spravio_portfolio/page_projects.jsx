// Projects — Lista avançada com filtros, agrupamento, bulk actions
const { useState, useEffect, useMemo, useCallback, useRef } = React;

function ProjectsPage() {
  const shell = useSpravioShell("projects");
  const { tweaks, setTweak, data, role, paletteOpen, setPaletteOpen, tweaksOpen, setTweaksOpen, nav } = shell;

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    health: "all",       // all, green, yellow, red
    status: "all",       // all, active, archived
    pm: "all",
    source: "all",
    client: "all",
    sort: "health-asc",  // health-asc, burn-desc, budget-desc, sprint-desc, name-asc
    groupBy: "none",     // none, pm, client, health, source
  });
  const [view, setView] = useState("table");  // table, grid, timeline
  const [selected, setSelected] = useState(new Set());
  const [pinned, setPinned] = useState(new Set(["pay-br"]));

  // Unique filter values from data
  const pms = useMemo(() => [...new Set(data.projects.map(p => p.pm))], [data]);
  const sources = useMemo(() => [...new Set(data.projects.map(p => p.source))], [data]);
  const clients = useMemo(() => [...new Set(data.projects.map(p => p.client))], [data]);

  // Filter + sort + group
  const filteredProjects = useMemo(() => {
    let arr = [...data.projects];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.pm.toLowerCase().includes(q)
      );
    }
    if (filters.health !== "all") arr = arr.filter(p => p.health === filters.health);
    if (filters.pm !== "all") arr = arr.filter(p => p.pm === filters.pm);
    if (filters.source !== "all") arr = arr.filter(p => p.source === filters.source);
    if (filters.client !== "all") arr = arr.filter(p => p.client === filters.client);

    const sortFn = {
      "health-asc": (a, b) => a.healthScore - b.healthScore,
      "burn-desc": (a, b) => b.consumedPct - a.consumedPct,
      "budget-desc": (a, b) => b.budgetK - a.budgetK,
      "sprint-desc": (a, b) => b.sprintNum - a.sprintNum,
      "name-asc": (a, b) => a.name.localeCompare(b.name),
    }[filters.sort];
    arr.sort(sortFn);

    // Pinned first
    arr.sort((a, b) => (pinned.has(b.id) ? 1 : 0) - (pinned.has(a.id) ? 1 : 0));
    return arr;
  }, [data, search, filters, pinned]);

  const grouped = useMemo(() => {
    if (filters.groupBy === "none") return [{ key: "all", items: filteredProjects }];
    const map = {};
    filteredProjects.forEach(p => {
      const k = filters.groupBy === "health" ? p.health
              : filters.groupBy === "pm" ? p.pm
              : filters.groupBy === "client" ? p.client
              : filters.groupBy === "source" ? p.source
              : "all";
      if (!map[k]) map[k] = [];
      map[k].push(p);
    });
    return Object.entries(map).map(([key, items]) => ({ key, items }));
  }, [filteredProjects, filters.groupBy]);

  const toggleSelect = (id) => {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const togglePin = (id) => {
    setPinned(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const selectAll = () => {
    if (selected.size === filteredProjects.length) setSelected(new Set());
    else setSelected(new Set(filteredProjects.map(p => p.id)));
  };

  const breadcrumb = [
    { label: "Acme Digital", muted: true },
    { label: "Projetos" },
    { label: `${filteredProjects.length} de ${data.projects.length}`, subtle: true },
  ];

  return (
    <>
      <div className="sv-app">
        <Sidebar current="projects" onNav={nav} data={data} role={role} />
        <main className="sv-main">
          <Topbar
            data={data}
            onOpenPalette={() => setPaletteOpen(true)}
            breadcrumb={breadcrumb}
          />

          <RoleRestrictedNote role={role} pageId="projects" />

          {/* Filtros toolbar */}
          <div className="sv-filters-bar">
            <div className="sv-filters-search">
              {I.search}
              <input
                type="text"
                placeholder="Buscar por nome, key, cliente, PM…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="sv-clear-btn" onClick={() => setSearch("")}>×</button>}
            </div>

            <div className="sv-filter-chips">
              <FilterChip label="Saúde" value={filters.health} options={[
                ["all","Todas"],["green","🟢 Saudáveis"],["yellow","🟡 Atenção"],["red","🔴 Críticos"]
              ]} onChange={v => setFilters(f => ({...f, health: v}))} />

              <FilterChip label="PM" value={filters.pm} options={[["all","Todos"], ...pms.map(pm => [pm, pm])]}
                onChange={v => setFilters(f => ({...f, pm: v}))} />

              <FilterChip label="Cliente" value={filters.client} options={[["all","Todos"], ...clients.map(c => [c, c])]}
                onChange={v => setFilters(f => ({...f, client: v}))} />

              <FilterChip label="Issue tracker" value={filters.source} options={[["all","Todos"], ...sources.map(s => [s, s])]}
                onChange={v => setFilters(f => ({...f, source: v}))} />

              <FilterChip label="Agrupar" value={filters.groupBy} options={[
                ["none","— nenhum —"],["pm","Por PM"],["client","Por cliente"],["health","Por saúde"],["source","Por tracker"]
              ]} onChange={v => setFilters(f => ({...f, groupBy: v}))} />

              <FilterChip label="Ordenar" value={filters.sort} options={[
                ["health-asc","Saúde ↑"],
                ["burn-desc","Burn ↓"],
                ["budget-desc","Orçamento ↓"],
                ["sprint-desc","Sprint atual ↓"],
                ["name-asc","Nome A→Z"],
              ]} onChange={v => setFilters(f => ({...f, sort: v}))} />
            </div>

            <div className="sv-view-toggle">
              <button className={view === "table" ? "on" : ""} onClick={() => setView("table")} title="Tabela">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="2" width="11" height="10" rx="1"/><path d="M1.5 5.5h11M1.5 9h11M5 2v10"/></svg>
              </button>
              <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} title="Grid">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="7.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="7.5" width="5" height="5" rx="1"/><rect x="7.5" y="7.5" width="5" height="5" rx="1"/></svg>
              </button>
              <button className={view === "timeline" ? "on" : ""} onClick={() => setView("timeline")} title="Timeline">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1.5 3h7M1.5 7h10M1.5 11h5"/><circle cx="9" cy="3" r="1.2" fill="currentColor"/><circle cx="11.5" cy="7" r="1.2" fill="currentColor"/><circle cx="6.5" cy="11" r="1.2" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          {/* Bulk actions bar (aparece quando tem seleção) */}
          {selected.size > 0 && (
            <div className="sv-bulk-bar">
              <span className="sv-bulk-count">{selected.size} selecionado{selected.size > 1 ? "s" : ""}</span>
              <button className="sv-bulk-btn">Sincronizar</button>
              <button className="sv-bulk-btn">Exportar CSV</button>
              <button className="sv-bulk-btn">Reatribuir PM</button>
              <button className="sv-bulk-btn">Arquivar</button>
              <button className="sv-bulk-btn ghost" onClick={() => setSelected(new Set())}>Limpar</button>
            </div>
          )}

          <div className="sv-projects-content">
            {view === "table" && (
              <ProjectsTable
                grouped={grouped}
                selected={selected}
                toggleSelect={toggleSelect}
                selectAll={selectAll}
                allSelected={selected.size === filteredProjects.length && filteredProjects.length > 0}
                pinned={pinned}
                togglePin={togglePin}
              />
            )}
            {view === "grid" && <ProjectsGrid projects={filteredProjects} pinned={pinned} togglePin={togglePin} />}
            {view === "timeline" && <ProjectsTimeline projects={filteredProjects} />}
          </div>
        </main>

        <div className="sv-tweak-fab" onClick={() => setTweaksOpen(true)} title="Tweaks (ou toggle na toolbar)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8"/></svg>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} data={data} onNav={nav} />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} visible={tweaksOpen} onClose={() => setTweaksOpen(false)} />
    </>
  );
}

// ─── FILTER CHIP ────────────────────────────────────────────────────
function FilterChip({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const currentLabel = options.find(([v]) => v === value)?.[1] || value;
  const isDefault = value === "all" || value === "none" || value === "health-asc";
  return (
    <div className="sv-fchip-wrap" ref={ref}>
      <button className={`sv-fchip ${!isDefault ? "active" : ""}`} onClick={() => setOpen(o => !o)}>
        <span className="sv-fchip-label">{label}</span>
        <span className="sv-fchip-value">{currentLabel}</span>
        <span className="sv-fchip-caret">{I.caret}</span>
      </button>
      {open && (
        <div className="sv-fchip-menu">
          {options.map(([v, l]) => (
            <button key={v} className={v === value ? "on" : ""} onClick={() => { onChange(v); setOpen(false); }}>
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TABLE VIEW ─────────────────────────────────────────────────────
function ProjectsTable({ grouped, selected, toggleSelect, selectAll, allSelected, pinned, togglePin }) {
  const { HealthPill, BudgetMeter, Sparkline } = window.SpravioCharts;

  return (
    <div className="sv-prj-table-wrap">
      {grouped.map(group => (
        <div key={group.key} className="sv-prj-group">
          {group.key !== "all" && (
            <div className="sv-prj-group-head">
              <span className="sv-prj-group-label">{group.key}</span>
              <span className="sv-prj-group-count">{group.items.length}</span>
            </div>
          )}
          <table className="sv-prj-table">
            <thead>
              <tr>
                <th className="sv-th-check">
                  <input type="checkbox" checked={allSelected} onChange={selectAll} />
                </th>
                <th className="sv-th-pin"></th>
                <th className="sv-th-key">Key</th>
                <th className="sv-th-name">Projeto</th>
                <th className="sv-th-pm">PM</th>
                <th className="sv-th-health">Saúde</th>
                <th className="sv-th-budget">Orçamento</th>
                <th className="sv-th-burn">Burn</th>
                <th className="sv-th-sprint">Sprint</th>
                <th className="sv-th-velocity">Velocidade</th>
                <th className="sv-th-prs">PRs</th>
                <th className="sv-th-ontime">% no prazo</th>
                <th className="sv-th-team">Time</th>
                <th className="sv-th-actions"></th>
              </tr>
            </thead>
            <tbody>
              {group.items.map(p => (
                <tr key={p.id} className={`${selected.has(p.id) ? "selected" : ""} ${pinned.has(p.id) ? "pinned" : ""}`}>
                  <td><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                  <td>
                    <button className={`sv-pin-btn ${pinned.has(p.id) ? "on" : ""}`} onClick={() => togglePin(p.id)} title="Fixar">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill={pinned.has(p.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.3"><path d="M6 1 L6 7 M3.5 4.5 L8.5 4.5 L8 8 L4 8 Z M6 8 L6 11"/></svg>
                    </button>
                  </td>
                  <td className="sv-td-key">
                    <span className="sv-key-pill">{p.key}</span>
                  </td>
                  <td className="sv-td-name">
                    <a className="sv-project-link" href={`Spravio Project Detail.html?id=${encodeURIComponent(p.id)}`}>
                      <span className="sv-p-name">{p.name}</span>
                      <span className="sv-p-client">{p.client}</span>
                    </a>
                  </td>
                  <td className="sv-td-pm">
                    <span className="sv-avatar-sm" style={{ background: "var(--bg-el-3)" }}>{p.pm.split(" ").map(s => s[0]).slice(0,2).join("")}</span>
                    <span className="sv-pm-name">{p.pm}</span>
                  </td>
                  <td><HealthPill status={p.health} score={p.healthScore} /></td>
                  <td className="sv-td-budget">
                    <span className="sv-num">R$ {p.budgetK}k</span>
                  </td>
                  <td>
                    <BudgetMeter pct={p.consumedPct} width={80} height={4} />
                    <span className="sv-pct">{p.consumedPct}%</span>
                  </td>
                  <td>
                    <div className="sv-sprint-cell">
                      <span className="sv-sprint-num">#{p.sprintNum}</span>
                      <span className="sv-sprint-day">D{p.sprintDay}/{p.sprintLength}</span>
                    </div>
                  </td>
                  <td>
                    <Sparkline points={p.velocityTrend || [10,12,8,14,11,15]} width={48} height={14} />
                    <span className="sv-num sv-num-sm">{p.velocityPoints}pts</span>
                  </td>
                  <td>
                    <div className="sv-pr-cell">
                      <span className="sv-pr-num">{p.prsOpen}</span>
                      {p.prsStale > 0 && <span className="sv-pr-stale">{p.prsStale}⚠</span>}
                      {p.prsCritical > 0 && <span className="sv-pr-critical">{p.prsCritical}🔴</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`sv-ontime ${p.onTimeProb >= 75 ? "good" : p.onTimeProb >= 55 ? "warn" : "bad"}`}>
                      {p.onTimeProb}%
                    </span>
                  </td>
                  <td>
                    <div className="sv-team-avatars">
                      {p.team.slice(0,3).map((d, i) => (
                        <span key={i} className="sv-avatar-xs" style={{ background: `oklch(0.55 0.12 ${(i * 80) % 360})` }}>
                          {d.name.split(" ").map(s => s[0]).slice(0,2).join("")}
                        </span>
                      ))}
                      {p.team.length > 3 && <span className="sv-avatar-xs sv-team-more">+{p.team.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <button className="sv-row-menu" title="Mais">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ─── GRID VIEW ──────────────────────────────────────────────────────
function ProjectsGrid({ projects, pinned, togglePin }) {
  const { HealthPill, BudgetMeter, Sparkline } = window.SpravioCharts;
  return (
    <div className="sv-prj-grid">
      {projects.map(p => (
        <a key={p.id} href={`Spravio Project Detail.html?id=${encodeURIComponent(p.id)}`} className="sv-prj-card-lg">
          <div className="sv-prj-card-head">
            <div className="sv-prj-card-key-wrap">
              <span className="sv-key-pill">{p.key}</span>
              <button className={`sv-pin-btn ${pinned.has(p.id) ? "on" : ""}`}
                onClick={(e) => { e.preventDefault(); togglePin(p.id); }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill={pinned.has(p.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.3"><path d="M6 1 L6 7 M3.5 4.5 L8.5 4.5 L8 8 L4 8 Z M6 8 L6 11"/></svg>
              </button>
            </div>
            <HealthPill status={p.health} score={p.healthScore} compact />
          </div>
          <div className="sv-prj-card-name">{p.name}</div>
          <div className="sv-prj-card-client">{p.client} · <span style={{ opacity: 0.6 }}>{p.clientSector}</span></div>

          <div className="sv-prj-card-meta">
            <div>
              <div className="sv-meta-label">Sprint atual</div>
              <div className="sv-meta-value">#{p.sprintNum} · D{p.sprintDay}/{p.sprintLength}</div>
            </div>
            <div>
              <div className="sv-meta-label">Velocidade</div>
              <div className="sv-meta-value">
                <Sparkline points={p.velocityTrend || [10,12,8,14,11,15]} width={40} height={12} />
                <span style={{ marginLeft: 6 }}>{p.velocityPoints}pts</span>
              </div>
            </div>
          </div>

          <div className="sv-prj-card-budget">
            <div className="sv-meta-label">Orçamento R$ {p.budgetK}k · {p.consumedPct}% consumido</div>
            <BudgetMeter pct={p.consumedPct} height={5} />
          </div>

          <div className="sv-prj-card-foot">
            <div className="sv-team-avatars">
              {p.team.slice(0,4).map((d, i) => (
                <span key={i} className="sv-avatar-xs" style={{ background: `oklch(0.55 0.12 ${(i * 80) % 360})` }} title={d.name}>
                  {d.name.split(" ").map(s => s[0]).slice(0,2).join("")}
                </span>
              ))}
              {p.team.length > 4 && <span className="sv-avatar-xs sv-team-more">+{p.team.length - 4}</span>}
            </div>
            <div className="sv-prj-card-signals">
              {p.prsStale > 0 && <span className="sv-sig warn">{p.prsStale} stale PR</span>}
              {p.prsCritical > 0 && <span className="sv-sig bad">{p.prsCritical} crítico</span>}
              <span className={`sv-sig ${p.onTimeProb >= 75 ? "good" : p.onTimeProb >= 55 ? "warn" : "bad"}`}>
                {p.onTimeProb}% no prazo
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── TIMELINE VIEW ──────────────────────────────────────────────────
function ProjectsTimeline({ projects }) {
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return (
    <div className="sv-prj-timeline">
      <div className="sv-timeline-head">
        <div className="sv-timeline-labels"></div>
        <div className="sv-timeline-months">
          {months.map((m, i) => (
            <div key={m} className={`sv-tl-month ${i === 3 ? "current" : ""}`}>
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sv-timeline-body">
        {projects.map((p, i) => {
          const start = (p.id.charCodeAt(0) + i * 3) % 8;
          const end = Math.min(12, start + 3 + (p.budgetK / 100));
          const progress = start + ((end - start) * p.consumedPct / 100);
          return (
            <div key={p.id} className="sv-tl-row">
              <div className="sv-tl-label">
                <span className="sv-key-pill">{p.key}</span>
                <span className="sv-tl-name">{p.name}</span>
              </div>
              <div className="sv-tl-track">
                <div className="sv-tl-bar"
                  data-h={p.health}
                  style={{
                    left: `${(start / 12) * 100}%`,
                    width: `${((end - start) / 12) * 100}%`,
                  }}
                >
                  <div className="sv-tl-bar-fill" style={{ width: `${((progress - start) / (end - start)) * 100}%` }}></div>
                  <span className="sv-tl-bar-label">
                    #{p.sprintNum} · {p.consumedPct}% burn
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ProjectsPage });

ReactDOM.createRoot(document.getElementById("root")).render(<ProjectsPage />);
