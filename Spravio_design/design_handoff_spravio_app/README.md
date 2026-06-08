# Handoff: Spravio — Web App (Portfolio management para agências de software)

> Pacote de handoff completo para implementar o produto Spravio em um codebase real (ex: React + Vite/Next, Vue/Nuxt, ou similar). Todas as telas do dashboard desktop estão representadas como protótipos HTML de alta fidelidade, prontos para serem re-implementados.

---

## 1. Overview

**Spravio** é uma plataforma SaaS de gestão de portfolio voltada para **agências de software brasileiras** (consultorias, software houses, boutiques de produto). Ela consolida em uma única visão os dados que normalmente ficam espalhados entre Jira/Azure DevOps, GitHub/GitLab, Slack, ERPs financeiros e planilhas:

- **Portfolio**: saúde de todos os projetos (KPIs consolidados + alertas)
- **Projects**: lista avançada com filtros densos (estilo Linear/Bloomberg)
- **Project Detail**: drill-down com 9 abas por projeto (overview, sprints, PRs, time, budget, docs, team, risks, activity)
- **Sprints**: sprint atual + burndown + board por projeto
- **Pull Requests**: inbox consolidado de PRs abertos em todos os repos/projetos
- **Financials**: faturamento, burn, margem, overdue por cliente
- **Forecast**: previsão de receita 3/6/12m × cenário (pessimista/base/otimista), capacity heatmap, risco de entrega
- **Integrations**: conectores com status, last sync, scopes, eventos/24h
- **Settings**: perfil, workspace, membros, billing, API, notificações, segurança

O público primário é o **Owner/CFO/Head de Delivery** da agência (role `OWNER`), com views restritas para `PM` e `VIEWER`.

---

## 2. About the Design Files

**Os arquivos HTML deste bundle são design references — não production code.**

Eles foram construídos como protótipos navegáveis em React inline + Babel standalone para servir como:
- **Fonte canônica de verdade visual** (layout, espaçamento, tipografia, cores, hover/active states)
- **Documentação de interação** (command palette, tweaks, filtros, drill-downs, tooltips)
- **Mapa de navegação** entre telas

**Sua tarefa** é recriar essas telas no codebase do cliente usando:
- O framework já adotado (React, Next.js, Vue, etc.) — **não** portar o HTML literalmente
- Os padrões de componentes existentes do projeto (ex: se já existe `<Button>`, use-o em vez de reimplementar)
- Sua lib de charts preferida (Recharts, Visx, D3, Chart.js) — **os SVGs inline do protótipo são apenas referência visual**
- Tokens de design que **já reproduzam 1:1** os valores documentados abaixo (ver seção 6)

Se não houver codebase ainda, recomendo:
- **Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui + Recharts + TanStack Table + Zustand**
- Para o backend de mock: **Hono + Drizzle + Postgres** (ou Supabase direto se o time for pequeno)

---

## 3. Fidelity

**Alta fidelidade (hifi).** Todas as telas são pixel-quase-perfeitas:
- Cores exatas (oklch → converter para hex/HSL)
- Tipografia final (Fraunces + Inter + JetBrains Mono)
- Espaçamento denso, intencional, "estilo Linear/Bloomberg"
- Hover/active/focus states especificados
- 3 tweaks globais: tema (dark/light), densidade (high/medium/low), role (OWNER/PM/VIEWER)

O dev deve replicar visualmente com precisão — isso faz parte da identidade do produto (densidade de informação é um diferencial competitivo vs. Jira/Monday).

---

## 4. Arquitetura geral

### 4.1. Shell (layout raiz — todas as telas)

```
┌────────────────────────────────────────────────────────────────┐
│  Sidebar (224px)  │  Topbar (48px)                             │
│  - Logo compacta  │  - Breadcrumb · Busca · Cmd⌘K · Avatar     │
│  - Nav principal  ├────────────────────────────────────────────┤
│  - Nav secundária │  Filters bar (opcional, contextual)        │
│  - Footer user    ├────────────────────────────────────────────┤
│                   │                                            │
│                   │  Main content (rolagem vertical)           │
│                   │                                            │
│                   │                                            │
│                   │                                            │
└───────────────────┴────────────────────────────────────────────┘
                                        [⚙] FAB Tweaks (fixed BR)
```

- **Sidebar** (`224px`): logo topo, seção "Visão" (Portfolio, Projects, Sprints, Developers, PRs, Financials, Forecast), seção "Operação" (Integrations, Settings), footer com user card.
- **Topbar** (`48px`): breadcrumb contextual, search/command-palette (`⌘K`), user avatar.
- **Main area**: flex column, rolagem própria. Cada tela define sua própria `filters-bar` + conteúdo.
- **FAB Tweaks**: botão circular fixo no canto inferior direito, abre painel `Tweaks` que permite trocar tema/densidade/role/volume-de-dados em runtime (persiste em `localStorage`).

### 4.2. Navegação (Nav routes)

| Nav ID         | Nome na UI      | Rota sugerida        | HTML de referência              | Roles            |
|----------------|-----------------|----------------------|---------------------------------|------------------|
| `portfolio`    | Portfolio       | `/`                  | `Spravio Portfolio.html`        | OWNER            |
| `projects`     | Projects        | `/projects`          | `Spravio Projects.html`         | OWNER, PM, VIEWER|
| `sprints`      | Sprints         | `/sprints`           | `Spravio Sprints.html`          | OWNER, PM, VIEWER|
| `prs`          | Pull Requests   | `/prs`               | `Spravio PRs.html`              | OWNER, PM, VIEWER|
| `budget`       | Financials      | `/financial`         | `Spravio Financial.html`        | OWNER, PM        |
| `forecast`     | Forecast        | `/forecast`          | `Spravio Forecast.html`         | OWNER, PM        |
| `integrations` | Integrations    | `/integrations`      | `Spravio Integrations.html`     | OWNER, PM        |
| `settings`     | Settings        | `/settings`          | `Spravio Settings.html`         | OWNER            |
| (project detail)| Project         | `/projects/:id`      | `Spravio Project Detail.html`   | OWNER, PM, VIEWER|
| (auth)         | Login/Signup    | `/auth/*`            | `Spravio Auth Screens.html`     | —                |

Telas restritas por role mostram um **banner amarelo** no topo ("requer role X — você está vendo uma visão limitada"). Itens de menu restritos aparecem **desabilitados** (cinza, cursor not-allowed) com tooltip explicativo.

---

## 5. Telas (detalhamento por tela)

### 5.1. Portfolio (`/`)

**Propósito**: visão executiva consolidada de todos os projetos ativos.

**Layout**:
- Filters bar com chips: status (ativo/pausado/em risco), cliente, PM responsável
- KPI strip superior (4-6 cards): projetos ativos, budget consolidado, burn médio, PRs abertos, margem média, health score
- Duas variações visuais disponíveis (A e B) — o dev escolhe ou consolida:
  - **Variação A (`variation_a.jsx`)**: tabela densa estilo Bloomberg/Linear, uma linha por projeto, colunas fixas (key, name, client, status, burn, budget, team, PRs, health, trend)
  - **Variação B (`variation_b.jsx`)**: grid de cards com heatmap de atividade, sparklines, avatar stack

**Recomendação**: implementar **variação A como default** (densa, lista-first) + uma opção de toggle de view para grid de cards.

**Componentes chave**:
- `<HealthPill status score />` — pílula verde/amarela/vermelha com score numérico
- `<BurnMeter pct />` — barra horizontal colorida por tier (>85% = bad, >70% = warn, else good)
- `<Sparkline data />` — mini-gráfico SVG linear, 80×22px
- `<AvatarStack people max={4} />` — stack de avatares circulares sobrepostos
- `<Trend direction />` — seta ↑/↓/→ colorida

---

### 5.2. Projects (`/projects`)

**Propósito**: browser completo de todos os projetos com filtros avançados e bulk actions.

**Layout**:
- Filters bar complexa: search full-text, chips multi-select (status, health, cliente, PM, tag, period), sort dropdown, toggle densidade
- Tabela virtualizada (suporta 50-200 linhas sem travar)
- Colunas: checkbox, key (mono), name, client, status pill, health pill, budget/consumed (meter inline), team stack, PRs badge, last activity relative, menu (⋯)
- Row hover: highlight + reveal actions (ver detalhe, editar, arquivar)
- Bulk action bar aparece no topo quando ≥1 selecionado

**Interações**:
- Clique em linha → navega para `/projects/:id` (Project Detail)
- Clique no menu (⋯) → dropdown com quick actions
- Duplo-clique em célula editável → inline edit (nome, PM, tag)

---

### 5.3. Project Detail (`/projects/:id`) ⚠ *ainda em design*

**Propósito**: drill-down completo de um projeto específico.

**Layout**: tabs no topo (9 abas), sidebar de metadata à direita, conteúdo principal à esquerda.

**Abas**:
1. **Overview** — summary + timeline + próximos milestones
2. **Sprints** — sprint atual + histórico + burndown
3. **PRs** — PRs abertos/merged no repo do projeto
4. **Time** — time tracking por dev/task (Harvest/Toggl integração)
5. **Budget** — orçamento, consumido, faturamento, margem
6. **Docs** — documentos linkados (Notion, Drive, Confluence)
7. **Team** — membros + roles + alocação
8. **Risks** — registro de riscos com severidade/probabilidade
9. **Activity** — feed cronológico de tudo (commits, PRs, comments, invoices)

**Status**: wireframe inicial; dev deve usar Portfolio + Sprints como referência de estilo e compor as 9 abas. Pergunte ao PO para priorizar.

---

### 5.4. Sprints (`/sprints`)

**Propósito**: visão focada no sprint atual de um projeto selecionado.

**Layout**:
- Project selector dropdown no topo (ou na sidebar secundária)
- KPI cards: dias restantes, velocity, pontos completos/total, PRs pendentes
- **Burndown chart** (SVG line chart: ideal vs. actual)
- **Board Kanban** (4 colunas: backlog, doing, review, done) com cards
- Sidebar direita: sprint goal, retrospectiva anterior (link), impediments

---

### 5.5. Pull Requests (`/prs`)

**Propósito**: inbox consolidado de PRs abertos em todos os repos conectados.

**Layout**:
- Filters bar: status (open/review/merge-ready), author, repo, idade (stale filter: >7d)
- Lista agrupada por projeto (collapsible)
- Cada PR: avatar + title + repo/branch + age + labels + review status + CI status + size diff (+NNN -NNN)
- Clique → abre painel lateral com diff summary + comments

---

### 5.6. Financials (`/financial`)

**Propósito**: visão financeira consolidada para CFO/Owner.

**Layout**:
- Tabs: Overview / Por projeto / Faturamento
- Period toggle: YTD / Trimestre / Mês
- **Overview**:
  - 4 KPI cards (receita contratada, consumido, faturado, overdue)
  - Gráfico de burn consolidado (stacked bar: projetos)
  - Lista top-5 margens (+/-)
- **Por projeto**: tabela estilo Projects mas focada em números financeiros
- **Faturamento**: lista de NFs (paga/pendente/overdue) com filtros

---

### 5.7. Forecast (`/forecast`)

**Propósito**: previsão de receita + capacity + risco de entrega.

**Layout**:
- Filters: horizonte (3m/6m/12m) + cenário (pessimista/base/otimista)
- 4 KPIs: contratado, pipeline ponderado, forecast (destaque accent), meta
- **Revenue chart**: stacked bars (contratado sólido + pipeline tracejado) + linha de forecast sobreposta + tabela breakdown mensal
- **Capacity heatmap**: dev × 8 semanas, 5 níveis (livre/ok/carregado/saturado/over) com glyph `!` em cells overallocated
- **Risk pipeline**: lista de projetos × probabilidade de entrega no prazo (bar com cor por tier)
- **Scenario assumptions card**: 4 premissas editáveis (close rate, churn, novos deals, expansão) + metadata (última revisão, confiança, gap vs meta)

---

### 5.8. Integrations (`/integrations`)

**Propósito**: gerenciar conectores com serviços externos.

**Layout**:
- Filters bar: search + chips (todas/conectadas/disponíveis/com erro) com counts
- Hero row com 4 stats (total conectadas, eventos/24h, erros, última sync)
- Lista agrupada por categoria (Issue Tracking, Code, Comunicação, Financeiro, Produtividade, Time Tracking)
- Cada card: logo + nome + vendor + status badge + last sync + events 24h + projects connected
- Clique → modal detalhe com scopes, health, config

---

### 5.9. Settings (`/settings`)

**Propósito**: configurações de perfil/workspace/billing.

**Layout**:
- Sidebar secundária (230px): seções agrupadas (Conta, Workspace, Billing, Desenvolvedor, Segurança)
- Main area: formulários/tabelas por seção
- Seções:
  - **Perfil**: nome, email, avatar, timezone, idioma
  - **Workspace**: nome, logo, domínio, defaults
  - **Membros**: tabela de convites + roles
  - **Billing**: plano atual, próxima fatura, histórico
  - **API keys**: tokens + scopes + last used
  - **Webhooks**: endpoints + events + status
  - **Notificações**: matriz granular (evento × canal: email/slack/inapp)
  - **Segurança**: 2FA, sessions, audit log

---

### 5.10. Auth (`/auth/login`, `/auth/signup`, `/auth/forgot`, `/auth/reset`)

**Layout**: split screen 50/50 — form à esquerda, imagery/branding à direita. Variações mostradas em `Spravio Auth Screens.html`.

---

## 6. Design System — Tokens

### 6.1. Tipografia

```css
--font-display: 'Fraunces', ui-serif, Georgia, serif;   /* display, KPI values, hero numbers */
--font-body:    'Inter', ui-sans-serif, system-ui, sans-serif;  /* body, UI, labels */
--font-mono:    'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;  /* keys, numbers, timestamps */
```

**Import Google Fonts**:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Escala (densidade `high` — default do produto)**:

| Token              | Valor  | Uso                           |
|--------------------|--------|-------------------------------|
| `--font-size`      | 12px   | body default                  |
| `--font-size-sm`   | 10px   | secondary labels              |
| `--font-size-xs`   | 9px    | micro labels, legends         |
| (display h1/hero)  | 28-48px| Fraunces · letter-spacing -0.02em · font-weight 400 |
| (card title)       | 14px   | weight 500                    |
| (table header)     | 10px   | mono · uppercase · letter-spacing 0.06em |

**Escala em densidade `medium`**: `--font-size: 13px`, `--font-size-sm: 11px`, `--font-size-xs: 10px`, `--row-h: 36px`.
**Escala em densidade `low`**: `--font-size: 14px`, `--font-size-sm: 12px`, `--font-size-xs: 11px`, `--row-h: 44px`.

### 6.2. Cores (oklch → hex equivalente aproximado)

**Dark theme (default)**:

| Token         | oklch                        | hex aprox. | Uso                              |
|---------------|------------------------------|------------|----------------------------------|
| `--bg`        | `oklch(0.145 0.01 55)`       | `#1C1916`  | background raiz                  |
| `--bg-el`     | `oklch(0.175 0.012 55)`      | `#22201D`  | sidebar, cards                   |
| `--bg-el-2`   | `oklch(0.20 0.014 55)`       | `#2A2724`  | hover, elevated                  |
| `--bg-el-3`   | `oklch(0.235 0.016 55)`      | `#322F2B`  | inputs, kbd, fab hover           |
| `--ink`       | `oklch(0.96 0.008 75)`       | `#F5F1EB`  | texto primário                   |
| `--ink-2`     | `oklch(0.78 0.012 70)`       | `#C2BBB0`  | texto secundário                 |
| `--ink-3`     | `oklch(0.58 0.018 60)`       | `#8B8175`  | texto muted, labels              |
| `--rule`      | `oklch(0.28 0.016 55)`       | `#3D3933`  | bordas sutis                     |
| `--rule-2`    | `oklch(0.36 0.02 55)`        | `#504942`  | bordas mais fortes               |
| `--accent`    | `oklch(0.64 0.16 28)`        | `#D97757`  | accent (laranja terroso Spravio) |
| `--accent-soft`| `oklch(0.36 0.10 28)`       | `#6E3B2D`  | accent bg tint                   |
| `--accent-deep`| `oklch(0.76 0.15 28)`       | `#E89574`  | accent em hover                  |
| `--good`      | `oklch(0.68 0.14 145)`       | `#6EB864`  | verde (on-track, paid)           |
| `--warn`      | `oklch(0.76 0.15 75)`        | `#D9B04D`  | amarelo (at-risk)                |
| `--bad`       | `oklch(0.66 0.18 25)`        | `#D85F4D`  | vermelho (over-budget, overdue)  |

**Light theme**: inverte as luminosidades — `--bg: oklch(0.985 0.006 75)` ≈ `#FAF8F4`, `--ink: oklch(0.22 0.02 40)` ≈ `#3B352F`, mesma paleta de accent/good/warn/bad mas com `l` ~0.55.

> **Importante**: Spravio usa **oklch** nativamente. Se o codebase-alvo não suportar, converter para hex/HSL preservando o gamut. Evitar gradientes — toda a UI é superfícies chapadas + 1px rules.

### 6.3. Espaçamento

Sem escala formal — usa múltiplos de **4px** diretamente: `4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 48`. Padding típico:
- Card: `16px` (medium) / `14px` (high-density)
- Filters bar: `10px 20px`
- Table row: `8px 12px`
- Sidebar nav item: `8px 12px`

### 6.4. Border radius

- Geral (cards, inputs, buttons): **6px**
- Chips/pills: **4px**
- Small elements (swatches, cells): **2px**
- Avatars, round buttons: **50%**

### 6.5. Shadows

```css
--shadow:    0 1px 0 oklch(0.3 0.02 55 / .6), 0 20px 48px -24px oklch(0 0 0 / .5);
--shadow-sm: 0 1px 2px oklch(0 0 0 / .3);
```

Usados com parcimônia — só em modais, palette, tweaks panel. Cards inline usam apenas 1px border.

### 6.6. Grid layout raiz

```css
.sv-shell {
  display: grid;
  grid-template-columns: 224px 1fr;
  min-height: 100vh;
}
```

---

## 7. Componentes reutilizáveis (charts/primitives)

Catalogados em `source/spravio_portfolio/charts.jsx`:

| Componente         | Props principais                       | Uso                               |
|--------------------|----------------------------------------|-----------------------------------|
| `Sparkline`        | `data, width=80, height=22, stroke`    | mini-gráfico linear SVG           |
| `Bars`             | `data, width, height, color`           | mini-gráfico de barras            |
| `BudgetMeter`      | `pct, height=8`                        | barra horizontal colorida por tier|
| `Donut`            | `segments, size=56, thickness=8`       | donut de breakdown                |
| `ActivityHeat`     | `activity, cell=10, gap=2`             | heatmap de atividade 14 dias      |
| `HealthPill`       | `status, score, compact`               | pill verde/amarela/vermelha       |
| `Stars`            | `value, size=10` (0-5)                 | rating                            |
| `AvatarStack`      | `people, max=4, size=22`               | avatares sobrepostos              |
| `BurndownMini`     | `burndown (ideal+actual), w, h`        | burndown sprint compacto          |
| `SourceIcon`       | `source, size=12`                      | glyph mono por integração         |
| `Trend`            | `direction (up/down/flat)`             | seta colorida                     |
| `BurnTimeline`     | `data, width, height`                  | timeline de burn (KPI strip)      |
| `RingGauge`        | `value, size=48, thickness=5, label`   | anel de health score              |

**Primitives de layout** (em `shell.css` + `pages.css`):
- `.sv-card`, `.sv-card-head`, `.sv-card-title`, `.sv-card-sub`
- `.sv-btn`, `.sv-btn.primary`
- `.sv-fchip`, `.sv-fchip.active`
- `.sv-view-toggle` (segmented control)
- `.sv-tabs`, `.sv-tab`, `.sv-tab-badge`
- `.sv-filters-bar`, `.sv-filters-search`, `.sv-filter-chips`

---

## 8. Interações globais

### 8.1. Command Palette (`⌘K` / `Ctrl+K`)

Overlay modal centrado, input grande no topo, lista categorizada (projetos · ações · navegação). Cmd+K em qualquer tela abre; Esc fecha. Fuzzy search client-side.

Implementação: **cmdk** (lib) + lista custom, ou rolar do zero com input + fuse.js. Ver `shared.jsx: function CommandPalette`.

### 8.2. Tweaks Panel (FAB canto inf. direito)

Painel flutuante com 4 grupos de botões segmentados:
- **Tema**: dark / light
- **Densidade**: alta / média / baixa
- **Role simulado**: OWNER / PM / VIEWER
- **Fake data**: pequena / média / grande

Persiste em `localStorage` com chave `spravio_portfolio_tweaks`. No produto real, esses tweaks viram:
- `tema` → preference do user (settings)
- `densidade` → preference do user (settings)
- `role` → vem do auth (não é tweakável pelo user)
- `dataPreset` → apenas para desenvolvimento/demo, remover em produção

### 8.3. Role-gated views

Páginas restritas (Portfolio = OWNER; Financials/Forecast/Integrations = OWNER+PM) devem:
1. Redirecionar se o user não tiver permissão suficiente
2. OU mostrar a página em read-only com banner no topo

### 8.4. Keyboard shortcuts

- `⌘K` / `Ctrl+K`: command palette
- `Esc`: fecha modais, tweaks, palette
- `⌘⇧D`: toggle tema (recomendado — implementar)
- `G → P`: go to Portfolio (recomendado)
- `G → J`: go to Projects
- `G → S`: go to Sprints

### 8.5. Hover/active states

- Rows em tabelas: bg → `var(--bg-el-2)`, reveal actions à direita
- Cards: border → `var(--rule-2)` (sutil)
- Buttons: `.sv-btn:hover { background: var(--bg-el-2); }`
- `.sv-btn.primary:hover { background: var(--accent-deep); }`

### 8.6. Loading/empty/error states

Não documentados no protótipo — o dev deve criar:
- **Empty state**: ilustração minimalista (placeholder), título, CTA
- **Loading**: skeleton screens (não spinners)
- **Error**: card vermelho com mensagem + retry button

---

## 9. State management

Recomendado:

- **Global/auth**: Zustand ou Jotai (tema, user, workspace)
- **Server state**: TanStack Query (todos os dados de projetos, sprints, PRs, integrações)
- **Local/UI**: useState/useReducer
- **URL state**: query params para filtros em Projects/PRs/Integrations (para shareable URLs)

**Dados mockados** em `source/spravio_portfolio/data.js` + `data_enrich.js`:
- 3 presets: `small` (5 projetos), `medium` (10), `large` (15)
- Seed determinístico → dados consistentes entre reloads
- Cobre: projetos, sprints, PRs, invoices, docs, team, activity, capacity, revenue forecast, integrations

**Endpoints sugeridos** (REST ou tRPC):

```
GET    /api/projects              (list with filters)
GET    /api/projects/:id          (detail + all nested)
GET    /api/sprints/current?project=:id
GET    /api/prs?status=open
GET    /api/financials?period=ytd
GET    /api/forecast?horizon=12m&scenario=base
GET    /api/integrations
PATCH  /api/integrations/:id
GET    /api/settings/profile
PATCH  /api/settings/profile
...
```

---

## 10. Assets

- **Fontes**: Google Fonts (Fraunces, Inter, JetBrains Mono) — importar via `<link>` ou `next/font`
- **Ícones**: SVG inline monochromáticos (`stroke="currentColor", strokeWidth="1.3"`). Ver `shared.jsx` exports `I.*`. Substituível por **Lucide React** (`lucide-react`) com stroke-width 1.5 como equivalente quase 1:1.
- **Logos de integrações**: usar SVG oficiais dos vendors (Jira, GitHub, Slack, etc.) — cores de marca já estão em `SPRAVIO_INTEGRATIONS` no `data_enrich.js`
- **Avatares**: UI Avatars placeholder (iniciais em círculo), ou DiceBear para variedade

---

## 11. Arquivos inclusos neste handoff

```
design_handoff_spravio_app/
├── README.md                          ← este arquivo
└── source/
    ├── Spravio Portfolio.html         ← tela principal
    ├── Spravio Projects.html
    ├── Spravio Project Detail.html    ← wireframe/rascunho
    ├── Spravio Sprints.html
    ├── Spravio PRs.html
    ├── Spravio Financial.html
    ├── Spravio Forecast.html
    ├── Spravio Integrations.html
    ├── Spravio Settings.html
    ├── Spravio Auth Screens.html
    └── spravio_portfolio/
        ├── shell.css                  ← design tokens + layout raiz
        ├── pages.css                  ← estilos específicos por tela
        ├── shell_boot.js              ← tweaks + routing map
        ├── shell_app.jsx              ← hooks compartilhados (useSpravioShell, TweaksPanel, RoleRestrictedNote)
        ├── shared.jsx                 ← Sidebar, Topbar, CommandPalette, icons
        ├── charts.jsx                 ← primitives (Sparkline, Donut, HealthPill, etc.)
        ├── data.js                    ← fake data (3 presets)
        ├── data_enrich.js             ← agregados + forecast + capacity + integrations
        ├── page_projects.jsx
        ├── page_sprints.jsx
        ├── page_prs.jsx
        ├── page_financial.jsx
        ├── page_forecast.jsx
        ├── page_integrations.jsx
        ├── page_settings.jsx
        ├── variation_a.jsx            ← Portfolio denso (Linear-like)
        └── variation_b.jsx            ← Portfolio cards + heatmap
```

---

## 12. Como rodar os protótipos localmente

```bash
cd design_handoff_spravio_app/source
python3 -m http.server 8000
# abra http://localhost:8000/Spravio%20Portfolio.html
```

As telas são standalone (React 18 + Babel standalone carregados via CDN). Navegação entre elas funciona via clicks na sidebar.

---

## 13. Priorização sugerida para implementação

**Fase 1 — Foundation (1 sprint)**
- Shell (sidebar + topbar + tweaks panel + command palette)
- Design tokens (CSS vars + tailwind config)
- Auth (login/signup/forgot)
- Tela Portfolio (lista + filtros + KPIs)

**Fase 2 — Core (2 sprints)**
- Projects list com filtros avançados
- Project Detail (apenas abas Overview + Sprints + PRs)
- Financials (Overview tab apenas)

**Fase 3 — Delivery (2 sprints)**
- Sprints page (board + burndown)
- PRs inbox
- Project Detail completo (9 abas)

**Fase 4 — Insights (1 sprint)**
- Forecast
- Integrations

**Fase 5 — Admin (1 sprint)**
- Settings completo
- Role-based restrictions enforceadas

---

## 14. Perguntas abertas para o PO

Antes de implementar, alinhar:

1. **Multi-tenant ou single-tenant?** (workspace vs org model)
2. **Qual é o SSO alvo?** (Google Workspace · Microsoft · nenhum)
3. **Integrações reais de M1**: quais conectores vão ter auth OAuth real vs mock? (sugerido: Jira + GitHub + Stripe em M1)
4. **Billing**: Stripe Checkout ou integração customizada?
5. **Data residency**: servidor BR (LGPD) ou US/EU ok?
6. **Exportação**: PDFs dos dashboards — gerar server-side (Puppeteer) ou client-side (react-to-print)?
7. **Realtime**: alguma tela precisa de WebSocket/SSE? (sugerido: PRs inbox tem valor)
8. **Mobile**: o produto é desktop-first; existe commit para mobile? (protótipos mobile existem separados em `mobile/` — ver handoff mobile se aplicável)

---

## 15. Contato

Qualquer dúvida sobre o design, olhar primeiro os HTMLs de referência (cada um é totalmente inspecionável via DevTools). Para decisões de produto, alinhar com o PO.

— Design via Claude (Anthropic)
