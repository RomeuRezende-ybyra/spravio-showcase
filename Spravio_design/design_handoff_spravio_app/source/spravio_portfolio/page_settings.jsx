// Settings — Workspace config (Geral, Membros, Roles, Automações, API, Audit, Billing)
const { useState } = React;

function SettingsPage() {
  const shell = useSpravioShell("settings");
  const { tweaks, setTweak, data, role, paletteOpen, setPaletteOpen, tweaksOpen, setTweaksOpen, nav } = shell;
  const [section, setSection] = useState("general");

  const sections = [
    { group: "Workspace" },
    { id: "general",     label: "Geral" },
    { id: "branding",    label: "Branding" },
    { id: "billing",     label: "Billing & Plano" },
    { group: "Pessoas" },
    { id: "members",     label: "Membros", badge: window.SPRAVIO_MEMBERS?.length },
    { id: "roles",       label: "Roles & Permissões" },
    { id: "groups",      label: "Times" },
    { group: "Automação" },
    { id: "automations", label: "Regras", badge: window.SPRAVIO_AUTOMATIONS?.filter(a => a.active).length },
    { id: "webhooks",    label: "Webhooks" },
    { id: "api",         label: "API Keys" },
    { group: "Segurança" },
    { id: "sso",         label: "SSO & 2FA" },
    { id: "audit",       label: "Audit Log" },
    { id: "danger",      label: "Zona de risco" },
  ];

  const breadcrumb = [
    { label: "Acme Digital", muted: true },
    { label: "Settings" },
    { label: sections.find(s => s.id === section)?.label || "", subtle: true },
  ];

  return (
    <>
      <div className="sv-app">
        <Sidebar current="settings" onNav={nav} data={data} role={role} />
        <main className="sv-main">
          <Topbar data={data} onOpenPalette={() => setPaletteOpen(true)} breadcrumb={breadcrumb} />
          <RoleRestrictedNote role={role} pageId="settings" />

          <div className="sv-set-content">
            <nav className="sv-set-nav">
              {sections.map((s, i) =>
                s.group ? (
                  <div key={`g${i}`} className="sv-set-nav-label">{s.group}</div>
                ) : (
                  <button key={s.id} className={`sv-set-nav-item ${section === s.id ? "on" : ""}`} onClick={() => setSection(s.id)}>
                    {s.label}
                    {s.badge != null && <span style={{ float: "right", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)" }}>{s.badge}</span>}
                  </button>
                )
              )}
            </nav>
            <div className="sv-set-main">
              {section === "general"     && <SectionGeneral />}
              {section === "branding"    && <SectionBranding />}
              {section === "billing"     && <SectionBilling />}
              {section === "members"     && <SectionMembers />}
              {section === "roles"       && <SectionRoles />}
              {section === "groups"      && <SectionGroups data={data} />}
              {section === "automations" && <SectionAutomations />}
              {section === "webhooks"    && <SectionWebhooks />}
              {section === "api"         && <SectionAPI />}
              {section === "sso"         && <SectionSSO />}
              {section === "audit"       && <SectionAudit />}
              {section === "danger"      && <SectionDanger />}
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

// ─── Seções ─────────────────────────────────────────────────────────

function SectionHeader({ title, sub, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
      <div>
        <h1 className="sv-set-section-title">{title}</h1>
        <p className="sv-set-section-sub">{sub}</p>
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

function FormRow({ label, sub, children }) {
  return (
    <div className="sv-form-row">
      <div>
        <div className="sv-form-label">{label}</div>
        {sub && <div className="sv-form-sub">{sub}</div>}
      </div>
      <div className="sv-form-control">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return <button className={`sv-toggle ${on ? "on" : ""}`} onClick={() => onChange && onChange(!on)} />;
}

function SectionGeneral() {
  const org = window.SPRAVIO_ORG || {};
  const [a, setA] = useState({ notif: true, weekly: true, syncAll: false });
  return (
    <div className="sv-set-section">
      <SectionHeader title="Geral" sub="Informações básicas da sua organização no Spravio." />

      <FormRow label="Nome da organização" sub="Aparece no topo e nos emails.">
        <input className="sv-input" defaultValue={org.name} />
      </FormRow>
      <FormRow label="URL (slug)" sub="Usada em links e webhooks.">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>spravio.app/</span>
          <input className="sv-input" defaultValue={org.slug} style={{ maxWidth: 180 }} />
        </div>
      </FormRow>
      <FormRow label="Fuso horário">
        <select className="sv-select" defaultValue={org.timezone}>
          <option>America/Sao_Paulo</option>
          <option>America/New_York</option>
          <option>Europe/Lisbon</option>
          <option>UTC</option>
        </select>
      </FormRow>
      <FormRow label="Idioma & Moeda">
        <div style={{ display: "flex", gap: 8 }}>
          <select className="sv-select" defaultValue={org.locale} style={{ maxWidth: 180 }}>
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es">Español</option>
          </select>
          <select className="sv-select" defaultValue={org.currency} style={{ maxWidth: 120 }}>
            <option>BRL</option>
            <option>USD</option>
            <option>EUR</option>
          </select>
        </div>
      </FormRow>
      <FormRow label="Notificações por email" sub="Digest diário + alertas de health.">
        <Toggle on={a.notif} onChange={v => setA({ ...a, notif: v })} />
      </FormRow>
      <FormRow label="Relatório semanal" sub="Enviado aos Owners na 2ª-feira 08:00.">
        <Toggle on={a.weekly} onChange={v => setA({ ...a, weekly: v })} />
      </FormRow>
      <FormRow label="Sincronização automática" sub="Puxa dados das integrações a cada 5 minutos.">
        <Toggle on={a.syncAll} onChange={v => setA({ ...a, syncAll: v })} />
      </FormRow>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button className="sv-btn">Cancelar</button>
        <button className="sv-btn primary">Salvar alterações</button>
      </div>
    </div>
  );
}

function SectionBranding() {
  const org = window.SPRAVIO_ORG || {};
  return (
    <div className="sv-set-section">
      <SectionHeader title="Branding" sub="Personalize como o Spravio aparece nos emails e para seus clientes." />
      <FormRow label="Logo" sub="PNG ou SVG, mínimo 400×400.">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-deep))", display: "grid", placeItems: "center", color: "white", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500 }}>{org.logoLetter || "A"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="sv-btn">Enviar imagem</button>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>Recomendado: transparente, 1:1</span>
          </div>
        </div>
      </FormRow>
      <FormRow label="Cor primária" sub="Usada em botões, links e destaques.">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["#D97757","#7B9E89","#5E8CA8","#B28DBE","#D9A84E","#C46A5E"].map(c => (
            <div key={c} style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", border: c === "#D97757" ? "2px solid var(--ink)" : "2px solid transparent", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)" }} />
          ))}
        </div>
      </FormRow>
      <FormRow label="Email remetente" sub="Nome que aparece nos emails do Spravio.">
        <input className="sv-input" defaultValue="Acme Digital · Spravio" />
      </FormRow>
      <FormRow label="Domínio customizado" sub="Para links compartilhados externos (Business+).">
        <input className="sv-input" defaultValue="relatorios.acme.digital" />
      </FormRow>
      <FormRow label="Esconder marca Spravio" sub="Remove 'Powered by Spravio' dos relatórios exportados.">
        <Toggle on={false} />
      </FormRow>
    </div>
  );
}

function SectionBilling() {
  const org = window.SPRAVIO_ORG || {};
  return (
    <div className="sv-set-section">
      <SectionHeader title="Billing & Plano" sub="Plano atual, uso e próximas cobranças." />

      <div className="sv-card" style={{ padding: 20, marginBottom: 20, background: "oklch(from var(--accent) l c h / 0.06)", borderColor: "oklch(from var(--accent) l c h / 0.3)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Plano atual</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--ink)", letterSpacing: "-0.02em", marginTop: 4 }}>{org.plan || "Business"}</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>Renova automaticamente em 14 Mar 2026</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--ink)" }}>R$ {(org.mrr || 1980).toLocaleString("pt-BR")}<span style={{ fontSize: 14, color: "var(--ink-3)" }}>/mês</span></div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>cobrado mensalmente em BRL</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--rule)" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Seats</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--ink)", marginTop: 4 }}>{org.seats?.used || 24}<span style={{ color: "var(--ink-3)" }}>/{org.seats?.total || 40}</span></div>
            <div style={{ marginTop: 4, height: 3, background: "var(--rule)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(org.seats?.used || 24) / (org.seats?.total || 40) * 100}%`, background: "var(--accent)" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Projetos ativos</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--ink)", marginTop: 4 }}>11<span style={{ color: "var(--ink-3)" }}>/ilimitado</span></div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>Integrações</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--ink)", marginTop: 4 }}>13<span style={{ color: "var(--ink-3)" }}>/ilimitado</span></div>
          </div>
        </div>
      </div>

      <FormRow label="Forma de pagamento" sub="Visa terminando em 4242, expira 12/27">
        <div style={{ display: "flex", gap: 8 }}>
          <button className="sv-btn">Atualizar cartão</button>
          <button className="sv-btn">Mudar para boleto</button>
        </div>
      </FormRow>
      <FormRow label="CNPJ / Dados fiscais" sub="Para emissão de NF-e mensal.">
        <input className="sv-input" defaultValue="12.345.678/0001-90" />
      </FormRow>
      <FormRow label="Email de billing">
        <input className="sv-input" defaultValue="financeiro@acme.digital" />
      </FormRow>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Histórico</div>
        <table className="sv-mem-table">
          <thead>
            <tr><th>Período</th><th>Fatura</th><th>Valor</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {[
              ["Jan 2026", "INV-2026-001", "R$ 1.980", "paid"],
              ["Dez 2025", "INV-2025-012", "R$ 1.980", "paid"],
              ["Nov 2025", "INV-2025-011", "R$ 1.760", "paid"],
              ["Out 2025", "INV-2025-010", "R$ 1.760", "paid"],
            ].map(([per, inv, val, st]) => (
              <tr key={inv}>
                <td>{per}</td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{inv}</td>
                <td style={{ fontFamily: "var(--font-mono)" }}>{val}</td>
                <td><span className="sv-int-status-pill connected"><span className="dot"></span>Pago</span></td>
                <td><button className="sv-btn" style={{ padding: "3px 8px", fontSize: 11 }}>PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionMembers() {
  const members = window.SPRAVIO_MEMBERS || [];
  const [search, setSearch] = useState("");
  const filtered = members.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="sv-set-section" style={{ maxWidth: 960 }}>
      <SectionHeader
        title="Membros"
        sub={`${members.filter(m => m.status === "active").length} ativos · ${members.filter(m => m.status === "invited").length} convidados`}
        actions={<>
          <button className="sv-btn">Importar CSV</button>
          <button className="sv-btn primary">+ Convidar</button>
        </>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div className="sv-filters-search" style={{ flex: 1 }}>
          {I.search}
          <input placeholder="Buscar por nome ou email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sv-select" style={{ maxWidth: 140 }}>
          <option>Todas as roles</option>
          <option>Owner</option><option>Admin</option><option>PM</option><option>Lead</option><option>Viewer</option>
        </select>
      </div>

      <table className="sv-mem-table">
        <thead>
          <tr>
            <th>Membro</th>
            <th>Role</th>
            <th>2FA</th>
            <th>Desde</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.email}>
              <td>
                <div className="sv-mem-cell">
                  <span className="sv-avatar-sm" style={{ background: m.color }}>{m.avatar}</span>
                  <div>
                    <div style={{ color: "var(--ink)", fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>{m.email}</div>
                  </div>
                </div>
              </td>
              <td><span className={`sv-role-pill ${m.role}`}>{m.role}</span></td>
              <td>{m.twoFa ? <span style={{ color: "var(--good)", fontSize: 11 }}>✓ ativo</span> : <span style={{ color: "var(--ink-3)", fontSize: 11 }}>—</span>}</td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{m.joined}</td>
              <td>{m.status === "active" ? <span style={{ color: "var(--good)", fontSize: 11 }}>● Ativo</span> : <span style={{ color: "var(--warn)", fontSize: 11 }}>● Convidado</span>}</td>
              <td><button className="sv-btn" style={{ padding: "3px 8px", fontSize: 11 }}>···</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionRoles() {
  const capabilities = [
    ["Ver portfólio completo",          ["OWNER","ADMIN"]],
    ["Criar / arquivar projetos",       ["OWNER","ADMIN"]],
    ["Gerenciar orçamentos",            ["OWNER","ADMIN","PM"]],
    ["Editar sprints / board",          ["OWNER","ADMIN","PM","LEAD"]],
    ["Ver financials consolidados",     ["OWNER","ADMIN"]],
    ["Convidar membros",                ["OWNER","ADMIN"]],
    ["Conectar integrações",            ["OWNER","ADMIN"]],
    ["Ver activity feed",               ["OWNER","ADMIN","PM","LEAD","VIEWER"]],
    ["Comentar em PRs",                 ["OWNER","ADMIN","PM","LEAD"]],
    ["Exportar relatórios",             ["OWNER","ADMIN","PM"]],
  ];
  const roles = ["OWNER","ADMIN","PM","LEAD","VIEWER"];
  return (
    <div className="sv-set-section" style={{ maxWidth: 900 }}>
      <SectionHeader title="Roles & Permissões" sub="Define o que cada role pode fazer no workspace. Roles customizadas disponíveis no plano Enterprise." />

      <table className="sv-mem-table">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>Capability</th>
            {roles.map(r => <th key={r} style={{ textAlign: "center" }}>{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {capabilities.map(([cap, allowed], i) => (
            <tr key={i}>
              <td style={{ color: "var(--ink-2)" }}>{cap}</td>
              {roles.map(r => (
                <td key={r} style={{ textAlign: "center" }}>
                  {allowed.includes(r) ? <span style={{ color: "var(--good)", fontSize: 14 }}>✓</span> : <span style={{ color: "var(--ink-3)", fontSize: 14 }}>—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16, padding: 14, background: "var(--bg-el-2)", borderRadius: 6, fontSize: 12, color: "var(--ink-2)" }}>
        Precisa de uma role customizada (ex: <code>Financeiro</code> com acesso apenas a Billing)? <a href="#" style={{ color: "var(--accent)" }}>Faça upgrade para Enterprise ↗</a>
      </div>
    </div>
  );
}

function SectionGroups({ data }) {
  const teams = [
    { name: "Core Platform",    members: 6, leads: ["Thiago R.", "Felipe A."], projects: 3 },
    { name: "Mobile",           members: 4, leads: ["Camila S."], projects: 2 },
    { name: "Design System",    members: 2, leads: ["Bruno M."], projects: 8 },
    { name: "Data & Analytics", members: 3, leads: ["Ricardo V."], projects: 4 },
  ];
  return (
    <div className="sv-set-section">
      <SectionHeader title="Times" sub="Agrupe devs por squad para facilitar alocação e relatórios." actions={<button className="sv-btn primary">+ Novo time</button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {teams.map(t => (
          <div key={t.name} className="sv-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{t.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>Leads: {t.leads.join(", ")}</div>
              </div>
              <button className="sv-btn" style={{ padding: "3px 8px", fontSize: 11 }}>Editar</button>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--rule)" }}>
              <div><span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--ink)" }}>{t.members}</span> <span style={{ fontSize: 11, color: "var(--ink-3)" }}>membros</span></div>
              <div><span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: "var(--ink)" }}>{t.projects}</span> <span style={{ fontSize: 11, color: "var(--ink-3)" }}>projetos</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionAutomations() {
  const autos = window.SPRAVIO_AUTOMATIONS || [];
  return (
    <div className="sv-set-section" style={{ maxWidth: 900 }}>
      <SectionHeader title="Regras de automação" sub="Ações disparadas automaticamente por eventos do portfólio." actions={<button className="sv-btn primary">+ Nova regra</button>} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {autos.map(a => (
          <div key={a.id} className="sv-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Toggle on={a.active} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                  <b style={{ color: "var(--ink-3)" }}>IF</b> {a.trigger} <b style={{ color: "var(--ink-3)" }}>→ THEN</b> {a.action}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: a.runs24h > 0 ? "var(--ink)" : "var(--ink-3)" }}>{a.runs24h}</div>
                <div style={{ fontSize: 10, color: "var(--ink-3)" }}>runs / 24h</div>
              </div>
              <button className="sv-btn" style={{ padding: "3px 8px", fontSize: 11 }}>Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionWebhooks() {
  const hooks = window.SPRAVIO_WEBHOOKS || [];
  return (
    <div className="sv-set-section" style={{ maxWidth: 900 }}>
      <SectionHeader title="Webhooks" sub="POST em endpoints externos quando eventos acontecem." actions={<button className="sv-btn primary">+ Novo webhook</button>} />
      <table className="sv-mem-table">
        <thead>
          <tr><th>Endpoint</th><th>Eventos</th><th>Último envio</th><th>Ativo</th><th></th></tr>
        </thead>
        <tbody>
          {hooks.map((h, i) => (
            <tr key={i}>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}>{h.url}</td>
              <td>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                  {h.events.map(e => <span key={e} className="sv-int-scope">{e}</span>)}
                </div>
              </td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{h.last}</td>
              <td><Toggle on={h.active} /></td>
              <td><button className="sv-btn" style={{ padding: "3px 8px", fontSize: 11 }}>Logs</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, padding: 14, background: "var(--bg-el-2)", borderRadius: 6 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Eventos disponíveis</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {["project.created","project.archived","project.health_changed","sprint.completed","sprint.started","pr.stale","pr.merged","budget.exceeded","invoice.overdue","member.invited"].map(e => (
            <span key={e} className="sv-int-scope" style={{ fontSize: 11 }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionAPI() {
  const keys = window.SPRAVIO_API_KEYS || [];
  const [showSecret, setShowSecret] = useState(null);
  return (
    <div className="sv-set-section" style={{ maxWidth: 900 }}>
      <SectionHeader title="API Keys" sub="Tokens para acessar a API REST do Spravio programaticamente." actions={<button className="sv-btn primary">+ Gerar chave</button>} />

      <table className="sv-mem-table">
        <thead>
          <tr><th>Nome</th><th>Token</th><th>Criada em</th><th>Último uso</th><th></th></tr>
        </thead>
        <tbody>
          {keys.map(k => (
            <tr key={k.prefix}>
              <td style={{ color: "var(--ink)" }}>{k.name}</td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)" }}>
                {k.prefix}<span style={{ color: "var(--ink-3)" }}>{showSecret === k.prefix ? "...cRv9Xm2PqL4nKtB8" : "••••••••••••••••"}</span>
                <button style={{ marginLeft: 6, background: "none", border: "none", color: "var(--ink-3)", fontSize: 10, cursor: "pointer" }} onClick={() => setShowSecret(showSecret === k.prefix ? null : k.prefix)}>{showSecret === k.prefix ? "ocultar" : "revelar"}</button>
              </td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{k.created}</td>
              <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{k.lastUsed}</td>
              <td><button className="sv-btn" style={{ padding: "3px 8px", fontSize: 11, color: "var(--bad)" }}>Revogar</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Exemplo · cURL</div>
        <pre style={{ padding: 12, background: "var(--bg-el-2)", border: "1px solid var(--rule)", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-2)", overflow: "auto", lineHeight: 1.6 }}>
{`curl https://api.spravio.app/v1/projects \\
  -H "Authorization: Bearer sprv_live_xxx" \\
  -H "Accept: application/json"`}
        </pre>
      </div>
    </div>
  );
}

function SectionSSO() {
  return (
    <div className="sv-set-section">
      <SectionHeader title="SSO & 2FA" sub="Controle de acesso da sua organização." />

      <FormRow label="Login com Google" sub="Qualquer email @acme.digital pode entrar com Google.">
        <Toggle on={true} />
      </FormRow>
      <FormRow label="Login com Microsoft" sub="Para contas Microsoft 365.">
        <Toggle on={false} />
      </FormRow>
      <FormRow label="SAML 2.0 (Enterprise)" sub="Integração com Okta, Azure AD, Ping Identity.">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="sv-int-status-pill disconnected"><span className="dot"></span>Indisponível no plano Business</span>
          <button className="sv-btn">Upgrade</button>
        </div>
      </FormRow>
      <FormRow label="2FA obrigatório" sub="Exige autenticação em dois fatores para todos os membros.">
        <Toggle on={true} />
      </FormRow>
      <FormRow label="Sessão expira em" sub="Logout automático por inatividade.">
        <select className="sv-select" defaultValue="30d" style={{ maxWidth: 160 }}>
          <option value="1d">1 dia</option>
          <option value="7d">7 dias</option>
          <option value="30d">30 dias</option>
          <option value="never">Nunca</option>
        </select>
      </FormRow>
      <FormRow label="IPs permitidos" sub="Restringe acesso a faixas específicas (CIDR). Vazio = sem restrição.">
        <textarea className="sv-input" rows={3} placeholder="Ex: 200.123.45.0/24" style={{ fontFamily: "var(--font-mono)", resize: "vertical" }} />
      </FormRow>
    </div>
  );
}

function SectionAudit() {
  const audit = window.SPRAVIO_AUDIT || [];
  return (
    <div className="sv-set-section" style={{ maxWidth: 900 }}>
      <SectionHeader title="Audit log" sub="Rastreia mudanças sensíveis no workspace. Retenção: 90 dias (Business) / 2 anos (Enterprise)." actions={<button className="sv-btn">Exportar CSV</button>} />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div className="sv-filters-search" style={{ flex: 1 }}>
          {I.search}
          <input placeholder="Buscar ação ou membro…" />
        </div>
        <select className="sv-select" style={{ maxWidth: 140 }}>
          <option>Todas severidades</option>
          <option>Info</option><option>Warn</option><option>Error</option>
        </select>
      </div>

      {audit.map((a, i) => (
        <div key={i} className="sv-audit-item">
          <span className="sv-audit-when">{a.when}</span>
          <span className="sv-audit-text"><b>{a.who}</b> {a.action} <b>{a.object}</b></span>
          <span className={`sv-audit-sev ${a.severity}`}></span>
        </div>
      ))}
    </div>
  );
}

function SectionDanger() {
  return (
    <div className="sv-set-section">
      <SectionHeader title="Zona de risco" sub="Ações irreversíveis. Tenha certeza antes de prosseguir." />

      <div className="sv-card" style={{ padding: 16, borderColor: "oklch(from var(--bad) l c h / 0.3)", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Transferir ownership</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Passa o papel de Owner para outro admin do workspace.</div>
          </div>
          <button className="sv-btn">Transferir</button>
        </div>
      </div>

      <div className="sv-card" style={{ padding: 16, borderColor: "oklch(from var(--bad) l c h / 0.3)", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Exportar todos os dados</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Backup completo em JSON + CSVs. Chega por email em ~10min.</div>
          </div>
          <button className="sv-btn">Exportar</button>
        </div>
      </div>

      <div className="sv-card" style={{ padding: 16, borderColor: "oklch(from var(--bad) l c h / 0.4)", background: "oklch(from var(--bad) l c h / 0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--bad)" }}>Deletar workspace</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>Remove permanentemente todos os projetos, usuários e dados. Não há como desfazer.</div>
          </div>
          <button className="sv-btn" style={{ color: "var(--bad)", borderColor: "oklch(from var(--bad) l c h / 0.4)" }}>Deletar…</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsPage });
ReactDOM.createRoot(document.getElementById("root")).render(<SettingsPage />);
