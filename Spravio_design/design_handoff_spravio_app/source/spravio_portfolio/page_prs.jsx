// Pull Requests — visão global de PRs em aberto, filtros, priorização
const { useState, useMemo } = React;

function PRsPage() {
  const shell = useSpravioShell("prs");
  const { tweaks, setTweak, data, role, paletteOpen, setPaletteOpen, tweaksOpen, setTweaksOpen, nav } = shell;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ project: "all", author: "all", status: "all", sort: "age-desc" });

  const allPRs = data.allPRs || [];
  const projects = data.projects;
  const authors = useMemo(() => [...new Map(allPRs.map(pr => [pr.author.name, pr.author])).values()], [allPRs]);

  const filtered = useMemo(() => {
    let arr = [...allPRs];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(pr =>
        pr.title.toLowerCase().includes(q) ||
        pr.repo.toLowerCase().includes(q) ||
        pr.branch.toLowerCase().includes(q) ||
        pr.author.name.toLowerCase().includes(q)
      );
    }
    if (filter.project !== "all") arr = arr.filter(pr => pr.project === filter.project);
    if (filter.author !== "all") arr = arr.filter(pr => pr.author.name === filter.author);
    if (filter.status !== "all") {
      if (filter.status === "stale") arr = arr.filter(pr => pr.stale);
      else if (filter.status === "critical") arr = arr.filter(pr => pr.critical);
      else if (filter.status === "conflicts") arr = arr.filter(pr => pr.conflicts);
      else if (filter.status === "ci-fail") arr = arr.filter(pr => pr.ci === "fail");
      else arr = arr.filter(pr => pr.status === filter.status);
    }
    if (filter.sort === "age-desc") arr.sort((a, b) => b.ageHours - a.ageHours);
    if (filter.sort === "age-asc") arr.sort((a, b) => a.ageHours - b.ageHours);
    if (filter.sort === "size-desc") arr.sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions));
    return arr;
  }, [allPRs, search, filter]);

  const summary = useMemo(() => {
    const total = allPRs.length;
    const stale = allPRs.filter(pr => pr.stale).length;
    const critical = allPRs.filter(pr => pr.critical).length;
    const conflicts = allPRs.filter(pr => pr.conflicts).length;
    const ciFail = allPRs.filter(pr => pr.ci === "fail").length;
    const avgAge = Math.round(allPRs.reduce((s, pr) => s + pr.ageHours, 0) / total);
    return { total, stale, critical, conflicts, ciFail, avgAge };
  }, [allPRs]);

  const breadcrumb = [
    { label: "Acme Digital", muted: true },
    { label: "Pull Requests" },
    { label: `${filtered.length} de ${allPRs.length}`, subtle: true },
  ];

  return (
    <>
      <div className="sv-app">
        <Sidebar current="prs" onNav={nav} data={data} role={role} />
        <main className="sv-main">
          <Topbar data={data} onOpenPalette={() => setPaletteOpen(true)} breadcrumb={breadcrumb} />
          <RoleRestrictedNote role={role} pageId="prs" />

          <div className="sv-pr-filter-summary">
            <div className="sv-pr-sum"><span className="sv-pr-sum-val">{summary.total}</span><span className="sv-pr-sum-lbl">Abertos</span></div>
            <div className="sv-pr-sum"><span className="sv-pr-sum-val" style={{ color: "var(--warn)" }}>{summary.stale}</span><span className="sv-pr-sum-lbl">Stale &gt;24h</span></div>
            <div className="sv-pr-sum"><span className="sv-pr-sum-val" style={{ color: "var(--bad)" }}>{summary.critical}</span><span className="sv-pr-sum-lbl">Críticos</span></div>
            <div className="sv-pr-sum"><span className="sv-pr-sum-val" style={{ color: "var(--bad)" }}>{summary.conflicts}</span><span className="sv-pr-sum-lbl">Conflitos</span></div>
            <div className="sv-pr-sum"><span className="sv-pr-sum-val" style={{ color: "var(--bad)" }}>{summary.ciFail}</span><span className="sv-pr-sum-lbl">CI falhou</span></div>
            <div className="sv-pr-sum"><span className="sv-pr-sum-val">{summary.avgAge}h</span><span className="sv-pr-sum-lbl">Idade média</span></div>
          </div>

          <div className="sv-filters-bar">
            <div className="sv-filters-search">
              {I.search}
              <input placeholder="Buscar PR, repo, autor, branch…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="sv-filter-chips">
              <FilterChipPR label="Status" value={filter.status} options={[
                ["all","Todos"],["stale","Stale"],["critical","Críticos"],["conflicts","Com conflitos"],["ci-fail","CI falhou"],
                ["awaiting-review","Aguardando review"],["changes-requested","Changes requested"],["approved","Aprovados"],["draft","Draft"]
              ]} onChange={v => setFilter(f => ({...f, status: v}))} />
              <FilterChipPR label="Projeto" value={filter.project} options={[["all","Todos"], ...projects.map(p => [p.key, `${p.key} · ${p.name}`])]}
                onChange={v => setFilter(f => ({...f, project: v}))} />
              <FilterChipPR label="Autor" value={filter.author} options={[["all","Todos"], ...authors.map(a => [a.name, a.name])]}
                onChange={v => setFilter(f => ({...f, author: v}))} />
              <FilterChipPR label="Ordenar" value={filter.sort} options={[
                ["age-desc","Mais antigos ↓"],["age-asc","Mais novos ↑"],["size-desc","Maiores ↓"]
              ]} onChange={v => setFilter(f => ({...f, sort: v}))} />
            </div>
          </div>

          <div className="sv-prs-content">
            <div className="sv-pr-list">
              {filtered.map(pr => <PRRow key={pr.id} pr={pr} />)}
              {filtered.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
                  Nenhum PR corresponde aos filtros.
                </div>
              )}
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

function FilterChipPR({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const currentLabel = options.find(([v]) => v === value)?.[1] || value;
  return (
    <div className="sv-fchip-wrap" ref={ref}>
      <button className={`sv-fchip ${value !== "all" ? "active" : ""}`} onClick={() => setOpen(o => !o)}>
        <span className="sv-fchip-label">{label}</span>
        <span className="sv-fchip-value">{currentLabel}</span>
        <span className="sv-fchip-caret">{I.caret}</span>
      </button>
      {open && (
        <div className="sv-fchip-menu">
          {options.map(([v, l]) => (
            <button key={v} className={v === value ? "on" : ""} onClick={() => { onChange(v); setOpen(false); }}>{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function PRRow({ pr }) {
  const statusIcon = pr.critical ? "!" : pr.status === "approved" ? "✓" : pr.status === "draft" ? "~" : "●";
  const statusCls = pr.critical ? "critical" : pr.status === "approved" ? "open" : "review";

  return (
    <div className={`sv-pr-row ${pr.stale && !pr.critical ? "stale" : ""} ${pr.critical ? "critical" : ""}`}>
      <div className={`sv-pr-status-icon ${statusCls}`}>{statusIcon}</div>
      <div className="sv-pr-main">
        <div className="sv-pr-title">
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)", marginRight: 6 }}>#{pr.number}</span>
          {pr.title}
          {pr.conflicts && <span style={{ marginLeft: 8, fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "oklch(from var(--bad) l c h / 0.2)", color: "var(--bad)", fontWeight: 600 }}>CONFLITOS</span>}
        </div>
        <div className="sv-pr-meta">
          <span className="sv-pr-repo">{pr.repo}</span>
          <span className="dot">•</span>
          <span>{pr.branch}</span>
          <span className="dot">•</span>
          <span><a href={`Spravio Project Detail.html?id=${encodeURIComponent(pr.project.toLowerCase())}`} style={{ color: "var(--ink-3)", textDecoration: "none" }}><span className="sv-key-pill" style={{ fontSize: 9, padding: "1px 5px" }}>{pr.project}</span></a></span>
          <span className="dot">•</span>
          <span className="sv-avatar-xs" style={{ background: "oklch(0.55 0.12 50)", width: 16, height: 16, fontSize: 7, display: "inline-flex" }}>{pr.author.name.split(" ").map(s => s[0]).slice(0,2).join("")}</span>
          <span>{pr.author.name.split(" ")[0]}</span>
          <span className="dot">•</span>
          <span>→ revisor: <b style={{ color: "var(--ink-2)" }}>{pr.reviewer.name.split(" ")[0]}</b></span>
          <span className="dot">•</span>
          <span className="sv-pr-diff"><span className="add">+{pr.additions}</span><span className="del">−{pr.deletions}</span></span>
          <span className="dot">•</span>
          <span>{pr.changedFiles} arquivos</span>
          {pr.comments > 0 && (
            <>
              <span className="dot">•</span>
              <span>💬 {pr.comments}</span>
            </>
          )}
        </div>
      </div>
      <div>
        <span className={`sv-pr-ci ${pr.ci}`}>
          {pr.ci === "pass" ? "CI ✓" : pr.ci === "fail" ? "CI ✗" : "CI ⟳"}
        </span>
      </div>
      <div className={`sv-pr-age ${pr.critical ? "critical" : pr.stale ? "stale" : ""}`}>
        {pr.ageHours < 24 ? `${pr.ageHours}h` : `${Math.floor(pr.ageHours / 24)}d`}
      </div>
    </div>
  );
}

Object.assign(window, { PRsPage });
ReactDOM.createRoot(document.getElementById("root")).render(<PRsPage />);
