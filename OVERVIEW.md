# Spravio - Visão Geral do Projeto

## 📋 Índice

- [Resumo](#resumo)
- [Arquitetura](#arquitetura)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Backend (API)](#backend-api)
- [Frontend (Web)](#frontend-web)
- [Banco de Dados](#banco-de-dados)
- [Infraestrutura & Deploy](#infraestrutura--deploy)
- [Principais Features](#principais-features)

---

## 📌 Resumo

**Spravio** é uma plataforma de gestão de projetos de desenvolvimento de software que integra dados de múltiplas fontes (Jira, Azure DevOps, GitHub) para fornecer:
- Rastreamento de sprints e burndown
- Gestão de orçamento e forecasting
- Controle de horas e desenvolvedores
- Sincronização automática com ferramentas externas
- Dashboard financeiro e relatórios

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│                    (Next.js 14 App)                          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (Traefik)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API (Fastify 5)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │  Services    │  │ Repositories │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            ▼                                 │
│                  ┌──────────────────┐                        │
│                  │  Prisma ORM      │                        │
│                  └──────────────────┘                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌─────────┐    ┌──────────┐
    │PostgreSQL│    │  Redis  │    │ BullMQ   │
    └──────────┘    └─────────┘    └──────────┘
          │
          │ Sync Jobs
          ▼
    ┌──────────────────────────────────┐
    │  Integrações Externas            │
    │  - Jira Cloud                    │
    │  - Azure DevOps                  │
    │  - GitHub                        │
    │  - Clockify                      │
    └──────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológica

### Backend
- **Runtime**: Node.js 20 + TypeScript (strict mode)
- **Framework**: Fastify 5
- **ORM**: Prisma 6
- **Database**: PostgreSQL 15
- **Cache**: Redis 7 + ioredis 5
- **Queue**: BullMQ
- **Validação**: Zod 3
- **Autenticação**: NextAuth.js (JWT)

### Frontend
- **Framework**: Next.js 14.2 (App Router)
- **Linguagem**: TypeScript (strict mode)
- **UI**: Tailwind CSS 3
- **Gerenciamento de Estado**: React Query
- **Autenticação**: NextAuth.js

### Infraestrutura
- **Containerização**: Docker + Docker Compose
- **Reverse Proxy**: Traefik 2 (SSL/TLS automático)
- **CI/CD**: GitHub Actions
- **Monorepo**: pnpm workspaces
- **Hospedagem**: VPS (Hostinger)

---

## 📁 Estrutura do Projeto

```
spravio/
├── apps/
│   ├── api/                    # Backend Fastify
│   │   ├── src/
│   │   │   ├── modules/        # Módulos por feature
│   │   │   │   ├── auth/       # Autenticação
│   │   │   │   ├── projects/   # Gestão de projetos
│   │   │   │   ├── sprints/    # Gestão de sprints
│   │   │   │   ├── developers/ # Gestão de desenvolvedores
│   │   │   │   └── sync/       # Sincronização com APIs externas
│   │   │   ├── hooks/          # Fastify hooks (auth, error handling)
│   │   │   ├── plugins/        # Plugins (redis, prisma, bullmq)
│   │   │   ├── lib/            # Utilitários e clients
│   │   │   ├── app.ts          # Configuração do app Fastify
│   │   │   └── server.ts       # Entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Schema do banco de dados
│   │   │   └── migrations/     # Migrations Prisma
│   │   └── Dockerfile
│   │
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/            # App Router (Next.js 14)
│       │   │   ├── (auth)/     # Rotas de autenticação
│       │   │   ├── (dashboard)/# Rotas protegidas
│       │   │   │   ├── portfolio/
│       │   │   │   ├── projects/[projectId]/
│       │   │   │   │   ├── overview/
│       │   │   │   │   ├── sprint/
│       │   │   │   │   ├── backlog/
│       │   │   │   │   ├── developers/
│       │   │   │   │   └── financials/
│       │   │   │   └── settings/
│       │   │   ├── api/        # API routes (NextAuth)
│       │   │   └── layout.tsx
│       │   ├── components/     # Componentes React
│       │   │   ├── ui/         # Componentes base
│       │   │   ├── layout/     # Layout components
│       │   │   ├── onboarding/ # Wizard de onboarding
│       │   │   ├── projects/   # Componentes de projetos
│       │   │   └── shared/     # Componentes compartilhados
│       │   ├── lib/            # Utilitários e helpers
│       │   └── styles/
│       └── Dockerfile
│
├── packages/
│   ├── types/                  # TypeScript types compartilhados
│   └── utils/                  # Utilitários compartilhados
│
├── docker-compose.yml          # Dev environment
├── docker-compose.prod.yml     # Production environment
├── pnpm-workspace.yaml
└── package.json
```

---

## 🔧 Backend (API)

### Arquitetura em Camadas

```
Routes (HTTP) → Services (Business Logic) → Repositories (Data Access) → Prisma → Database
```

### Módulos Principais

#### 1. **Auth** (`/src/modules/auth`)
- Login/Register (JWT)
- NextAuth integration
- Session management
- Password hashing (bcrypt)

#### 2. **Organizations** (`/src/modules/organizations`)
- Gestão de organizações
- Configurações (Jira, Azure, GitHub)
- Multi-tenancy support

#### 3. **Projects** (`/src/modules/projects`)
- CRUD de projetos
- Orçamento e forecasting
- Sincronização com Jira/Azure
- Cálculo de horas e custos

#### 4. **Sprints** (`/src/modules/sprints`)
- Gestão de sprints
- Burndown charts
- Story points tracking
- Horas realizadas vs planejadas

#### 5. **Developers** (`/src/modules/developers`)
- Cadastro de desenvolvedores
- Taxas horárias
- Atribuição a projetos

#### 6. **Sync** (`/src/modules/sync`)
- Jobs de sincronização automática (BullMQ)
- Integração Jira Cloud API
- Integração Azure DevOps API
- Integração GitHub API
- Integração Clockify

### Plugins Fastify

- **Prisma**: Conexão com banco de dados
- **Redis**: Cache e sessions
- **BullMQ**: Filas de jobs assíncronos
- **CORS**: Configuração de origens permitidas
- **Helmet**: Security headers
- **Rate Limit**: Proteção contra abuse

### Principais Rotas

```
GET    /health                    # Health check
POST   /auth/login                # Login
POST   /auth/register             # Registro

GET    /api/projects              # Lista projetos
POST   /api/projects              # Cria projeto
GET    /api/projects/:id          # Detalhes do projeto
PUT    /api/projects/:id          # Atualiza projeto
DELETE /api/projects/:id          # Deleta projeto

GET    /api/sprints               # Lista sprints
POST   /api/sprints               # Cria sprint
GET    /api/sprints/:id/burndown  # Burndown chart

GET    /api/developers            # Lista desenvolvedores
POST   /api/developers            # Adiciona desenvolvedor

POST   /api/sync/jira             # Trigger sync Jira
POST   /api/sync/azure            # Trigger sync Azure
GET    /api/sync/status           # Status da sync
```

---

## 🎨 Frontend (Web)

### App Router (Next.js 14)

```
app/
├── (auth)/                 # Rotas públicas
│   ├── login/
│   └── register/
│
├── (dashboard)/            # Rotas protegidas (requer auth)
│   ├── layout.tsx          # Layout com sidebar + navbar
│   ├── portfolio/          # Visão geral de todos os projetos
│   ├── projects/[id]/      # Detalhes de um projeto
│   │   ├── overview/       # Dashboard do projeto
│   │   ├── sprint/         # Sprint atual + burndown
│   │   ├── backlog/        # Backlog de issues
│   │   ├── developers/     # Equipe alocada
│   │   ├── pullrequests/   # PRs do projeto
│   │   └── financials/     # Orçamento + custos
│   │
│   └── settings/           # Configurações
│       ├── profile/
│       ├── organization/
│       └── integrations/   # Jira, Azure, GitHub
│
└── api/
    └── auth/[...nextauth]/ # NextAuth.js API routes
```

### Componentes Principais

#### Layout
- **Sidebar**: Navegação principal (Portfolio, Projetos, Settings)
- **Navbar**: User menu + notifications
- **ProjectSidebar**: Navegação interna do projeto

#### Onboarding
- **OnboardingWizard**: Modal wizard para primeiro acesso
  - Step 1: Escolher fonte (Jira/Azure)
  - Step 2: Conectar GitHub
  - Step 3: Criar primeiro projeto

#### UI Components
- **Button**, **Input**, **Select**: Componentes base
- **Dialog**, **Dropdown**: Modals e menus
- **EmptyState**: Estados vazios
- **LoadingSpinner**: Loading states

#### Charts
- **BurndownChart**: Gráfico de burndown (sprint)
- **BudgetChart**: Gráfico de orçamento vs gasto

### Estado e Data Fetching

- **React Query** para cache e sincronização de dados
- **Server Components** (RSC) para buscar dados no servidor
- **Client Components** para interatividade

---

## 🗄️ Banco de Dados

### Schema Principal (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String?  // Hashed with bcrypt
  name          String?
  organizations OrganizationUser[]
  sessions      Session[]
  accounts      Account[]
}

model Organization {
  id       String @id @default(cuid())
  name     String
  users    OrganizationUser[]
  projects Project[]
  settings OrganizationSettings?
}

model OrganizationSettings {
  // Jira integration
  jiraBaseUrl   String?
  jiraEmail     String?
  jiraApiToken  String?
  jiraCloudId   String?

  // Azure DevOps integration
  azureOrgUrl      String?
  azurePersonalToken String?

  // GitHub integration
  githubOrg   String?
  githubToken String?
}

model Project {
  id             String   @id @default(cuid())
  name           String
  key            String   // Ex: SPRV
  organization   Organization @relation(...)

  // Integration IDs
  jiraProjectId   String?
  azureProjectId  String?
  trelloBoardId   String?

  budget         ProjectBudget?
  sprints        Sprint[]
  developers     ProjectDeveloper[]
  issues         Issue[]
}

model Sprint {
  id          String   @id @default(cuid())
  name        String
  startDate   DateTime
  endDate     DateTime
  goal        String?
  totalPoints Int?
  project     Project  @relation(...)
  issues      Issue[]
  burndown    BurndownPoint[]
}

model Issue {
  id            String   @id @default(cuid())
  externalId    String   // Jira/Azure ID
  key           String   // Ex: SPRV-123
  title         String
  type          IssueType
  status        String
  points        Int?
  hoursEstimated Float?
  hoursLogged    Float?
  sprint        Sprint?  @relation(...)
  project       Project  @relation(...)
}

model Developer {
  id       String   @id @default(cuid())
  name     String
  email    String?
  rates    DeveloperRate[]
  projects ProjectDeveloper[]
}

model ProjectDeveloper {
  project    Project   @relation(...)
  developer  Developer @relation(...)
  role       String    // Ex: Frontend, Backend
  hourlyRate Decimal
  allocation Int       // % de alocação
}
```

### Migrations

Todas as migrations estão em `apps/api/prisma/migrations/`:

- `20260404000000_baseline_phases_10_16` - Schema inicial completo
- `20260417000000_add_azure_org_settings` - Configurações Azure DevOps
- `20260418000000_add_integration_fields` - Campos de integração (Trello, etc)

---

## 🚀 Infraestrutura & Deploy

### Ambientes

#### **Desenvolvimento**
```bash
# Portas customizadas (não conflita com outros projetos)
Postgres: 5434 → 5432
Redis:    6380 → 6379
API:      3010
Web:      3011

# Rodar localmente
pnpm install
pnpm dev  # Sobe API + Web + Postgres + Redis
```

#### **Produção**
```bash
# VPS: your-server.example.com
# Reverse Proxy: Traefik (porta 80/443)
# SSL: Let's Encrypt (automático)

URLs:
- https://spravio.io          # Frontend
- https://api.spravio.io      # API
```

### CI/CD (GitHub Actions)

#### **Workflow Principal**: `.github/workflows/deploy-direct-build.yml`

```yaml
on: workflow_dispatch  # Deploy manual

jobs:
  1. Sync código para VPS via SCP
  2. Build Docker images na VPS
  3. docker compose up -d
  4. Run Prisma migrations
  5. Health check
```

#### **Outros Workflows**

- `ci.yml` - Type checking + tests
- `reset-database.yml` - Reset DB em produção (manual, com confirmação)
- `delete-user.yml` - Delete user específico
- `make-packages-public.yml` - Gerenciar visibilidade GHCR (legacy)

### Docker Compose

#### Produção (`docker-compose.prod.yml`)
- Usa Traefik labels (sem portas expostas)
- Imagens: Build local
- Volumes persistentes para Postgres + Redis
- Network externa `proxy` (compartilhada com Traefik)
- Healthchecks para DB + Redis

#### Override (`docker-compose.override.yml`)
- Define `build context` para builds locais
- Sobrescreve image names para tags locais

---

## ✨ Principais Features

### 1. **Multi-Integração**
- Conecta com **Jira**, **Azure DevOps**, **GitHub**
- Sincronização automática via jobs (BullMQ)
- Suporte a múltiplas organizações

### 2. **Gestão de Sprints**
- Criação e acompanhamento de sprints
- **Burndown charts** em tempo real
- Tracking de story points e horas

### 3. **Orçamento & Forecasting**
- Orçamento por projeto
- Cálculo automático de custos (horas × taxa horária)
- **Delivery forecast** baseado em velocity

### 4. **Gestão de Equipe**
- Cadastro de desenvolvedores
- Taxas horárias customizadas
- Alocação % por projeto
- Tracking de horas (integração Clockify)

### 5. **Dashboard Financeiro**
- Orçamento vs Gasto real
- Forecast de entrega
- Análise de rentabilidade por projeto

### 6. **Onboarding Wizard**
- Wizard guiado para novos usuários
- Setup de integração (Jira/Azure/GitHub)
- Criação do primeiro projeto

### 7. **Autenticação & Segurança**
- NextAuth.js (JWT + Session)
- Bcrypt para passwords
- Rate limiting
- CORS configurável
- Security headers (Helmet)

---

## 📊 Fluxo de Sincronização

```mermaid
sequenceDiagram
    participant User
    participant Web
    participant API
    participant BullMQ
    participant Jira

    User->>Web: Clica "Sync Project"
    Web->>API: POST /api/sync/jira
    API->>BullMQ: Enqueue job
    API-->>Web: 202 Accepted

    BullMQ->>Jira: GET /rest/agile/1.0/board/X/sprint
    Jira-->>BullMQ: Sprints data

    BullMQ->>Jira: GET /rest/agile/1.0/sprint/Y/issue
    Jira-->>BullMQ: Issues data

    BullMQ->>API: Upsert Sprint + Issues
    API->>Database: Save data

    BullMQ->>Web: WebSocket notification (optional)
    Web->>User: "Sync completed"
```

---

## 🔐 Variáveis de Ambiente

### Backend (API)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=xxx
PORTAL_SECRET=xxx
PORT=3010
NODE_ENV=production

# Jira
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=user@company.com
JIRA_API_TOKEN=xxx
JIRA_CLOUD_ID=xxx

# Azure DevOps
AZURE_ORG_URL=https://dev.azure.com/yourorg
AZURE_PERSONAL_TOKEN=xxx

# GitHub
GH_INTEGRATION_TOKEN=xxx
GITHUB_ORG=yourorg
```

### Frontend (Web)
```env
NEXT_PUBLIC_API_URL=https://api.spravio.io
NEXTAUTH_URL=https://spravio.io
NEXTAUTH_SECRET=xxx
```

---

## 📚 Comandos Úteis

```bash
# Desenvolvimento
pnpm install              # Instala dependências
pnpm dev                  # Roda tudo (API + Web + DB)
pnpm typecheck            # Type checking em todos os packages

# Backend
pnpm --filter @spravio/api dev         # Roda apenas API
pnpm --filter @spravio/api prisma:migrate  # Cria migration
pnpm --filter @spravio/api prisma:deploy   # Aplica migrations

# Frontend
pnpm --filter @spravio/web dev         # Roda apenas Web
pnpm --filter @spravio/web build       # Build production

# Docker
docker compose up -d                   # Sobe todos os serviços
docker compose logs -f api             # Logs da API
docker compose exec postgres psql -U spravio  # Acessa DB
docker compose down                    # Para todos os serviços

# Deploy
gh workflow run deploy-direct-build.yml  # Trigger deploy manual
gh run watch <run-id>                    # Acompanha deploy
```

---

## 🎯 Roadmap Técnico

### ✅ Concluído
- [x] Monorepo com pnpm workspaces
- [x] Backend Fastify + Prisma
- [x] Frontend Next.js 14 (App Router)
- [x] Autenticação NextAuth
- [x] Integração Jira Cloud
- [x] Integração Azure DevOps
- [x] Deploy automático via GitHub Actions
- [x] Onboarding wizard
- [x] Dashboard de projetos
- [x] Burndown charts

### 🔄 Em Desenvolvimento
- [ ] Testes unitários (Vitest)
- [ ] Testes E2E (Playwright)
- [ ] Notificações em tempo real (WebSocket)
- [ ] Exportação de relatórios (PDF)
- [ ] Integração Slack/Teams

### 🔮 Futuro
- [ ] Mobile app (React Native)
- [ ] IA para forecasting
- [ ] Multi-idioma (i18n)
- [ ] Tema dark mode
- [ ] API pública + SDK

---

## 📖 Recursos Adicionais

- **Documentação Prisma**: https://www.prisma.io/docs
- **Documentação Fastify**: https://fastify.dev/docs
- **Documentação Next.js**: https://nextjs.org/docs
- **Jira Cloud API**: https://developer.atlassian.com/cloud/jira/platform/rest/v3
- **Azure DevOps API**: https://learn.microsoft.com/en-us/rest/api/azure/devops

---

**Gerado em**: 2026-04-19
**Versão**: 1.0.0
**Autor**: Claude Sonnet 4.5
