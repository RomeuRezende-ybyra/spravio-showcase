# Spravio - Plano de Implementação Semanal

> Baseado no **Spravio Handoff.html** oficial
> Status atual: **Semana 1 completa** + **25% da Semana 2**
> Data de início: 21 de abril de 2026

---

## 📊 Visão Geral do Projeto

### Telas Mapeadas
- **11 telas internas** (exclui mobile e landing)
- **18 componentes compartilhados**
- **~64 endpoints REST** estimados
- **Status global:** 9/11 done · 2 em revisão

### Categorias de Telas
1. **Delivery Ops:** Projects, Project Detail, Sprints, Pull Requests
2. **Leadership:** Portfolio, Forecast, Financial
3. **Admin:** Integrations, Settings
4. **Out-of-app:** Email kit

---

## ✅ SEMANA 1 - Foundation (COMPLETA)

### Objetivo
Scaffolding completo com Next.js app router, auth, shell e tokens

### ✅ Implementado (100%)

#### 1. Design Tokens ✅
- [x] OKLCH color system (dark + light themes)
- [x] Typography scale (Fraunces, Inter, JetBrains Mono)
- [x] Density modes (high: 12px, medium: 13px, low: 14px)
- [x] Spacing system (4px-48px)
- [x] Border radius (3px-12px)
- [x] Shadow system
- [x] Google Fonts import

**Arquivos:**
- `apps/web/tailwind.config.ts` - Tokens configurados
- `apps/web/src/app/globals.css` - CSS vars + dark/light themes
- `apps/web/src/app/layout.tsx` - Fonts + data-theme

#### 2. Shell Components ✅
- [x] `<DashboardShell>` - Grid 224px sidebar + 1fr main
- [x] `<Sidebar>` - Nav com Vision/Operation sections, project quick list, health dots
- [x] `<Topbar>` - Breadcrumbs, search trigger, notifications, last sync
- [x] `<CommandPalette>` - ⌘K fuzzy search em projetos e navegação
- [x] Role-based access (OWNER, PROJECT_MANAGER, VIEWER)

**Arquivos:**
- `apps/web/src/components/layout/dashboard-shell.tsx`
- `apps/web/src/components/layout/sidebar.tsx`
- `apps/web/src/components/layout/topbar.tsx`
- `apps/web/src/components/layout/command-palette.tsx`

#### 3. Chart Components ✅
Todos os 13 componentes de visualização:
- [x] `<Sparkline>` - Line chart inline 80x22
- [x] `<Bars>` - Mini column chart
- [x] `<BudgetMeter>` - Horizontal progress bar com thresholds
- [x] `<Donut>` - Ring chart com segmentos
- [x] `<ActivityHeat>` - Heatmap 14 dias
- [x] `<HealthPill>` - Status pill com score
- [x] `<Stars>` - Rating 0-5 com frações
- [x] `<AvatarStack>` - Team avatars sobrepostos
- [x] `<BurndownMini>` - Burndown compacto
- [x] `<SourceIcon>` - Integration badges
- [x] `<Trend>` - Directional arrow
- [x] `<BurnTimeline>` - 12-week burn chart
- [x] `<RingGauge>` - Circular health score

**Arquivos:**
- `apps/web/src/components/charts/*.tsx` (13 arquivos)
- `apps/web/src/components/charts/index.ts` (barrel export)

#### 4. Dependencies ✅
- [x] @dnd-kit/core + sortable
- [x] @tanstack/react-table + virtual
- [x] cmdk (command palette)
- [x] fuse.js (fuzzy search)

### 📦 Entregáveis Semana 1
- ✅ Design system 100% configurado
- ✅ Shell layout navegável
- ✅ Command palette funcional
- ✅ 13 chart components prontos
- ✅ TypeScript sem erros
- ✅ Tema dark ativo por padrão

---

## 🚧 SEMANA 2 - Portfolio & Projects List (25% COMPLETO)

### Objetivo
Implementar as duas telas mais críticas: Portfolio (dashboard executivo) e Projects (lista operacional)

### ✅ Já Implementado

#### 1. Portfolio Page (75% completo)
- [x] `<PortfolioKPIs>` - Strip com 6 cards de métricas
  - Total Projects, Budget, Burn Rate, PRs, Margin, Health Score
  - Charts integrados (BurnTimeline, RingGauge)
- [x] `<PortfolioFilters>` - Barra de filtros avançada
  - Filter chips com contadores
  - Health dots (green/yellow/red)
  - Search box
  - Export CSV / Sync All buttons
- [x] `<PortfolioTable>` - Tabela densa Bloomberg-style
  - 13 colunas de dados
  - Health indicator bar na esquerda
  - Sparklines, BudgetMeter, BurndownMini inline
  - Avatar stacks para equipes
  - Sortable columns
  - Row expansion (estrutura)
- [x] Portfolio page com mock data (12 projetos)
- [x] Filtros funcionais (All, On Track, At Risk, Critical)
- [x] Search em tempo real
- [x] Sort por qualquer coluna

**Arquivos criados:**
- `apps/web/src/components/portfolio/portfolio-kpis.tsx`
- `apps/web/src/components/portfolio/portfolio-filters.tsx`
- `apps/web/src/components/portfolio/portfolio-table.tsx`
- `apps/web/src/app/(dashboard)/portfolio/page.tsx` (reescrito)

#### 2. Projects List (0% completo)
- [ ] Página existente mas precisa upgrade completo

### ⏳ Falta Implementar (Semana 2)

#### Portfolio - Refinamentos
- [ ] `<PortfolioCards>` - Card grid view (Variation B)
  - Activity heatmap por card
  - Layout 2 colunas de métricas
  - Top accent bar
- [ ] View toggle (Table ↔ Cards)
- [ ] Row expansion com drill-down details
  - Donut de sprint breakdown
  - Mini metrics
- [ ] Conectar com API real (substituir mock data)
- [ ] Loading states (skeleton)
- [ ] Empty state
- [ ] Export CSV funcional
- [ ] Sync All funcional

#### Projects List - Implementação Completa
Conforme handoff Screen 05:

**Componentes:**
- [ ] `<ProjectsTable>` - Tabela densa virtualizada
  - Colunas: Key, Nome/Cliente, Status, Health, PM, Time, Budget, Datas, PRs
  - Row height = `var(--row-h)`
  - Sticky header
  - Hover states
  - Click row → navigate to detail
- [ ] `<ProjectsFilters>` - Filter bar complexa
  - Search full-text
  - Multi-select chips (status, health, cliente, PM, tag)
  - Sort dropdown
  - View toggle (table/cards)
  - Density toggle
- [ ] `<ProjectsCards>` - Card grid alternative view
- [ ] `<NewProjectModal>` - Stepper 4 steps
  - Step 1: Identidade (nome, key, cliente, descrição, tags)
  - Step 2: Contrato (tipo, budget, horas, datas)
  - Step 3: Time (PM, devs, alocações)
  - Step 4: Review
- [ ] Empty state ("Criar primeiro projeto")
- [ ] No results state
- [ ] Loading skeleton (6 rows)
- [ ] Error banner
- [ ] URL state persistence (filtros shareable)

**Data:**
- [ ] Conectar `GET /api/projects?status=&pm=&client=&q=`
- [ ] Conectar `GET /api/clients`
- [ ] Conectar `GET /api/users?role=pm`
- [ ] Conectar `POST /api/projects`

**Interações:**
- [ ] Click row → `/projects/[key]?tab=overview`
- [ ] Click key → copy to clipboard + toast
- [ ] Hover BudgetBar → tooltip com R$ consumido/total
- [ ] Botão "Novo projeto" → abrir modal
- [ ] View toggle funcional

**Edge Cases:**
- [ ] Empty (nenhum projeto)
- [ ] No results (filtros ativos, 0 rows)
- [ ] Loading
- [ ] Error
- [ ] Row sem PM
- [ ] Budget >100%
- [ ] Deadline passado

**Arquivos a criar:**
- `apps/web/src/components/projects/projects-table.tsx`
- `apps/web/src/components/projects/projects-filters.tsx`
- `apps/web/src/components/projects/projects-cards.tsx`
- `apps/web/src/components/projects/new-project-modal.tsx`
- `apps/web/src/app/(dashboard)/projects/page.tsx` (reescrever)

### 🎯 Meta Semana 2
- ✅ Portfolio page 100% funcional (view table + cards)
- ✅ Projects list 100% funcional
- ✅ NewProjectModal stepper completo
- ✅ Ambas conectadas com API backend real

### ⏱️ Estimativa
- **Tempo restante:** 18-24 horas
- **Prioridade:** Alta (telas mais usadas)

---

## 📅 SEMANA 3 - Project Detail (0% COMPLETO)

### Objetivo
Implementar a tela mais rica: Project Detail com 9 abas

### Escopo (Conforme Screen 06)

**Header Persistente:**
- [ ] Nome do projeto + Health pill grande
- [ ] Client + Sector
- [ ] Meta info (PM, Budget, Deadline)
- [ ] Actions (Edit, Archive, Settings)

**9 Abas (cada uma é um sub-route):**

#### 1. Overview (`/projects/[key]?tab=overview`)
- [ ] KPIs strip (health, burn rate, velocity)
- [ ] Sparkline de hours/sprint
- [ ] Próximos milestones (lista)
- [ ] Sprint atual resumo
- [ ] Team quick view
- [ ] Edge: Sem sprints → "Comece criando o primeiro sprint"

#### 2. Sprints (`/projects/[key]?tab=sprints`)
- [ ] Lista cronológica de sprints
- [ ] Cada sprint: burndown mini + done/total points
- [ ] Sprint ativa = highlight accent
- [ ] Click sprint → expande detalhes
- [ ] Botão "Novo sprint"

#### 3. Backlog (`/projects/[key]?tab=backlog`)
- [ ] Tabela de tickets agrupados por epic
- [ ] Drag & drop para reordenar
- [ ] Filtros (status, assignee, label)
- [ ] Tickets órfãos = seção "Sem epic"
- [ ] Botão "Importar do Jira/Linear"

#### 4. Team (`/projects/[key]?tab=team`)
- [ ] Cards de devs com:
  - % alocação
  - Rate (R$/hora)
  - Horas logadas
  - Skills/tags
- [ ] Over-allocation >100% = warning banner
- [ ] Botão "Adicionar membro"

#### 5. Finance (`/projects/[key]?tab=finance`)
- [ ] Budget vs spend chart
- [ ] Forecast to completion
- [ ] Invoices table
- [ ] Contrato T&M = esconde budget total
- [ ] Overrun = alerta vermelho

#### 6. PRs (`/projects/[key]?tab=prs`)
- [ ] Lista de PRs (open/merged/closed)
- [ ] Cada PR: title, author, status, CI, reviewers
- [ ] Click → abre side panel com diff summary
- [ ] Filtros (status, author, stale >7d)

#### 7. Docs (`/projects/[key]?tab=docs`)
- [ ] Lista de documentos linkados
- [ ] Integração com Notion, Drive, Confluence
- [ ] Categorias (specs, design, meeting notes)
- [ ] Botão "Adicionar documento"

#### 8. Risks (`/projects/[key]?tab=risks`)
- [ ] Tabela de riscos
- [ ] Colunas: description, severity, probability, mitigation, owner
- [ ] Risk matrix visual (2x2 grid)
- [ ] Botão "Novo risco"

#### 9. Activity (`/projects/[key]?tab=activity`)
- [ ] Feed cronológico de tudo:
  - Commits
  - PRs abertas/merged
  - Comments
  - Invoices emitidas
  - Sprints iniciadas/completadas
  - Budget updates
- [ ] Filtros por tipo de evento
- [ ] Infinite scroll

**Componentes Comuns:**
- [ ] `<ProjectHeader>` - Header persistente
- [ ] `<ProjectTabs>` - Tab navigation
- [ ] `<MilestoneCard>` - Card de milestone
- [ ] `<EpicGroup>` - Agrupador de backlog
- [ ] `<DevCard>` - Card de desenvolvedor
- [ ] `<RiskMatrix>` - Grid 2x2 visual
- [ ] `<ActivityFeedItem>` - Item do feed

**Endpoints:**
- [ ] `GET /api/projects/[key]` - Dados base
- [ ] `GET /api/projects/[key]/sprints`
- [ ] `GET /api/projects/[key]/backlog`
- [ ] `GET /api/projects/[key]/team`
- [ ] `GET /api/projects/[key]/finance`
- [ ] `GET /api/projects/[key]/prs`
- [ ] `GET /api/projects/[key]/docs`
- [ ] `GET /api/projects/[key]/risks`
- [ ] `GET /api/projects/[key]/activity`
- [ ] `PATCH /api/projects/[key]` - Editar

**Arquivos a criar:**
- `apps/web/src/components/project-detail/project-header.tsx`
- `apps/web/src/components/project-detail/project-tabs.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/overview/page.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/sprints/page.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/backlog/page.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/team/page.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/finance/page.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/prs/page.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/docs/page.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/risks/page.tsx`
- `apps/web/src/app/(dashboard)/projects/[key]/activity/page.tsx`

### 🎯 Meta Semana 3
- ✅ Project Detail header completo
- ✅ 9 abas todas funcionais
- ✅ Navegação entre abas via URL
- ✅ Todas conectadas com API real

### ⏱️ Estimativa
- **Tempo:** 24-32 horas
- **Prioridade:** Alta (tela mais complexa)

---

## 📅 SEMANA 4 - Forecast & Sprints (0% COMPLETO)

### Objetivo
Implementar previsão financeira e gerenciamento de sprints

### 1. Forecast (`/app/forecast`)

Conforme Screen 08 do handoff:

**Controles:**
- [ ] Horizon filter (3m / 6m / 12m)
- [ ] Scenario toggle (pessimista / base / otimista)

**KPIs (4 cards):**
- [ ] Contracted (sólido)
- [ ] Pipeline weighted (ponderado)
- [ ] Forecast (highlighted em accent)
- [ ] Target (meta)

**Charts:**
- [ ] `<RevenueChart>` - Stacked bars + line
  - Contracted (sólido)
  - Pipeline (tracejado)
  - Forecast line (sobreposto)
  - Breakdown table mensal abaixo
- [ ] `<CapacityHeatmap>` - Devs × 8 semanas
  - Grid visualization
  - 5 níveis de carga (free/ok/loaded/saturated/over)
  - Cells overallocated com "!" glyph
  - Hover tooltip com horas/percentage
- [ ] `<RiskPipeline>` - Projetos × probabilidade
  - Bar chart com color tier
  - Probability of on-time delivery

**Scenario Assumptions Card:**
- [ ] 4 premissas editáveis:
  - Close rate
  - Churn
  - Novos deals
  - Expansão
- [ ] Metadata (última revisão, confiança, gap vs meta)

**Endpoints:**
- [ ] `GET /api/forecast?horizon=12m&scenario=base`
- [ ] `GET /api/forecast/capacity`
- [ ] `GET /api/forecast/pipeline`
- [ ] `PATCH /api/forecast/assumptions`

**Arquivos:**
- `apps/web/src/app/(dashboard)/forecast/page.tsx`
- `apps/web/src/components/forecast/revenue-chart.tsx`
- `apps/web/src/components/forecast/capacity-heatmap.tsx`
- `apps/web/src/components/forecast/risk-pipeline.tsx`
- `apps/web/src/components/forecast/scenario-card.tsx`

### 2. Sprints (`/app/sprints`)

Conforme Screen 10 do handoff:

**Seleção:**
- [ ] Project selector dropdown

**Sprint Atual KPIs:**
- [ ] Dias restantes
- [ ] Velocity
- [ ] Points (complete/total)
- [ ] PRs pendentes

**Charts:**
- [ ] Large burndown chart (ideal vs actual)
- [ ] Velocity chart histórico

**Kanban Board:**
- [ ] 4 colunas: Backlog, Doing, Review, Done
- [ ] Drag & drop cards entre colunas
- [ ] Card detail modal on click
- [ ] Status transitions
- [ ] Assignee avatars, labels, linked PRs

**Sprint Sidebar:**
- [ ] Sprint goal
- [ ] Retrospective link
- [ ] Impediments list

**Endpoints:**
- [ ] `GET /api/sprints/current?project=[id]`
- [ ] `GET /api/sprints/[id]/board`
- [ ] `PATCH /api/sprints/[id]/cards/[cardId]` - Move card

**Arquivos:**
- `apps/web/src/app/(dashboard)/sprints/page.tsx`
- `apps/web/src/components/sprints/kanban-board.tsx`
- `apps/web/src/components/sprints/kanban-card.tsx`
- `apps/web/src/components/sprints/sprint-sidebar.tsx`

### 🎯 Meta Semana 4
- ✅ Forecast completo com 3 cenários
- ✅ Capacity heatmap interativo
- ✅ Sprints com Kanban drag & drop
- ✅ Burndown charts funcionais

### ⏱️ Estimativa
- **Tempo:** 20-28 horas
- **Prioridade:** Média-Alta

---

## 📅 SEMANA 5 - Financial & Pull Requests (0% COMPLETO)

### Objetivo
Dashboard financeiro e inbox de PRs

### 1. Financial (`/app/financial`)

Conforme Screen 09 do handoff:

**Tabs:**
- [ ] Overview
- [ ] Por Projeto
- [ ] Faturamento (Invoices)

**Period Toggle:**
- [ ] YTD
- [ ] Quarter
- [ ] Month

**Overview Tab:**
- [ ] 4 KPI cards:
  - Receita contratada
  - Consumido
  - Faturado
  - Overdue
- [ ] `<BurnChart>` - Stacked bar por projeto
  - Burn consolidado
  - Color-coded por health
  - Interactive hover tooltips
- [ ] Top 5 margins table
  - Positive margins (green)
  - Negative margins (red)

**Por Projeto Tab:**
- [ ] Tabela focada em números financeiros
- [ ] Colunas: Project, Budget, Consumed, Invoiced, Margin, Status

**Invoices Tab:**
- [ ] Lista de NFs (paid/pending/overdue)
- [ ] Filtros (status, client, period)
- [ ] Click → download PDF

**Endpoints:**
- [ ] `GET /api/financial?period=ytd`
- [ ] `GET /api/financial/by-project`
- [ ] `GET /api/financial/invoices?status=`

**Arquivos:**
- `apps/web/src/app/(dashboard)/financial/page.tsx`
- `apps/web/src/components/financial/burn-chart.tsx`
- `apps/web/src/components/financial/invoices-list.tsx`
- `apps/web/src/components/financial/margin-table.tsx`

### 2. Pull Requests (`/app/prs`)

Conforme Screen 11 do handoff:

**Filter Bar:**
- [ ] Status (open / review / merge-ready)
- [ ] Author
- [ ] Repo
- [ ] Age (stale filter: >7d)

**Grouped List:**
- [ ] Agrupado por projeto (collapsible)
- [ ] Cada PR mostra:
  - Avatar + title
  - Repo/branch
  - Age
  - Labels
  - Review status
  - CI status (green/yellow/red)
  - Diff size (+NNN -NNN)

**Side Panel:**
- [ ] `<PRDetailPanel>` - Slide-over
  - PR metadata (author, reviewers, created date)
  - Diff summary (files changed, additions, deletions)
  - Comment thread
  - Review status indicators
  - Approve/Request changes buttons

**Endpoints:**
- [ ] `GET /api/prs?status=open&author=&repo=&age=`
- [ ] `GET /api/prs/[id]`
- [ ] `POST /api/prs/[id]/review`

**Arquivos:**
- `apps/web/src/app/(dashboard)/prs/page.tsx` (renomear de pull-requests)
- `apps/web/src/components/prs/pr-list.tsx`
- `apps/web/src/components/prs/pr-detail-panel.tsx`
- `apps/web/src/components/prs/pr-card.tsx`

### 🎯 Meta Semana 5
- ✅ Financial dashboard com 3 tabs
- ✅ Burn chart interativo
- ✅ PRs inbox com filtros
- ✅ PR detail panel com diff

### ⏱️ Estimativa
- **Tempo:** 16-24 horas
- **Prioridade:** Média

---

## 📅 SEMANA 6 - Integrations & Settings (0% COMPLETO)

### Objetivo
Gerenciamento de integrações e configurações

### 1. Integrations (`/app/integrations`)

Conforme Screen 12 do handoff:

**Filter Bar:**
- [ ] Search
- [ ] Chips (all / connected / available / errors)
- [ ] Counts dinâmicos

**Hero Stats Row (4 cards):**
- [ ] Total connected
- [ ] Events/24h
- [ ] Errors
- [ ] Last sync

**Grouped List por Categoria:**
- Issue Tracking (Jira, Linear, Azure DevOps, etc.)
- Code (GitHub, GitLab, Bitbucket)
- Communication (Slack, Teams)
- Financial (Stripe, eNotas)
- Productivity (Notion, Drive, Confluence)
- Time Tracking (Tempo, Clockify)

**Integration Card:**
- [ ] Logo
- [ ] Name + Vendor
- [ ] Status badge (connected/disconnected/error)
- [ ] Last sync time
- [ ] Events/24h counter (com sparkline)
- [ ] Projects connected count
- [ ] Click → modal de configuração

**Integration Modal:**
- [ ] `<IntegrationModal>`
  - OAuth connection flow
  - Scope management
  - Test connection button
  - Disconnect button
  - Health status
  - Event log

**Endpoints:**
- [ ] `GET /api/integrations`
- [ ] `GET /api/integrations/[id]`
- [ ] `POST /api/integrations/[id]/connect`
- [ ] `POST /api/integrations/[id]/disconnect`
- [ ] `POST /api/integrations/[id]/test`

**Arquivos:**
- `apps/web/src/app/(dashboard)/integrations/page.tsx`
- `apps/web/src/components/integrations/integration-card.tsx`
- `apps/web/src/components/integrations/integration-modal.tsx`
- `apps/web/src/components/integrations/oauth-flow.tsx`

### 2. Settings (`/app/settings`)

Conforme Screen 13 do handoff:

**Sidebar Secundária (230px):**
- Conta (Profile)
- Workspace
- Membros (Team)
- Billing
- API Keys
- Webhooks
- Notifications
- Security

**8 Sub-Routes:**

#### Profile (`/settings/profile`)
- [ ] Name, email, avatar
- [ ] Timezone
- [ ] Language (PT/EN)
- [ ] Density preference
- [ ] Theme preference

#### Workspace (`/settings/workspace`)
- [ ] Workspace name
- [ ] Logo upload
- [ ] Domain
- [ ] Defaults (PM padrão, tags padrão)

#### Members (`/settings/members`)
- [ ] Team table (name, email, role, status)
- [ ] Invite flow (email + role)
- [ ] Role management (Owner/PM/Viewer)
- [ ] Remove member

#### Billing (`/settings/billing`)
- [ ] Current plan
- [ ] Usage details
- [ ] Next invoice
- [ ] Invoice history
- [ ] Payment method
- [ ] Upgrade/downgrade

#### API Keys (`/settings/api`)
- [ ] Token management
- [ ] Create new token
- [ ] Scopes configuration
- [ ] Last used timestamp
- [ ] Revoke token

#### Webhooks (`/settings/webhooks`)
- [ ] Endpoint list
- [ ] Add endpoint
- [ ] Event selection
- [ ] Status indicators
- [ ] Test webhook

#### Notifications (`/settings/notifications`)
- [ ] Granular matrix (evento × canal)
- [ ] Channels: Email, Slack, In-app
- [ ] Events: PR opened, Sprint completed, Budget warning, etc.

#### Security (`/settings/security`)
- [ ] 2FA setup
- [ ] Active sessions list
- [ ] Audit log
- [ ] Password change

**Endpoints:**
- [ ] `GET/PATCH /api/settings/profile`
- [ ] `GET/PATCH /api/settings/workspace`
- [ ] `GET/POST/DELETE /api/settings/members`
- [ ] `GET /api/settings/billing`
- [ ] `GET/POST/DELETE /api/settings/api-keys`
- [ ] `GET/POST/DELETE /api/settings/webhooks`
- [ ] `GET/PATCH /api/settings/notifications`
- [ ] `GET /api/settings/security/sessions`
- [ ] `POST /api/settings/security/2fa`

**Arquivos:**
- `apps/web/src/app/(dashboard)/settings/layout.tsx` (sidebar secundária)
- `apps/web/src/app/(dashboard)/settings/profile/page.tsx`
- `apps/web/src/app/(dashboard)/settings/workspace/page.tsx`
- `apps/web/src/app/(dashboard)/settings/members/page.tsx`
- `apps/web/src/app/(dashboard)/settings/billing/page.tsx`
- `apps/web/src/app/(dashboard)/settings/api/page.tsx`
- `apps/web/src/app/(dashboard)/settings/webhooks/page.tsx`
- `apps/web/src/app/(dashboard)/settings/notifications/page.tsx`
- `apps/web/src/app/(dashboard)/settings/security/page.tsx`

### 🎯 Meta Semana 6
- ✅ Integrations page com OAuth flows
- ✅ Settings completo (8 seções)
- ✅ Team management funcional
- ✅ Billing integration

### ⏱️ Estimativa
- **Tempo:** 20-28 horas
- **Prioridade:** Alta (core features)

---

## 📅 SEMANA 7 - Email Kit & Polish (0% COMPLETO)

### Objetivo
Templates transacionais e refinamentos finais

### 1. Email Kit (9 templates)

Conforme Screen 14 do handoff:

Usar **React Email** ou **MJML** para templates:

**Templates:**
1. **Welcome** - Onboarding do usuário
2. **Invite** - Convite para workspace
3. **Project Created** - Novo projeto criado
4. **Sprint Started** - Sprint iniciada
5. **Sprint Completed** - Sprint finalizada
6. **Budget Warning** - 80% do budget consumido
7. **Budget Critical** - 95% do budget consumido
8. **Invoice Sent** - Nota fiscal emitida
9. **Weekly Digest** - Resumo semanal

**Padrões:**
- [ ] Branded header (logo Spravio)
- [ ] Consistent typography
- [ ] Primary CTA button (accent color)
- [ ] Footer com links (Settings, Unsubscribe)
- [ ] Mobile responsive
- [ ] Plain text alternative

**Provider:**
- [ ] Resend ou AWS SES
- [ ] Template rendering
- [ ] Send queue (BullMQ)

**Arquivos:**
- `apps/api/src/emails/templates/welcome.tsx`
- `apps/api/src/emails/templates/invite.tsx`
- `apps/api/src/emails/templates/project-created.tsx`
- `apps/api/src/emails/templates/sprint-started.tsx`
- `apps/api/src/emails/templates/sprint-completed.tsx`
- `apps/api/src/emails/templates/budget-warning.tsx`
- `apps/api/src/emails/templates/budget-critical.tsx`
- `apps/api/src/emails/templates/invoice-sent.tsx`
- `apps/api/src/emails/templates/weekly-digest.tsx`

### 2. Polish & Refinements

**Loading States:**
- [ ] Skeleton screens para todas as tabelas
- [ ] Loading spinners em ações
- [ ] Optimistic updates

**Empty States:**
- [ ] Ilustrações SVG customizadas
- [ ] Headlines + CTAs
- [ ] Cobertura em todas as telas

**Error Handling:**
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Retry mechanisms
- [ ] Friendly error messages

**Keyboard Shortcuts:**
- [x] ⌘K - Command palette (done)
- [ ] ⌘⇧D - Toggle dark/light
- [ ] G → P - Go to Portfolio
- [ ] G → J - Go to Projects
- [ ] G → S - Go to Sprints
- [ ] G → F - Go to Financial
- [ ] Esc - Close modals

**Responsive:**
- [ ] Sidebar collapse <1280px
- [ ] Mobile-friendly tables (horizontal scroll)
- [ ] Touch-friendly controls

**Performance:**
- [ ] Code splitting
- [ ] Image optimization
- [ ] Virtual scrolling nas listas grandes
- [ ] Lazy loading de tabs

**Accessibility:**
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Color contrast WCAG AA

**Testing:**
- [ ] Unit tests (componentes críticos)
- [ ] Integration tests (flows principais)
- [ ] E2E tests (Playwright)
  - Login flow
  - Create project flow
  - View portfolio flow
  - Filter projects flow

### 🎯 Meta Semana 7
- ✅ 9 email templates funcionais
- ✅ Loading/Empty/Error states completos
- ✅ Keyboard shortcuts implementados
- ✅ Performance otimizada
- ✅ Tests básicos rodando

### ⏱️ Estimativa
- **Tempo:** 16-24 horas
- **Prioridade:** Média

---

## 📊 Status Atual vs Plano

### Completado (Semana 1)
| Item | Status | %  |
|------|--------|-----|
| Design tokens | ✅ | 100% |
| Shell components | ✅ | 100% |
| Chart library | ✅ | 100% |
| Dependencies | ✅ | 100% |
| **Semana 1 Total** | **✅** | **100%** |

### Em Progresso (Semana 2)
| Item | Status | % |
|------|--------|---|
| Portfolio page | 🚧 | 75% |
| Projects list | ⏳ | 0% |
| **Semana 2 Total** | **🚧** | **25%** |

### Pendente (Semanas 3-7)
| Semana | Item Principal | Status | % |
|--------|---------------|--------|---|
| 3 | Project Detail (9 tabs) | ⏳ | 0% |
| 4 | Forecast + Sprints | ⏳ | 0% |
| 5 | Financial + PRs | ⏳ | 0% |
| 6 | Integrations + Settings | ⏳ | 0% |
| 7 | Email Kit + Polish | ⏳ | 0% |

### Progresso Global
- **Completado:** 1/7 semanas (14%)
- **Em progresso:** Semana 2 (25% completo)
- **Tempo estimado restante:** 115-165 horas (~3-4 semanas em tempo integral)

---

## 🎯 Priorização Recomendada

### Crítico (Deve implementar primeiro)
1. **Semana 2** - Portfolio + Projects List (finalizar)
2. **Semana 3** - Project Detail (overview + sprints + finance)
3. **Semana 6** - Settings (profile + members)

### Importante (Implementar em seguida)
4. **Semana 4** - Sprints (Kanban board)
5. **Semana 5** - PRs Inbox
6. **Semana 4** - Forecast

### Nice to Have (Pode adiar)
7. **Semana 5** - Financial (pode usar dados do Portfolio)
8. **Semana 6** - Integrations (OAuth flows complexos)
9. **Semana 7** - Email Kit (pode usar emails simples primeiro)
10. **Semana 7** - Polish (iterativo)

---

## 📝 Notas de Implementação

### Stack Confirmada
✅ **Frontend:**
- Next.js 14.2 (App Router)
- React 18
- Tailwind CSS v3 (com OKLCH via CSS vars)
- TypeScript strict

✅ **Backend:**
- Fastify 5
- Prisma 6
- Postgres
- Redis (BullMQ para jobs)

✅ **Bibliotecas:**
- @tanstack/react-table + virtual
- @dnd-kit (Kanban)
- cmdk (Command palette)
- Recharts (alguns charts)
- NextAuth.js (Auth)

### Convenções de Código
- Componentes em PascalCase
- Arquivos em kebab-case
- CSS vars para todas as cores (não usar hex inline)
- TypeScript interfaces com sufixo Props
- Async server components por padrão
- Client components só quando necessário

### Git Strategy
- Branch main protegida
- Feature branches: `feature/portfolio-page`
- Commits semânticos: `feat: add portfolio table component`
- PRs para todas as features
- Co-authored by Claude Sonnet 4.5

---

## 🚀 Como Continuar

### Para retomar Semana 2:
```bash
# Já temos:
# - PortfolioKPIs ✅
# - PortfolioFilters ✅
# - PortfolioTable ✅

# Falta implementar:
1. PortfolioCards (view alternativa)
2. View toggle
3. Row expansion
4. Conectar API real

# Depois:
5. Projects list completo
6. NewProjectModal stepper
```

### Comandos úteis:
```bash
# Dev
cd apps/web && pnpm dev

# Build
pnpm build

# Type check
pnpm tsc --noEmit

# Test
pnpm test
```

---

**Última atualização:** 21 de abril de 2026
**Próximo milestone:** Completar Semana 2 (Portfolio + Projects)
