# Product Requirements Document (PRD)

## Spravio - Project Management Intelligence Platform

**Versão**: 1.0
**Data**: 2026-04-19
**Status**: Em Produção (v0.1.0)
**Domínio**: https://spravio.io
**API**: https://api.spravio.io

---

## 📋 Table of Contents

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Problema e Solução](#2-problema-e-solução)
3. [Objetivos do Produto](#3-objetivos-do-produto)
4. [Personas e Usuários](#4-personas-e-usuários)
5. [Features e Funcionalidades](#5-features-e-funcionalidades)
6. [Arquitetura e Tecnologia](#6-arquitetura-e-tecnologia)
7. [Integrações](#7-integrações)
8. [Regras de Negócio](#8-regras-de-negócio)
9. [Métricas e KPIs](#9-métricas-e-kpis)
10. [Roadmap](#10-roadmap)
11. [Restrições e Limitações](#11-restrições-e-limitações)

---

## 1. Visão Geral do Produto

### 1.1. Descrição

**Spravio** é uma plataforma SaaS de inteligência para gerenciamento de projetos de desenvolvimento de software. Consolida dados de múltiplas ferramentas de gestão de projetos (Jira, Azure DevOps, Trello, etc.) em um dashboard unificado, fornecendo:

- **Visibilidade em tempo real** de progresso de sprints
- **Análise de performance** de desenvolvedores
- **Controle financeiro** de orçamento e custos
- **Previsões baseadas em IA** de datas de entrega
- **Alertas proativos** de riscos e blockers

### 1.2. Proposta de Valor

| Para | Que | O Spravio é | Que | Diferente de |
|------|-----|-------------|-----|--------------|
| **Gerentes de Agências de Software** | Precisam monitorar múltiplos projetos simultaneamente | Uma **plataforma de inteligência unificada** | Consolida dados de múltiplas fontes, prevê atrasos com IA, e fornece insights financeiros em tempo real | **Jira/Azure** (limitados à sua própria plataforma), **Dashboards manuais** (dados defasados, sem IA) |

### 1.3. Posicionamento de Mercado

**Categoria**: Project Management Intelligence (PMI)
**Mercado-alvo**: Agências de desenvolvimento de software, consultorias de TI, empresas de outsourcing
**Modelo de negócio**: SaaS B2B com assinatura mensal

---

## 2. Problema e Solução

### 2.1. Problema

Gerentes de projetos em agências de software enfrentam:

1. **Fragmentação de dados**: Dados espalhados em Jira, Azure DevOps, GitHub, planilhas Excel
2. **Visibilidade limitada**: Impossível ter visão consolidada de múltiplos projetos em tempo real
3. **Reatividade**: Descobrem atrasos e problemas tarde demais
4. **Análise manual**: Gastam horas consolidando dados para relatórios
5. **Falta de previsibilidade**: Não conseguem prever atrasos com antecedência

### 2.2. Solução

Spravio resolve esses problemas através de:

| Problema | Solução Spravio |
|----------|-----------------|
| Fragmentação | **Integração nativa** com 14 ferramentas (Jira, Azure, GitHub, etc.) |
| Visibilidade | **Dashboard unificado** com visão consolidada de todos projetos |
| Reatividade | **Alertas proativos** (PRs stale, budget overflow, sprint em risco) |
| Análise manual | **Sincronização automática** a cada 15 minutos |
| Previsibilidade | **IA preditiva** (Claude) para forecast de entregas |

---

## 3. Objetivos do Produto

### 3.1. Objetivos de Negócio

| Objetivo | Métrica | Meta (6 meses) |
|----------|---------|----------------|
| Adoção | Organizações ativas | 100 |
| Receita | MRR (Monthly Recurring Revenue) | $10,000 |
| Retenção | Churn rate | < 5% |
| Satisfação | NPS (Net Promoter Score) | > 50 |

### 3.2. Objetivos de Produto

| Objetivo | Métrica | Meta (6 meses) |
|----------|---------|----------------|
| Performance | Tempo de carregamento dashboard | < 2s |
| Confiabilidade | Uptime | > 99.5% |
| Integração | Ferramentas suportadas | 14+ |
| Precisão | Acurácia de previsões de IA | > 80% |

### 3.3. Objetivos de Usuário

- **Economizar tempo**: Reduzir em 70% tempo gasto consolidando relatórios
- **Detectar riscos cedo**: Identificar projetos em risco 1-2 semanas antes do deadline
- **Tomar decisões data-driven**: Ter dados confiáveis para realocar recursos
- **Melhorar previsibilidade**: Conseguir estimar datas de entrega com +/- 1 semana de precisão

---

## 4. Personas e Usuários

### 4.1. Persona Primária: Maria - Diretora de Projetos

**Demografia**:
- Idade: 35-45 anos
- Cargo: Diretora/Gerente de Projetos
- Empresa: Agência de software (20-100 funcionários)
- Localização: Brasil (São Paulo, Belo Horizonte)

**Comportamento**:
- Gerencia 5-15 projetos simultâneos
- Usa Jira/Azure DevOps diariamente
- Reporta status semanal para C-level
- Passa 5-10h/semana consolidando dados

**Dores**:
- "Não consigo ver todos projetos de uma vez"
- "Descubro atrasos quando já é tarde"
- "Passo metade da semana fazendo relatórios manualmente"

**Objetivos**:
- Ter visão consolidada em tempo real
- Receber alertas antes de problemas críticos
- Gerar relatórios automáticos para stakeholders

### 4.2. Persona Secundária: João - Product Owner

**Demografia**:
- Idade: 28-38 anos
- Cargo: Product Owner / Scrum Master
- Empresa: Agência de software
- Localização: Brasil

**Comportamento**:
- Acompanha 2-4 projetos diariamente
- Faz daily/weekly rituals
- Precisa de métricas de time performance

**Dores**:
- "Não sei se meu time está performando bem comparado a outros"
- "PRs ficam esquecidos por dias"
- "Difícil prever se vamos entregar no prazo"

**Objetivos**:
- Acompanhar velocity e burndown em tempo real
- Identificar gargalos no processo
- Melhorar estimativas de sprint

### 4.3. Tipos de Usuário (Roles)

| Role | Permissões | Casos de Uso |
|------|------------|--------------|
| **OWNER** | Acesso total + billing + configurações | Diretores, fundadores |
| **PROJECT_MANAGER** | Acesso aos projetos atribuídos | POs, GPs, Scrum Masters |
| **VIEWER** | Read-only nos projetos atribuídos | Stakeholders, clientes |

---

## 5. Features e Funcionalidades

### 5.1. MVP (Implementado - v0.1.0)

#### 5.1.1. Autenticação e Multi-tenancy
- [x] Registro de usuários (email + senha)
- [x] Login com JWT
- [x] Organizações multi-tenant
- [x] Gerenciamento de membros e roles
- [x] Password hashing com bcrypt

#### 5.1.2. Gestão de Projetos
- [x] CRUD de projetos
- [x] Suporte a múltiplas fontes (Jira, Azure, Trello, ClickUp, Linear, Asana, Monday)
- [x] Atribuição de projetos a GPs
- [x] Configuração de credenciais de integração

#### 5.1.3. Sprint Tracking
- [x] Visualização de sprint atual
- [x] Burndown chart diário
- [x] Distribuição de story points (Backend vs Frontend)
- [x] Progress donut (Todo → In Progress → Test → UAT → Done)
- [x] Histórico de sprints

#### 5.1.4. Developer Performance
- [x] Grid de desenvolvedores com avatares
- [x] Developer Score (0-5 estrelas)
- [x] Métricas individuais:
  - Delivery rate (entregues / atribuídos)
  - Return rate (retornados para desenvolvimento)
  - PR merge rate
  - Cycle time médio
- [x] Cards atribuídos por desenvolvedor

#### 5.1.5. Pull Requests
- [x] Listagem de PRs por projeto
- [x] Detecção de PRs stale (>24h warning, >72h critical)
- [x] Estatísticas de PRs (total, merged, pending)
- [x] Sincronização manual via trigger

#### 5.1.6. Budget & Financials
- [x] Cadastro de orçamento por projeto (valor + moeda + período)
- [x] Configuração de taxas horárias por desenvolvedor/projeto
- [x] Lançamento de horas (manual)
- [x] Gauge de saúde orçamentária (GREEN < 70%, YELLOW 70-85%, RED > 85%)
- [x] Dashboard financeiro (custos por sprint, por desenvolvedor)

#### 5.1.7. Integrações (Estrutura)
- [x] Interface de configuração para 14 ferramentas
- [x] Armazenamento seguro de credenciais
- [x] Triggers manuais de sincronização
- [x] Logs de sincronização (status, duração, erros)

#### 5.1.8. Notifications
- [x] Configuração de webhooks Slack
- [x] Configuração de webhooks Teams
- [x] Alertas de sprint started/completed
- [x] Alertas de budget threshold

#### 5.1.9. AI Forecasting
- [x] Previsão de data de entrega baseada em velocity
- [x] Probabilidade de entrega no prazo (0-100%)
- [x] Reasoning detalhado da IA (Claude Sonnet)
- [x] Histórico de forecasts

#### 5.1.10. Onboarding
- [x] Wizard de 3 passos:
  1. Criar organização
  2. Configurar fonte de dados (Jira/Azure/Trello/etc)
  3. Importar primeiro projeto

### 5.2. Features em Desenvolvimento (v0.2.0 - v0.3.0)

#### 5.2.1. Sincronização Automática de Integrações
- [ ] **INT-001**: Jira sync - Issues, Sprints, Story Points
- [ ] **INT-002**: Azure DevOps sync - Work Items, Iterations
- [ ] **INT-003**: GitHub sync - Pull Requests, Commits, Reviews
- [ ] **INT-004**: Webhooks em tempo real (Jira, Azure, GitHub)
- [ ] **INT-006**: Tempo/Clockify automatic hours sync

#### 5.2.2. Monitoring & Observability
- [x] **MON-001**: Sentry error tracking (configurado, falta DSN)
- [ ] **MON-002**: Uptime monitoring (UptimeRobot)
- [ ] **MON-003**: Logs estruturados persistentes
- [ ] **MON-004**: Métricas de performance (Prometheus + Grafana)

#### 5.2.3. Segurança
- [ ] **SEC-001**: Encriptação de tokens no banco de dados
- [ ] **SEC-002**: Auditoria de acessos (audit log)
- [ ] **SEC-003**: 2FA (Two-Factor Authentication)

#### 5.2.4. Performance
- [ ] **PERF-001**: Cache Redis para queries frequentes
- [ ] **PERF-002**: CDN para assets estáticos
- [ ] **PERF-003**: Database query optimization

### 5.3. Features Planejadas (v1.0.0+)

#### 5.3.1. Relatórios Avançados
- [ ] Relatório de custo por sprint (PDF)
- [ ] Relatório de performance por desenvolvedor (PDF)
- [ ] Burn rate e projeções financeiras
- [ ] Exportação de dados (CSV/Excel)

#### 5.3.2. Dashboards Customizáveis
- [ ] Custom widgets (arrastar e soltar)
- [ ] Filtros salvos
- [ ] Dashboards por cliente/projeto

#### 5.3.3. API Pública
- [ ] REST API documentada (OpenAPI)
- [ ] Webhooks outbound
- [ ] Rate limiting por API key

#### 5.3.4. Mobile
- [ ] App nativo iOS/Android (React Native)
- [ ] Notificações push
- [ ] Modo offline

---

## 6. Arquitetura e Tecnologia

### 6.1. Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIO                              │
│                    (Browser/Mobile App)                      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (Traefik)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 14)                      │
│  - Server Components                                         │
│  - App Router                                                │
│  - Tailwind CSS                                              │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Fastify 5)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │→│  Services    │→│ Repositories │      │
│  │ (Zod valid.) │  │ (Business    │  │ (Prisma ORM) │      │
│  └──────────────┘  │  Logic)      │  └──────────────┘      │
│                    └──────────────┘                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┼──────────────────┐
          ▼           ▼                  ▼
    ┌──────────┐ ┌─────────┐      ┌──────────┐
    │PostgreSQL│ │  Redis  │      │ BullMQ   │
    │    15    │ │    7    │      │ (Jobs)   │
    └──────────┘ └─────────┘      └──────────┘
          │           │                  │
          │           └──────────────────┘
          │                  │
          ▼                  ▼
    ┌──────────────────────────────────┐
    │  INTEGRAÇÕES EXTERNAS (14)       │
    │  - Jira                          │
    │  - Azure DevOps                  │
    │  - GitHub                        │
    │  - Trello, ClickUp, Linear...   │
    │  - Slack, Teams                  │
    │  - Tempo, Clockify               │
    │  - Anthropic (IA)                │
    └──────────────────────────────────┘
```

### 6.2. Tech Stack (INEGOCIÁVEL)

| Camada | Tecnologia | Versão | Justificativa |
|--------|------------|--------|---------------|
| **Frontend** | Next.js App Router | 14.2 | SSR + RSC, SEO-friendly |
| **UI Framework** | Tailwind CSS + shadcn/ui | — | Componentes modernos, acessíveis |
| **Backend** | Fastify | 5 | Performance superior ao Express |
| **Validação** | Zod | 3 | Type-safe runtime validation |
| **ORM** | Prisma | 6 | Type-safe DB access, migrations |
| **Database** | PostgreSQL | 15 | Relacional, ACID, mature |
| **Cache** | Redis | 7 | In-memory cache, pub/sub |
| **Queue** | BullMQ | 5 | Job queue robusto com retry |
| **Auth** | NextAuth.js + JWT | — | Padrão Next.js, flexível |
| **Package Manager** | pnpm workspaces | 9 | Monorepo, disk-efficient |
| **TypeScript** | TypeScript strict | 5.7 | Type safety em todo codebase |
| **Deployment** | Docker + Traefik | — | Containerizado, SSL automático |
| **CI/CD** | GitHub Actions | — | Automação nativa GitHub |
| **Monitoring** | Sentry | — | Error tracking e APM |

### 6.3. Padrões de Código Obrigatórios

#### Backend Module Pattern
```
modules/<domain>/
├── route.ts       # Fastify endpoints + Zod validation
├── service.ts     # Business logic
├── repository.ts  # Prisma queries (NUNCA SQL raw)
└── types.ts       # Local types (se necessário)
```

#### Integration Pattern
```
integrations/<service>/
├── types.ts       # Raw API response types
├── client.ts      # HTTP client + auth + rate limit
├── endpoints.ts   # API calls + Redis cache (TTL 5min)
├── mappers.ts     # External → Internal model transformation
└── index.ts       # Barrel export
```

**Regra**: Services chamam Integrations. Routes NUNCA chamam Integrations diretamente.

### 6.4. Database Schema (23 Models)

#### Multi-tenancy
- **Organization**: Raiz do multi-tenant
- **OrganizationUser**: User ↔ Org com role (OWNER/PM/VIEWER)
- **OrganizationSettings**: Credenciais de integrações por org

#### Auth
- **User**: email, passwordHash (bcrypt), avatarUrl
- **Account**: OAuth providers (NextAuth)
- **Session**: NextAuth sessions

#### Core Domain
- **Project**: source (jira|azure|trello|...), credenciais
- **ProjectAssignment**: GP ↔ Project
- **Sprint**: 7 external ID fields (jira/azure/trello/clickup/linear/asana/monday)
- **BurndownPoint**: Daily burndown snapshots
- **Epic**: Grouping de issues

#### People
- **Developer**: 9 external user ID fields
- **ProjectDeveloper**: Metrics per project (rating 0-5, deliveryRate, returnRate)

#### Work Items
- **Issue**: 7 external issue IDs, linkedPRNumber, status, points

#### Financial
- **ProjectBudget**: totalBudget, consumedBudget, currency
- **DeveloperRate**: Hourly rate per dev/project
- **SprintHours**: Hours logged (source: manual|tempo|clockify)

#### Integrations Config
- **SlackConfig**: Per-project webhook + alert types
- **TeamsConfig**: Per-project webhook + alert types
- **TempoConfig**: Per-project Tempo API token
- **ClockifyConfig**: Per-project Clockify config

#### AI
- **DeliveryForecast**: onTimeProbability, predictedEndDate, reasoning (Claude)

#### Audit
- **SyncLog**: Job status, duration, errors, recordsProcessed

---

## 7. Integrações

### 7.1. Integrações Suportadas (14)

| Categoria | Ferramenta | Auth Method | Sync Type | Status |
|-----------|------------|-------------|-----------|--------|
| **PM Tools** | Jira Cloud | Basic (email:token) | API REST v3 | ⏳ Estrutura pronta |
| | Azure DevOps | Basic (:PAT) | API REST 7.0 | ⏳ Estrutura pronta |
| | Trello | API Key + Token | API REST v1 | ⏳ Estrutura pronta |
| | ClickUp | Bearer Token | API v2 | ⏳ Estrutura pronta |
| | Linear | Bearer Token | GraphQL | ⏳ Estrutura pronta |
| | Asana | Bearer Token | API v1.0 | ⏳ Estrutura pronta |
| | Monday.com | Bearer Token | GraphQL v2 | ⏳ Estrutura pronta |
| **Code** | GitHub | Bearer Token | API REST v3 | ⏳ Estrutura pronta |
| | GitLab | PRIVATE-TOKEN | API v4 | ⏳ Estrutura pronta |
| **Time** | Tempo | Bearer Token | API v4 | ⏳ Estrutura pronta |
| | Clockify | X-Api-Key | API v1 | ⏳ Estrutura pronta |
| **Messaging** | Slack | Bot Token | Webhooks + API | ✅ Funcionando |
| | Microsoft Teams | Incoming Webhook | Adaptive Cards | ✅ Funcionando |
| **AI** | Anthropic Claude | API Key | Messages API | ✅ Funcionando |

### 7.2. Estratégia de Sincronização

#### Fase 1: Sync Manual (v0.1.0 - Implementado)
- Usuário clica em "Sync Now" na UI
- Trigger via POST `/projects/:id/sync/:source`
- Job enfileirado no BullMQ
- Sync log criado

#### Fase 2: Sync Periódico (v0.2.0 - Planejado)
- Cron job a cada 15 minutos
- Sincroniza projetos com lastSyncAt < 15min atrás
- Rate limiting: máx 10 projetos simultâneos

#### Fase 3: Webhooks (v0.3.0 - Planejado)
- Jira/Azure/GitHub chamam endpoint quando há mudança
- Validação de signature
- Update incremental (sem full sync)

### 7.3. Mapeamento de Dados

#### Jira → Spravio
```
Jira Issue        → Issue
Jira Sprint       → Sprint
Jira User         → Developer
Jira Story Points → Issue.points
Jira Status       → Issue.status (mapped)
Jira Board        → Project
```

#### Azure DevOps → Spravio
```
Work Item         → Issue
Iteration         → Sprint
Team Member       → Developer
Effort            → Issue.points
State             → Issue.status (mapped)
Project           → Project
```

#### GitHub → Spravio
```
Pull Request      → (não persiste, apenas lista)
Contributor       → Developer
Repository        → Project.githubRepo
```

---

## 8. Regras de Negócio

### 8.1. Developer Score (0-5 estrelas)

```
score = (deliveryRate * 0.35
       + (100 - reworkRate) * 0.25
       + prMergeRate * 0.20
       + cycleTimeScore * 0.10
       + reviewContribution * 0.10) / 20

Onde:
deliveryRate       = (completed / assigned) * 100
reworkRate         = (returned_to_in_progress / completed) * 100
prMergeRate        = (PRs merged / PRs total) * 100
cycleTimeScore     = Linear: 0h → 100pts, 48h+ → 0pts
reviewContribution = (code reviews / team avg) * 100
```

**Exemplo**:
- deliveryRate = 90% (entregou 9 de 10 cards)
- reworkRate = 10% (1 card voltou para desenvolvimento)
- prMergeRate = 95% (19 de 20 PRs merged)
- cycleTimeScore = 80 (média de 10h por card)
- reviewContribution = 100%

→ Score = (90*0.35 + 90*0.25 + 95*0.20 + 80*0.10 + 100*0.10) / 20 = **4.5 estrelas**

### 8.2. PR Stale Detection

| Tempo desde criação | Severidade | Badge | Ação |
|---------------------|------------|-------|------|
| < 24h | NONE | — | Nenhuma |
| 24-72h | WARNING | 🟡 Yellow | Alerta no dashboard |
| > 72h | CRITICAL | 🔴 Red | Notificação Slack/Teams |

### 8.3. Budget Health Status

| % Consumido | Status | Cor | Ação |
|-------------|--------|-----|------|
| < 70% | GREEN | 🟢 | Normal |
| 70-85% | YELLOW | 🟡 | Warning no dashboard |
| > 85% | RED | 🔴 | Alerta Slack/Teams + email |

### 8.4. AI Forecast Requirements

**Requisitos mínimos**:
- 3+ sprints completos (fechados)
- Velocity consistente (std dev < 50%)
- `ANTHROPIC_API_KEY` configurado

**Input para Claude**:
```json
{
  "project": "Nome do Projeto",
  "avgVelocity": 45,
  "velocityTrend": "stable",
  "reworkRate": 12,
  "teamSize": 5,
  "remainingPoints": 120,
  "sprintDuration": 14,
  "historicalData": [...]
}
```

**Output**:
```json
{
  "onTimeProbability": 75,
  "predictedEndDate": "2026-05-15",
  "confidence": "medium",
  "reasoning": "Com base na velocity média de 45 pontos...",
  "recommendations": [...]
}
```

### 8.5. Roles e Permissões

| Ação | OWNER | PROJECT_MANAGER | VIEWER |
|------|-------|-----------------|--------|
| Ver dashboard | ✅ | ✅ (só projetos atribuídos) | ✅ (só projetos atribuídos) |
| Criar projeto | ✅ | ❌ | ❌ |
| Configurar integração | ✅ | ✅ (só seus projetos) | ❌ |
| Atribuir GPs | ✅ | ❌ | ❌ |
| Ver portfolio | ✅ | ❌ | ❌ |
| Configurar billing | ✅ | ❌ | ❌ |
| Lançar horas | ✅ | ✅ | ❌ |
| Triggerar sync | ✅ | ✅ | ❌ |

---

## 9. Métricas e KPIs

### 9.1. Product Metrics

| Métrica | Descrição | Meta | Medição |
|---------|-----------|------|---------|
| **DAU/MAU** | Daily/Monthly Active Users | DAU/MAU > 0.3 | Analytics |
| **Time to First Value** | Tempo até ver primeiro dashboard | < 10 min | User tracking |
| **Sync Success Rate** | % de syncs bem-sucedidos | > 95% | SyncLog table |
| **API Response Time** | P95 latency de endpoints | < 300ms | APM |
| **Error Rate** | % de requests com erro 5xx | < 0.1% | Sentry |

### 9.2. Business Metrics

| Métrica | Descrição | Meta | Medição |
|---------|-----------|------|---------|
| **MRR** | Monthly Recurring Revenue | $10k (6 meses) | Stripe |
| **ARPU** | Average Revenue Per User | $100/mês | MRR / customers |
| **Churn Rate** | % de cancelamentos | < 5% | Subscriptions table |
| **LTV** | Lifetime Value | > $1,200 | ARPU / churn |
| **CAC** | Customer Acquisition Cost | < $300 | Marketing spend / new customers |

### 9.3. User Engagement Metrics

| Métrica | Descrição | Meta | Medição |
|---------|-----------|------|---------|
| **Projects per Org** | Média de projetos por organização | > 5 | Projects table |
| **Integrations per Org** | Média de integrações ativas | > 2 | OrganizationSettings |
| **Syncs per Week** | Frequência de sincronização | > 20 | SyncLog |
| **Dashboard Views** | Sessões por semana | > 10 | Analytics |

---

## 10. Roadmap

### 10.1. Releases Planejadas

#### v0.1.0 - MVP (✅ Concluído - Abril 2026)
**Theme**: Foundation + Manual Workflows
- ✅ Autenticação e multi-tenancy
- ✅ CRUD de projetos, sprints, developers
- ✅ Dashboards básicos (burndown, developer score, PRs)
- ✅ Budget tracking manual
- ✅ Configuração de 14 integrações (UI)
- ✅ AI forecasting (Claude)
- ✅ Notificações Slack/Teams

#### v0.2.0 - First Integration (🔄 Em Progresso - Maio 2026)
**Theme**: Automação de Sincronização
- [ ] Sincronização automática Jira (INT-001)
- [ ] Sincronização automática Azure DevOps (INT-002)
- [ ] Sincronização automática GitHub PRs (INT-003)
- [x] Sentry error tracking (MON-001)
- [ ] Uptime monitoring (MON-002)
- [ ] Encriptação de tokens (SEC-001)

**Success Criteria**:
- 90% dos syncs Jira bem-sucedidos
- Latência de sync < 60s
- Zero dados duplicados

#### v0.3.0 - Multi-Integration (📅 Planejado - Junho 2026)
**Theme**: Webhooks + Performance
- [ ] Webhooks Jira/Azure/GitHub em tempo real
- [ ] Cache Redis para queries (PERF-001)
- [ ] Database query optimization (PERF-003)
- [ ] Tempo/Clockify automatic hours sync

**Success Criteria**:
- Webhooks entregando em < 5s
- P95 latency dashboard < 1s
- Cache hit rate > 70%

#### v0.4.0 - Intelligence (📅 Planejado - Julho 2026)
**Theme**: Relatórios e Insights
- [ ] Relatórios financeiros PDF
- [ ] Exportação de dados (CSV/Excel)
- [ ] Custom dashboards
- [ ] Alertas preditivos (IA detecta riscos)

#### v1.0.0 - Production Ready (📅 Planejado - Agosto 2026)
**Theme**: Enterprise-Grade
- [ ] Todas 14 integrações funcionando
- [ ] 2FA e audit logs (SEC-002, SEC-003)
- [ ] API pública + documentação
- [ ] Mobile app (iOS/Android)
- [ ] SLA 99.9% uptime
- [ ] SOC 2 compliance iniciada

### 10.2. Feature Prioritization Framework

| Fator | Peso | Escala |
|-------|------|--------|
| **Impact** | 40% | 1-5 (quantos usuários afeta) |
| **Effort** | 30% | 1-5 (inverso: 1=muito esforço, 5=pouco) |
| **Strategic Value** | 20% | 1-5 (alinhamento com visão) |
| **Risk** | 10% | 1-5 (inverso: 1=alto risco, 5=baixo) |

**Score** = (Impact × 0.4) + (Effort × 0.3) + (Strategic × 0.2) + (Risk × 0.1)

**Exemplo**:
- INT-001 (Jira sync): Impact=5, Effort=2, Strategic=5, Risk=3 → **Score = 3.7**
- Mobile app: Impact=3, Effort=1, Strategic=3, Risk=2 → **Score = 2.3**

---

## 11. Restrições e Limitações

### 11.1. Restrições Técnicas

| Restrição | Descrição | Mitigação |
|-----------|-----------|-----------|
| **Rate Limits de APIs** | Jira: 100 req/min, GitHub: 5000/h | Cache Redis (TTL 5min), BullMQ throttling |
| **Custo de IA** | Claude: $3/$15 por 1M tokens | Limitar forecasts a 1x/dia por projeto |
| **Data Retention** | Sentry free: 30 dias | Plano pago após 100 orgs |
| **Concurrent Syncs** | VPS: 2 vCPUs | Máx 10 syncs simultâneos (BullMQ) |

### 11.2. Limitações Conhecidas

| Limitação | Impact | Workaround | Roadmap |
|-----------|--------|----------|---------|
| **Sync não é real-time** | Dados podem ter atraso de até 15min | Sync manual via botão | v0.3.0: Webhooks |
| **Sem multi-repo por projeto** | 1 projeto = 1 repo GitHub | Criar projetos separados | v1.1.0: Multi-repo |
| **Forecast requer 3+ sprints** | Novos projetos não têm forecast | Mensagem explicativa | N/A (limitação de IA) |
| **Tokens não encriptados** | Risco de leak no DB | Permissões DB restritas | v0.2.0: SEC-001 |

### 11.3. Dependências Externas

| Dependência | Risco | Contingência |
|-------------|-------|--------------|
| **APIs de terceiros** | Jira/Azure podem mudar API | Versionamento (v3, v7.0) + testes |
| **Anthropic API** | Rate limits ou downtime | Fallback para forecast baseado em média simples |
| **Stripe** | Downtime afeta billing | Queue de billing events |
| **VPS (Hostinger)** | Downtime afeta toda aplicação | Backup diário + disaster recovery plan |

### 11.4. Restrições de Compliance

| Regulação | Status | Prazo |
|-----------|--------|-------|
| **LGPD** | ⏳ Parcial | Agosto 2026 (audit logs, data export) |
| **GDPR** | ⏳ Parcial | Agosto 2026 (para clientes EU) |
| **SOC 2 Type II** | ❌ Não iniciado | 2027 (para enterprise) |

---

## Appendix A: Glossary

| Termo | Definição |
|-------|-----------|
| **Burndown** | Gráfico que mostra story points restantes ao longo do sprint |
| **Cycle Time** | Tempo desde "In Progress" até "Done" |
| **Developer Score** | Métrica 0-5 que avalia performance de desenvolvedores |
| **Forecast** | Previsão de data de entrega gerada por IA |
| **GP (Gerente de Projeto)** | PROJECT_MANAGER role, responsável por projetos específicos |
| **Lead Time** | Tempo desde criação do card até "Done" |
| **MRR** | Monthly Recurring Revenue - receita recorrente mensal |
| **Rework Rate** | % de cards que voltaram para "In Progress" após estarem em teste |
| **Sprint** | Ciclo de desenvolvimento (geralmente 1-2 semanas) |
| **Stale PR** | Pull Request aberto há mais de 24h sem atividade |
| **Sync** | Sincronização de dados de ferramenta externa (Jira, Azure, etc) |
| **Velocity** | Média de story points completados por sprint |

---

## Appendix B: API Endpoints (Resumo)

Ver documentação completa em `OVERVIEW.md` e Swagger (em desenvolvimento).

**Total**: 53 endpoints

**Principais categorias**:
- Auth (2): `/auth/login`, `/auth/register`
- Projects (5): CRUD + listagem
- Sprints (2): listagem + current
- Developers (2): listagem + cards
- Pull Requests (3): listagem + stats + sync
- Billing (4): checkout + portal + webhook
- Budget (6): CRUD + financials + hours
- Alerts (8): Slack/Teams config + test
- Sync (12): triggers para 14 integrações
- AI Forecast (3): generate + history

---

## Appendix C: Change Log

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | 2026-04-19 | Claude + Romeu | PRD inicial baseado em constitution.md, research.md, OVERVIEW.md |

---

**Aprovações**:
- [ ] Product Owner: ________________ Data: ________
- [ ] Tech Lead: ________________ Data: ________
- [ ] Stakeholders: ________________ Data: ________

---

**Fim do PRD**
