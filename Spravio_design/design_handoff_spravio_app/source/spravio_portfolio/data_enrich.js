// Dados suplementares — PRs detalhados, sprints históricos, invoices, integrações, settings
// Roda depois de data.js e enriquece cada projeto + provê datasets globais

(function(){
  function rng(seed) {
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const pick = (r, a) => a[Math.floor(r() * a.length)];

  // ── PRs DETALHADOS ────────────────────────────────────────────────
  const PR_TITLES = [
    "feat(auth): integrar SSO com Azure AD",
    "fix(checkout): validação de CPF falhando em edge cases",
    "chore(deps): bump next de 14.2.3 para 14.2.7",
    "refactor(api): extrair service de pricing para microserviço",
    "feat(dashboard): adicionar filtros de período customizado",
    "fix(mobile): keyboard overlay cobrindo input de senha",
    "perf(db): adicionar índices em tabela de transações",
    "feat(notifications): push notifications via Firebase",
    "fix: race condition em webhook de pagamento",
    "docs: documentar novos endpoints do gateway",
    "feat(admin): bulk export de relatórios em XLSX",
    "fix(i18n): strings em pt-BR faltando no onboarding",
    "refactor: migrar de class components para hooks",
    "feat(search): typeahead com debounce de 300ms",
    "fix(auth): sessão expirando prematuramente",
    "chore: atualizar dependências de segurança",
    "feat(reports): novo tipo de gráfico de cohort",
    "fix(pdf): watermark sumindo em docs > 10MB",
    "perf(images): lazy loading em galeria do marketplace",
    "feat(webhooks): retry exponencial com DLQ",
  ];
  const REPOS = [
    "acme/core-api","acme/web-app","acme/mobile","acme/admin-dash",
    "acme/workers","acme/shared-ui","acme/infra","acme/analytics",
  ];

  function genPRs(prj, r) {
    const out = [];
    const count = prj.prsOpen + Math.floor(r() * 6);
    for (let i = 0; i < count; i++) {
      const isOpen = i < prj.prsOpen;
      const stale = i < prj.prsStale;
      const critical = i < prj.prsCritical;
      const ageHours = stale ? (24 + Math.floor(r() * 96)) : Math.floor(r() * 24);
      const reviewer = pick(r, prj.team);
      const author = pick(r, prj.team);
      const additions = 20 + Math.floor(r() * 380);
      const deletions = Math.floor(r() * 220);
      const comments = Math.floor(r() * 14);
      const changes = 1 + Math.floor(r() * 12);
      out.push({
        id: `pr_${prj.key}_${i}`,
        number: 1000 + i + Math.floor(r() * 999),
        title: pick(r, PR_TITLES),
        author,
        reviewer,
        repo: pick(r, REPOS),
        project: prj.key,
        projectName: prj.name,
        client: prj.client,
        branch: `feat/${pick(r, ["auth","pay","ui","api","mobile"])}/${Math.floor(r() * 999)}`,
        status: isOpen
          ? (critical ? "changes-requested" : stale ? "awaiting-review" : pick(r, ["awaiting-review","approved","draft","in-review"]))
          : pick(r, ["merged","merged","closed"]),
        ageHours,
        stale,
        critical,
        additions,
        deletions,
        comments,
        changedFiles: changes,
        ci: pick(r, ["pass","pass","pass","fail","running"]),
        conflicts: r() > 0.88,
        isOpen,
      });
    }
    return out;
  }

  // ── HISTÓRICO DE SPRINTS ──────────────────────────────────────────
  function genSprintHistory(prj, r) {
    const out = [];
    for (let i = prj.sprintNum - 5; i <= prj.sprintNum; i++) {
      if (i < 1) continue;
      const committed = 30 + Math.floor(r() * 40);
      const delivered = Math.max(10, Math.floor(committed * (0.55 + r() * 0.55)));
      const bugs = Math.floor(r() * 5);
      const carryOver = Math.max(0, committed - delivered + Math.floor(r() * 4));
      out.push({
        num: i,
        committed,
        delivered,
        bugs,
        carryOver,
        isCurrent: i === prj.sprintNum,
        startDate: `2026-${String(Math.max(1, 10 - (prj.sprintNum - i))).padStart(2,"0")}-15`,
        goal: pick(r, [
          "Concluir fluxo de checkout B2B",
          "Fechar débito técnico no core-api",
          "Entregar MVP do dashboard",
          "Lançar integração com Open Finance",
          "Refactor completo do módulo de billing",
          "Polimento pré-go-live",
          "Hardening de segurança e auditoria",
        ]),
      });
    }
    return out;
  }

  // ── MILESTONES / ROADMAP ──────────────────────────────────────────
  function genMilestones(prj, r) {
    const labels = [
      "Kick-off & Discovery",
      "MVP interno",
      "Beta fechado",
      "Beta público",
      "Go-live produção",
      "Hardening & Otimização",
      "Handover operacional",
    ];
    const n = 4 + Math.floor(r() * 3);
    const out = [];
    for (let i = 0; i < n; i++) {
      const pct = (i + 1) / (n + 0.5);
      out.push({
        id: `m${i}`,
        name: labels[i],
        date: `2026-${String(Math.min(12, 2 + i*2)).padStart(2,"0")}-${String(1 + Math.floor(r()*27)).padStart(2,"0")}`,
        status: pct < (prj.consumedPct/100) ? "done" : pct < (prj.consumedPct/100) + 0.12 ? "in-progress" : "todo",
        epic: pick(r, ["Core", "UX", "Infra", "Integrations", "Security"]),
      });
    }
    return out;
  }

  // ── RISKS / BLOCKERS ──────────────────────────────────────────────
  function genRisks(prj, r) {
    const samples = [
      { level: "high",   title: "Dependência externa (Serpro) sem SLA", owner: prj.pm, days: 8 },
      { level: "medium", title: "Escopo de anti-fraude em negociação", owner: prj.pm, days: 3 },
      { level: "low",    title: "Aguardando acesso ao ambiente de homologação do cliente", owner: prj.pm, days: 2 },
      { level: "high",   title: "Perf de consulta >2s em listagem do core", owner: "Tech Lead", days: 5 },
      { level: "medium", title: "Design system ainda sem tokens de tema escuro", owner: "Design", days: 4 },
      { level: "low",    title: "Certificado SSL renovação manual", owner: "DevOps", days: 6 },
    ];
    const n = prj.health === "red" ? 4 : prj.health === "yellow" ? 3 : 2;
    const copy = [...samples];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
      out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
    }
    return out;
  }

  // ── ACTIVITY FEED ─────────────────────────────────────────────────
  function genActivityFeed(prj, r) {
    const verbs = [
      { type: "commit", fmt: (who) => `${who} fez push de 3 commits em main` },
      { type: "pr-open", fmt: (who) => `${who} abriu PR #${1200 + Math.floor(r()*800)}` },
      { type: "pr-merge", fmt: (who) => `${who} mergeou PR #${1100 + Math.floor(r()*800)}` },
      { type: "issue-done", fmt: (who) => `${who} moveu issue para Done` },
      { type: "comment", fmt: (who) => `${who} comentou em uma issue` },
      { type: "status", fmt: (who) => `${who} atualizou status do sprint` },
      { type: "deploy", fmt: () => `Deploy em produção executado com sucesso` },
      { type: "alert", fmt: () => `Alerta: build quebrou no branch develop` },
    ];
    const out = [];
    for (let i = 0; i < 10; i++) {
      const v = pick(r, verbs);
      const who = pick(r, prj.team);
      out.push({
        type: v.type,
        text: v.fmt(who.name.split(" ")[0]),
        who,
        minutesAgo: i * (15 + Math.floor(r() * 90)),
      });
    }
    return out;
  }

  // ── DOCS / LINKS ──────────────────────────────────────────────────
  function genDocs(prj, r) {
    return [
      { kind: "jira", title: `${prj.key} · Board do projeto`, url: "#" },
      { kind: "github", title: `acme/${prj.key.toLowerCase()}-core`, url: "#" },
      { kind: "github", title: `acme/${prj.key.toLowerCase()}-web`, url: "#" },
      { kind: "drive", title: "Pasta do projeto — Drive", url: "#" },
      { kind: "figma", title: "Design · mobile + web", url: "#" },
      { kind: "confluence", title: "Technical RFC", url: "#" },
      { kind: "notion", title: "Kickoff notes", url: "#" },
      { kind: "slack", title: `#${prj.key.toLowerCase()}-dev`, url: "#" },
    ];
  }

  // ── INVOICES ──────────────────────────────────────────────────────
  function genInvoices(prj, r) {
    const out = [];
    const count = 3 + Math.floor(r() * 5);
    for (let i = 0; i < count; i++) {
      const val = Math.round(prj.budgetK / count);
      const status = i < count - 2 ? "paid" : i < count - 1 ? "open" : r() > 0.3 ? "open" : "overdue";
      out.push({
        number: `NF-${String(2026000 + Math.floor(r() * 9999)).padStart(7,"0")}`,
        amount: val,
        status,
        dueDate: `2026-${String(3 + i).padStart(2,"0")}-${String(5 + Math.floor(r()*22)).padStart(2,"0")}`,
        paidDate: status === "paid" ? `2026-${String(3 + i).padStart(2,"0")}-${String(5 + Math.floor(r()*22)).padStart(2,"0")}` : null,
      });
    }
    return out;
  }

  // ── Enriquece cada projeto ────────────────────────────────────────
  function enrich(dataset, seedBase) {
    dataset.projects.forEach((prj, idx) => {
      const r = rng(seedBase + idx);
      prj.prs = genPRs(prj, r);
      prj.sprintHistory = genSprintHistory(prj, r);
      prj.milestones = genMilestones(prj, r);
      prj.risks = genRisks(prj, r);
      prj.activityFeed = genActivityFeed(prj, r);
      prj.docs = genDocs(prj, r);
      prj.invoices = genInvoices(prj, r);
      prj.margin = Math.round(25 + r() * 30 - (prj.consumedPct > 80 ? 15 : 0));
      prj.billed = prj.invoices.filter(i => i.status === "paid").reduce((s,i)=>s+i.amount,0);
      prj.overdue = prj.invoices.filter(i => i.status === "overdue").reduce((s,i)=>s+i.amount,0);
    });

    // Agregados globais
    const allPRs = dataset.projects.flatMap(p => p.prs.filter(pr => pr.isOpen));
    dataset.allPRs = allPRs;

    // Revenue forecast por mês (12 meses)
    const r2 = rng(seedBase + 999);
    dataset.revenueForecast = Array.from({length: 12}, (_, i) => {
      const base = dataset.kpis.totalBudget / 12;
      return {
        month: i,
        contracted: Math.round(base * (0.9 + r2() * 0.3)),
        pipeline: Math.round(base * (0.2 + r2() * 0.5)),
        forecast: Math.round(base * (0.95 + r2() * 0.2)),
      };
    });

    // Capacity heatmap: dev × próximas 8 semanas
    const allDevs = Array.from(new Map(
      dataset.projects.flatMap(p => p.team).map(d => [d.name, d])
    ).values());
    dataset.capacity = allDevs.map((d, i) => {
      const r3 = rng(seedBase + 10000 + i);
      return {
        dev: d,
        weeks: Array.from({length: 8}, () => {
          // 0 = livre, 1 = ok, 2 = carregado, 3 = saturado, 4 = overalloc
          const v = Math.floor(r3() * 100);
          if (v < 10) return 0;
          if (v < 35) return 1;
          if (v < 65) return 2;
          if (v < 90) return 3;
          return 4;
        }),
      };
    });
  }

  const seeds = { small: 42, medium: 1337, large: 7777 };
  Object.keys(window.SPRAVIO_DATA).forEach(k => {
    enrich(window.SPRAVIO_DATA[k], seeds[k] || 1);
  });

  // ── INTEGRAÇÕES ───────────────────────────────────────────────────
  window.SPRAVIO_INTEGRATIONS = [
    { id: "jira",      name: "Jira Cloud",       vendor: "Atlassian", cat: "Issue Tracking", status: "connected",    lastSync: "4min",  scopes: ["read:issue","write:issue","read:project"], projects: 8,  events24h: 347, health: "good", color: "#2684FF" },
    { id: "azure",     name: "Azure DevOps",     vendor: "Microsoft", cat: "Issue Tracking", status: "connected",    lastSync: "12min", scopes: ["Work Items","Code","Build"],               projects: 3,  events24h: 128, health: "good", color: "#0078D4" },
    { id: "github",    name: "GitHub",           vendor: "GitHub",    cat: "Code",           status: "connected",    lastSync: "2min",  scopes: ["repo","read:org","read:user"],            projects: 11, events24h: 892, health: "good", color: "#8b949e" },
    { id: "gitlab",    name: "GitLab",           vendor: "GitLab",    cat: "Code",           status: "connected",    lastSync: "8min",  scopes: ["api","read_repository"],                  projects: 2,  events24h: 76,  health: "good", color: "#FC6D26" },
    { id: "slack",     name: "Slack",            vendor: "Salesforce",cat: "Comunicação",    status: "connected",    lastSync: "1min",  scopes: ["channels:read","chat:write","users:read"],projects: 11, events24h: 54,  health: "good", color: "#4A154B" },
    { id: "google",    name: "Google Workspace", vendor: "Google",    cat: "Produtividade",  status: "connected",    lastSync: "30min", scopes: ["drive.readonly","calendar","directory"],  projects: 11, events24h: 21,  health: "degraded", color: "#4285F4" },
    { id: "stripe",    name: "Stripe",           vendor: "Stripe",    cat: "Financeiro",     status: "error",        lastSync: "2h",    scopes: ["charges:read","customers:read"],          projects: 0,  events24h: 0,   health: "error", color: "#635BFF" },
    { id: "omie",      name: "Omie ERP",         vendor: "Omie",      cat: "Financeiro",     status: "connected",    lastSync: "1h",    scopes: ["NF-e","Clientes","Contas a Receber"],     projects: 11, events24h: 12,  health: "good", color: "#00A859" },
    { id: "clockify",  name: "Clockify",         vendor: "Cake.com",  cat: "Time Tracking",  status: "connected",    lastSync: "15min", scopes: ["entries:read","projects:read"],           projects: 9,  events24h: 203, health: "good", color: "#03A9F4" },
    { id: "figma",     name: "Figma",            vendor: "Figma",     cat: "Design",         status: "connected",    lastSync: "6h",    scopes: ["file_read","file_metadata"],              projects: 7,  events24h: 4,   health: "good", color: "#F24E1E" },
    { id: "linear",    name: "Linear",           vendor: "Linear",    cat: "Issue Tracking", status: "disconnected", lastSync: "never", scopes: [],                                          projects: 0,  events24h: 0,   health: "off",  color: "#5E6AD2" },
    { id: "notion",    name: "Notion",           vendor: "Notion",    cat: "Docs",           status: "connected",    lastSync: "3h",    scopes: ["read_content","read_user"],               projects: 6,  events24h: 18,  health: "good", color: "#000000" },
    { id: "sentry",    name: "Sentry",           vendor: "Sentry",    cat: "Observability",  status: "connected",    lastSync: "1min",  scopes: ["event:read","project:read"],              projects: 8,  events24h: 412, health: "good", color: "#362D59" },
    { id: "datadog",   name: "Datadog",          vendor: "Datadog",   cat: "Observability",  status: "disconnected", lastSync: "never", scopes: [],                                          projects: 0,  events24h: 0,   health: "off",  color: "#632CA6" },
    { id: "ms365",     name: "Microsoft 365",    vendor: "Microsoft", cat: "Produtividade",  status: "disconnected", lastSync: "never", scopes: [],                                          projects: 0,  events24h: 0,   health: "off",  color: "#D83B01" },
    { id: "hubspot",   name: "HubSpot CRM",      vendor: "HubSpot",   cat: "CRM",            status: "disconnected", lastSync: "never", scopes: [],                                          projects: 0,  events24h: 0,   health: "off",  color: "#FF7A59" },
  ];

  // ── ORG / MEMBERS / AUTOMATIONS ──────────────────────────────────
  window.SPRAVIO_ORG = {
    name: "Acme Digital",
    slug: "acme",
    timezone: "America/Sao_Paulo",
    locale: "pt-BR",
    currency: "BRL",
    logoLetter: "A",
    plan: "Business",
    seats: { used: 24, total: 40 },
    mrr: 1980,
  };

  window.SPRAVIO_MEMBERS = [
    { name: "Maria Cristina Lopes",   email: "maria.cristina@acme.digital", role: "OWNER", status: "active",   joined: "2023-02-14", avatar: "MC", color: "#D97757", twoFa: true },
    { name: "Renata Siqueira",        email: "renata.s@acme.digital",       role: "ADMIN", status: "active",   joined: "2023-03-11", avatar: "RS", color: "#7B9E89", twoFa: true },
    { name: "Felipe Andrade",         email: "felipe.a@acme.digital",       role: "PM",    status: "active",   joined: "2023-06-22", avatar: "FA", color: "#B28DBE", twoFa: false },
    { name: "Patrícia Moraes",        email: "patricia.m@acme.digital",     role: "PM",    status: "active",   joined: "2024-01-08", avatar: "PM", color: "#D9A84E", twoFa: true },
    { name: "Eduardo Campos",         email: "eduardo.c@acme.digital",      role: "PM",    status: "active",   joined: "2024-04-19", avatar: "EC", color: "#5E8CA8", twoFa: false },
    { name: "Carolina Freitas",       email: "carolina.f@acme.digital",     role: "PM",    status: "invited",  joined: "—",          avatar: "CF", color: "#C46A5E", twoFa: false },
    { name: "Thiago Ribeiro",         email: "thiago.r@acme.digital",       role: "LEAD",  status: "active",   joined: "2023-04-03", avatar: "TR", color: "#8B9D5C", twoFa: true },
    { name: "Aline Cordeiro",         email: "aline.c@acme.digital",        role: "VIEWER",status: "active",   joined: "2025-06-12", avatar: "AC", color: "#9B7B9E", twoFa: false },
  ];

  window.SPRAVIO_AUTOMATIONS = [
    { id: "a1", name: "Flagar PR stale > 24h", trigger: "PR aberto há 24h sem review", action: "Notificar autor e reviewer no Slack", active: true, runs24h: 12 },
    { id: "a2", name: "Alerta de burn > 85%", trigger: "Projeto atinge 85% do orçamento", action: "Email semanal pro PM + Owner", active: true, runs24h: 3 },
    { id: "a3", name: "Auto-sync após merge", trigger: "PR merged em main", action: "Trigger sincronização do projeto", active: true, runs24h: 47 },
    { id: "a4", name: "Carry-over > 30%", trigger: "Sprint terminou com >30% carry-over", action: "Abrir retrospectiva automática", active: false, runs24h: 0 },
    { id: "a5", name: "NF vencida > 5 dias", trigger: "Fatura em aberto há mais de 5 dias do vencimento", action: "Email pro cliente + cópia pro financeiro", active: true, runs24h: 2 },
    { id: "a6", name: "Dev sem commit > 3 dias", trigger: "Developer alocado sem commit há 3 dias úteis", action: "Notificar Tech Lead", active: false, runs24h: 0 },
  ];

  window.SPRAVIO_AUDIT = [
    { when: "há 2min",  who: "Maria Cristina",   action: "conectou integração",    object: "Stripe",                severity: "info" },
    { when: "há 18min", who: "Sistema",          action: "rodou sync automática",  object: "Jira (8 projetos)",     severity: "info" },
    { when: "há 1h",    who: "Felipe Andrade",   action: "alterou orçamento",      object: "PORT · Portal Corretor",severity: "warn" },
    { when: "há 3h",    who: "Renata Siqueira",  action: "arquivou projeto",       object: "INTR · Intranet",       severity: "info" },
    { when: "há 5h",    who: "Sistema",          action: "falhou ao sincronizar",  object: "Stripe — auth expirada",severity: "error" },
    { when: "ontem",    who: "Maria Cristina",   action: "convidou membro",        object: "carolina.f@acme.digital", severity: "info" },
    { when: "ontem",    who: "Eduardo Campos",   action: "alterou permissões",     object: "Viewer → PM (Aline)",   severity: "warn" },
    { when: "2d atrás", who: "Sistema",          action: "rotacionou API key",     object: "Webhook prod",          severity: "info" },
  ];

  window.SPRAVIO_WEBHOOKS = [
    { url: "https://hooks.slack.com/services/T01/B03/xxxxx", events: ["project.health_changed", "pr.stale"], active: true, last: "há 12min" },
    { url: "https://api.acme.digital/spravio/webhook", events: ["*"], active: true, last: "há 1min" },
    { url: "https://zapier.com/hooks/catch/1234/abc", events: ["sprint.completed"], active: false, last: "nunca" },
  ];

  window.SPRAVIO_API_KEYS = [
    { name: "Production — Data Warehouse sync", prefix: "sprv_live_1a2b", created: "2025-08-14", lastUsed: "há 30s" },
    { name: "Zapier connector",                   prefix: "sprv_live_4f5d", created: "2024-11-02", lastUsed: "há 12min" },
    { name: "Grafana dashboard",                   prefix: "sprv_live_9c8e", created: "2024-06-21", lastUsed: "há 3h" },
  ];
})();
