# 🗺️ Spravio - Roadmap de Implementação

> **Última atualização**: 2026-04-19
> **Versão atual em produção**: v0.1.0 (commit: 94196a4)

---

## 📊 Status Geral

| Categoria | Concluído | Em Progresso | Planejado | Total |
|-----------|-----------|--------------|-----------|-------|
| 📝 Documentação | 1 | 0 | 0 | 1 |
| 🏗️ Infraestrutura | 8 | 0 | 4 | 12 |
| 🔌 Integrações | 3 | 0 | 9 | 12 |
| 📈 Monitoring | 2 | 0 | 4 | 6 |
| 🔒 Segurança | 3 | 0 | 4 | 7 |
| ⚡ Performance | 2 | 0 | 4 | 6 |
| 📱 Features | 12 | 0 | 8 | 20 |
| **TOTAL** | **31** | **0** | **33** | **64** |

---

## 🎯 Prioridades (Próximas Implementações)

### P0 - Crítico (Esta Semana)
- [x] **DOC-001**: Commit documentação (OVERVIEW.md + ROADMAP.md)
  - **Data**: 2026-04-19
  - **Commit**: ade23b5
  - **Nota**: 1281 linhas de documentação completa
- [x] **MON-001**: Ativar Sentry para error tracking
  - **Data**: 2026-04-19
  - **Commit**: 54dd71c
  - **Nota**: Código já implementado, criada documentação completa (docs/SENTRY_SETUP.md)
  - **Ação necessária**: Usuário precisa criar conta Sentry e configurar DSNs
- [ ] **INT-001**: Implementar sincronização Jira (primeira integração)

### P1 - Alta (Este Mês)
- [ ] **MON-002**: Setup uptime monitoring
- [ ] **SEC-001**: Encriptar tokens no banco de dados
- [ ] **INT-002**: Implementar sincronização Azure DevOps
- [ ] **INT-003**: Implementar sincronização GitHub PRs

### P2 - Média (Próximos 2-3 Meses)
- [ ] **PERF-001**: Implementar cache Redis para queries
- [ ] **MON-003**: Setup logs estruturados persistentes
- [ ] **INT-004**: Webhooks Jira/Azure em tempo real
- [ ] **FEAT-001**: Relatórios financeiros automáticos

### P3 - Baixa (Backlog)
- [ ] **PERF-002**: CDN para assets estáticos
- [ ] **FEAT-002**: Mobile app (React Native)
- [ ] **INT-005**: Integrações adicionais (Trello, Linear, etc)

---

## 📋 Tarefas Detalhadas

### 🏗️ Infraestrutura

#### ✅ Concluído
- [x] **INF-001**: Docker multi-stage builds (API + Web)
  - **Data**: 2026-04-04
  - **Commit**: 2e35b86
  - **Nota**: Otimizado para produção com Alpine Linux

- [x] **INF-002**: Docker Compose para desenvolvimento
  - **Data**: 2026-04-04
  - **Commit**: baseline
  - **Nota**: Postgres 5434, Redis 6380 (evita conflito com outros projetos)

- [x] **INF-003**: Docker Compose para produção com Traefik
  - **Data**: 2026-04-15
  - **Commit**: 2e35b86
  - **Nota**: SSL automático, reverse proxy configurado

- [x] **INF-004**: GitHub Actions - Deploy direto na VPS
  - **Data**: 2026-04-18
  - **Commit**: 0243a1d
  - **Nota**: Build direto no servidor, sem GHCR

- [x] **INF-005**: Healthcheck endpoints
  - **Data**: 2026-04-15
  - **Commit**: 2e35b86
  - **Nota**: GET /health retorna 200 OK com timestamp

- [x] **INF-006**: Prisma migrations em produção
  - **Data**: 2026-04-18
  - **Commit**: multiple
  - **Nota**: 3 migrations aplicadas com sucesso

- [x] **INF-007**: Ambiente de desenvolvimento configurado
  - **Data**: 2026-04-04
  - **Commit**: baseline
  - **Nota**: pnpm workspaces, hot reload, tsx watch

- [x] **INF-008**: Configuração de TypeScript strict mode
  - **Data**: 2026-04-04
  - **Commit**: baseline
  - **Nota**: Zero erros em todos os 4 pacotes

#### 🔲 Planejado
- [ ] **INF-009**: CI/CD para testes automatizados
  - **Prioridade**: P2
  - **Estimativa**: 1 dia
  - **Descrição**: Rodar testes no GitHub Actions antes do deploy
  - **Dependências**: Nenhuma

- [ ] **INF-010**: Staging environment separado
  - **Prioridade**: P2
  - **Estimativa**: 2 dias
  - **Descrição**: Ambiente staging.spravio.io para testes
  - **Dependências**: Infraestrutura adicional na VPS

- [ ] **INF-011**: Database backup automático
  - **Prioridade**: P1
  - **Estimativa**: 4 horas
  - **Descrição**: Cron job para backup diário do PostgreSQL
  - **Dependências**: Configuração de storage (S3/VPS)

- [ ] **INF-012**: Rollback automático em caso de falha
  - **Prioridade**: P2
  - **Estimativa**: 1 dia
  - **Descrição**: Health check pós-deploy com rollback automático
  - **Dependências**: INF-009

---

### 🔌 Integrações

#### ✅ Concluído
- [x] **INT-000-A**: Schema DB para Jira
  - **Data**: 2026-04-04
  - **Commit**: baseline
  - **Arquivos**: `prisma/schema.prisma` (OrganizationSettings, Project)

- [x] **INT-000-B**: Schema DB para Azure DevOps
  - **Data**: 2026-04-17
  - **Commit**: 20260417000000_add_azure_org_settings
  - **Arquivos**: Migration + schema

- [x] **INT-000-C**: Interface UI de configuração de integrações
  - **Data**: 2026-04-17
  - **Commit**: multiple
  - **Arquivos**: `apps/web/src/app/(dashboard)/settings/integrations/page.tsx`
  - **Nota**: Jira, Azure DevOps, GitHub configuráveis

#### 🔲 Planejado

##### P0 - Primeira Integração (Jira)
- [ ] **INT-001**: Sincronização Jira - Issues
  - **Prioridade**: P0
  - **Estimativa**: 3 dias
  - **Descrição**:
    - Criar adapter para Jira REST API v3
    - Implementar job BullMQ para sync periódico
    - Mapear Jira Issues → Spravio Issues
    - Sync de status, assignee, story points
  - **Dependências**: Credenciais Jira em OrganizationSettings
  - **Arquivos a criar**:
    - `apps/api/src/integrations/jira/client.ts`
    - `apps/api/src/integrations/jira/mapper.ts`
    - `apps/api/src/jobs/sync-jira-issues.ts`
  - **Testes**: Testar com projeto real do Jira
  - **Rollout**: Feature flag para habilitar/desabilitar

##### P1 - Segunda Integração (Azure)
- [ ] **INT-002**: Sincronização Azure DevOps - Work Items
  - **Prioridade**: P1
  - **Estimativa**: 3 dias
  - **Descrição**:
    - Criar adapter para Azure DevOps REST API 7.0
    - Implementar job BullMQ para sync periódico
    - Mapear Work Items → Spravio Issues
    - Sync de iterations, boards, sprints
  - **Dependências**: INT-001 (padrão de sync estabelecido)
  - **Arquivos a criar**:
    - `apps/api/src/integrations/azure/client.ts`
    - `apps/api/src/integrations/azure/mapper.ts`
    - `apps/api/src/jobs/sync-azure-workitems.ts`

##### P1 - Terceira Integração (GitHub)
- [ ] **INT-003**: Sincronização GitHub - Pull Requests
  - **Prioridade**: P1
  - **Estimativa**: 2 dias
  - **Descrição**:
    - Criar adapter para GitHub REST API
    - Sincronizar PRs, commits, reviews
    - Mapear PRs → Spravio PullRequest model
    - Calcular métricas (lead time, cycle time)
  - **Dependências**: INT-001
  - **Arquivos a criar**:
    - `apps/api/src/integrations/github/client.ts`
    - `apps/api/src/integrations/github/mapper.ts`
    - `apps/api/src/jobs/sync-github-prs.ts`

##### P2 - Webhooks
- [ ] **INT-004**: Webhooks Jira em tempo real
  - **Prioridade**: P2
  - **Estimativa**: 2 dias
  - **Descrição**:
    - Endpoint POST /webhooks/jira
    - Validação de assinatura Jira
    - Processar eventos: issue_created, issue_updated, sprint_started
    - Atualização incremental (sem full sync)
  - **Dependências**: INT-001

- [ ] **INT-005**: Webhooks Azure DevOps em tempo real
  - **Prioridade**: P2
  - **Estimativa**: 2 dias
  - **Descrição**: Similar a INT-004 para Azure
  - **Dependências**: INT-002

- [ ] **INT-006**: Webhooks GitHub em tempo real
  - **Prioridade**: P2
  - **Estimativa**: 1 dia
  - **Descrição**: Similar a INT-004 para GitHub
  - **Dependências**: INT-003

##### P3 - Integrações Adicionais
- [ ] **INT-007**: Trello integration
  - **Prioridade**: P3
  - **Estimativa**: 3 dias
  - **Nota**: Schema já existe, falta adapter

- [ ] **INT-008**: Linear integration
  - **Prioridade**: P3
  - **Estimativa**: 3 dias
  - **Nota**: Schema já existe, falta adapter

- [ ] **INT-009**: ClickUp integration
  - **Prioridade**: P3
  - **Estimativa**: 3 dias
  - **Nota**: Schema já existe, falta adapter

- [ ] **INT-010**: Asana integration
  - **Prioridade**: P3
  - **Estimativa**: 3 dias
  - **Nota**: Schema já existe, falta adapter

- [ ] **INT-011**: Monday.com integration
  - **Prioridade**: P3
  - **Estimativa**: 3 days
  - **Nota**: Schema já existe, falta adapter

---

### 📈 Monitoring & Observability

#### ✅ Concluído
- [x] **MON-000**: Health check endpoint
  - **Data**: 2026-04-15
  - **Commit**: 2e35b86
  - **URL**: https://api.spravio.io/health

- [x] **MON-001**: Sentry error tracking (código implementado)
  - **Data**: 2026-04-19
  - **Commit**: 54dd71c
  - **Nota**: Backend e frontend configurados, falta apenas DSNs do usuário
  - **Docs**: Ver `docs/SENTRY_SETUP.md`

#### 🔲 Planejado
- [ ] **MON-002**: Uptime monitoring
  - **Prioridade**: P1
  - **Estimativa**: 30 min
  - **Descrição**:
    - Criar conta no UptimeRobot (free tier)
    - Monitorar https://spravio.io e https://api.spravio.io/health
    - Configurar alertas via email
  - **Dependências**: Nenhuma

- [ ] **MON-003**: Logs estruturados persistentes
  - **Prioridade**: P2
  - **Estimativa**: 1 dia
  - **Descrição**:
    - Configurar log rotation no Docker
    - Persistir logs em volume separado
    - Opcional: Enviar para Loki/Elasticsearch
  - **Dependências**: Nenhuma

- [ ] **MON-004**: Métricas de performance (Prometheus)
  - **Prioridade**: P2
  - **Estimativa**: 2 dias
  - **Descrição**:
    - Adicionar prom-client ao Fastify
    - Expor métricas em /metrics
    - Setup Prometheus + Grafana
  - **Dependências**: Infraestrutura adicional

- [ ] **MON-005**: Application Performance Monitoring (APM)
  - **Prioridade**: P3
  - **Estimativa**: 1 dia
  - **Descrição**: New Relic ou Datadog para tracing
  - **Dependências**: Budget para APM tool

---

### 🔒 Segurança

#### ✅ Concluído
- [x] **SEC-000-A**: Bcrypt para passwords
  - **Data**: 2026-04-17
  - **Commit**: 508d41e
  - **Nota**: Substituiu plaintext por hash bcrypt (cost factor 10)

- [x] **SEC-000-B**: Helmet.js no Fastify
  - **Data**: 2026-04-15
  - **Commit**: 2e35b86
  - **Nota**: Headers de segurança configurados

- [x] **SEC-000-C**: Rate limiting
  - **Data**: 2026-04-15
  - **Commit**: 2e35b86
  - **Nota**: @fastify/rate-limit configurado

#### 🔲 Planejado
- [ ] **SEC-001**: Encriptar tokens de integração no DB
  - **Prioridade**: P1
  - **Estimativa**: 4 horas
  - **Descrição**:
    - Usar crypto.createCipheriv para encrypt/decrypt
    - Chave em variável de ambiente ENCRYPTION_KEY
    - Aplicar em jiraApiToken, azurePersonalAccessToken, githubToken
  - **Dependências**: Nenhuma
  - **Arquivos a modificar**:
    - `apps/api/src/modules/organizations/repository.ts`
    - Adicionar `apps/api/src/utils/crypto.ts`

- [ ] **SEC-002**: Auditoria de acessos (audit log)
  - **Prioridade**: P2
  - **Estimativa**: 2 dias
  - **Descrição**:
    - Criar tabela AuditLog
    - Registrar actions: login, settings_change, integration_config
    - Interface para visualizar logs
  - **Dependências**: Nova migration

- [ ] **SEC-003**: 2FA (Two-Factor Authentication)
  - **Prioridade**: P2
  - **Estimativa**: 3 dias
  - **Descrição**: TOTP com QR code (speakeasy + qrcode)
  - **Dependências**: Nova migration para 2FA secrets

- [ ] **SEC-004**: RBAC granular (Role-Based Access Control)
  - **Prioridade**: P3
  - **Estimativa**: 1 semana
  - **Descrição**:
    - Permissões granulares por recurso
    - Atualmente só tem OWNER/ADMIN/MEMBER/VIEWER
    - Adicionar permissions por feature
  - **Dependências**: Redesign do modelo de permissões

---

### ⚡ Performance

#### ✅ Concluído
- [x] **PERF-000-A**: Connection pooling PostgreSQL
  - **Data**: 2026-04-15
  - **Commit**: 2e35b86
  - **Nota**: `connection_limit=20` configurado

- [x] **PERF-000-B**: Docker multi-stage builds
  - **Data**: 2026-04-04
  - **Commit**: baseline
  - **Nota**: Imagens otimizadas (Alpine Linux)

#### 🔲 Planejado
- [ ] **PERF-001**: Cache Redis para queries frequentes
  - **Prioridade**: P2
  - **Estimativa**: 2 dias
  - **Descrição**:
    - Cache para listagem de projetos
    - Cache para configurações de organização
    - TTL de 5 minutos
    - Invalidação ao atualizar
  - **Dependências**: Redis já está configurado
  - **Arquivos a modificar**:
    - `apps/api/src/modules/projects/repository.ts`
    - `apps/api/src/modules/organizations/repository.ts`

- [ ] **PERF-002**: CDN para assets estáticos
  - **Prioridade**: P3
  - **Estimativa**: 4 horas
  - **Descrição**: Cloudflare na frente do spravio.io
  - **Dependências**: Configuração DNS

- [ ] **PERF-003**: Database query optimization
  - **Prioridade**: P2
  - **Estimativa**: 1 semana
  - **Descrição**:
    - Analisar slow queries
    - Adicionar índices necessários
    - Otimizar N+1 queries com select/include
  - **Dependências**: MON-004 (métricas para identificar gargalos)

- [ ] **PERF-004**: Lazy loading e code splitting (Web)
  - **Prioridade**: P2
  - **Estimativa**: 2 dias
  - **Descrição**:
    - Dynamic imports para rotas
    - Suspense boundaries
    - Reduzir bundle size inicial
  - **Dependências**: Nenhuma

---

### 📱 Features

#### ✅ Concluído
- [x] **FEAT-000-A**: Autenticação (JWT + bcrypt)
  - **Data**: 2026-04-04 / 2026-04-17
  - **Commits**: baseline + 508d41e

- [x] **FEAT-000-B**: Multi-tenancy (Organizations)
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-C**: Gestão de projetos (CRUD)
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-D**: Gestão de sprints
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-E**: Gestão de developers
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-F**: Burndown tracking
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-G**: Budget tracking
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-H**: Onboarding wizard
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-I**: Dashboard com overview
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-J**: Página de configurações de integrações
  - **Data**: 2026-04-17
  - **Commit**: multiple

- [x] **FEAT-000-K**: Portfolio view
  - **Data**: 2026-04-04
  - **Commit**: baseline

- [x] **FEAT-000-L**: Pull Requests view (placeholder)
  - **Data**: 2026-04-04
  - **Commit**: baseline

#### 🔲 Planejado
- [ ] **FEAT-001**: Relatórios financeiros automáticos
  - **Prioridade**: P2
  - **Estimativa**: 1 semana
  - **Descrição**:
    - Relatório de custo por sprint
    - Relatório de custo por developer
    - Burn rate e projeções
    - Exportação PDF
  - **Dependências**: INT-001 (dados de horas reais)

- [ ] **FEAT-002**: Exportação de dados (CSV/Excel)
  - **Prioridade**: P2
  - **Estimativa**: 2 dias
  - **Descrição**: Exportar projetos, sprints, issues, horas
  - **Dependências**: Nenhuma

- [ ] **FEAT-003**: Notificações (Slack/Teams)
  - **Prioridade**: P2
  - **Estimativa**: 3 dias
  - **Descrição**:
    - Webhook para Slack quando sprint inicia/termina
    - Webhook para Teams quando budget excede threshold
  - **Dependências**: Schema já existe (SlackConfig, TeamsConfig)

- [ ] **FEAT-004**: AI-powered forecasting
  - **Prioridade**: P3
  - **Estimativa**: 2 semanas
  - **Descrição**:
    - Previsão de delivery date baseada em velocity
    - Recomendações de alocação de developers
    - Usa Claude API (já configurado)
  - **Dependências**: INT-001, INT-002 (dados históricos)

- [ ] **FEAT-005**: Custom dashboards
  - **Prioridade**: P3
  - **Estimativa**: 2 semanas
  - **Descrição**: Usuário pode criar dashboards customizados
  - **Dependências**: FEAT-001 (componentes de gráficos)

- [ ] **FEAT-006**: Timesheet integração (Tempo/Clockify)
  - **Prioridade**: P2
  - **Estimativa**: 1 semana
  - **Descrição**: Schema já existe, falta implementação
  - **Dependências**: INT-001

- [ ] **FEAT-007**: Mobile app (React Native)
  - **Prioridade**: P3
  - **Estimativa**: 2 meses
  - **Descrição**: App nativo iOS/Android
  - **Dependências**: API já está pronto

- [ ] **FEAT-008**: Public API + Webhooks
  - **Prioridade**: P3
  - **Estimativa**: 1 semana
  - **Descrição**: API pública para integrações customizadas
  - **Dependências**: Documentação OpenAPI

---

## 📝 Decisões de Arquitetura (ADRs)

### ADR-001: Deploy direto na VPS (2026-04-18)
**Contexto**: GHCR estava dando 403 Forbidden persistentemente.
**Decisão**: Abandonar GHCR, fazer build direto na VPS via GitHub Actions.
**Consequências**:
- ✅ Deploy mais rápido (sem push/pull de imagens)
- ✅ Sem dependência de registry externo
- ❌ Build usa recursos da VPS (CPU/memória)
- ❌ Não há imagens versionadas em registry

**Status**: Implementado e funcionando.

---

### ADR-002: Bcrypt para passwords (2026-04-17)
**Contexto**: Código inicial tinha plaintext passwords (nunca foi para produção).
**Decisão**: Migrar para bcrypt com cost factor 10.
**Consequências**:
- ✅ Segurança adequada para produção
- ✅ Padrão da indústria
- ❌ Leve overhead no login (aceitável)

**Status**: Implementado.

---

### ADR-003: Monorepo com pnpm workspaces (2026-04-04)
**Contexto**: Compartilhar tipos e utils entre API e Web.
**Decisão**: Usar pnpm workspaces com packages shared.
**Consequências**:
- ✅ Type-safety entre frontend e backend
- ✅ Reutilização de código
- ❌ Builds levemente mais complexos

**Status**: Implementado.

---

## 🚀 Releases

### v0.1.0 - MVP em Produção (2026-04-19)
**Deploy**: https://spravio.io
**Commit**: 94196a4
**Features**:
- ✅ Autenticação e multi-tenancy
- ✅ CRUD de projetos, sprints, developers
- ✅ Onboarding wizard
- ✅ Configuração de integrações (UI)
- ✅ Docker + Traefik + SSL
- ✅ Deploy automatizado

**Limitações**:
- Sincronização de integrações não implementada
- Sem monitoring além de health check
- Tokens de integração não encriptados

---

### v0.2.0 - Primeira Integração (Planejado)
**ETA**: 1 semana
**Features**:
- [ ] Sincronização Jira completa (INT-001)
- [ ] Sentry error tracking (MON-001)
- [ ] Uptime monitoring (MON-002)
- [ ] Tokens encriptados (SEC-001)

---

### v0.3.0 - Multi-integração (Planejado)
**ETA**: 1 mês
**Features**:
- [ ] Azure DevOps sync (INT-002)
- [ ] GitHub PRs sync (INT-003)
- [ ] Cache Redis (PERF-001)
- [ ] Webhooks em tempo real (INT-004, INT-005, INT-006)

---

### v1.0.0 - Production Ready (Planejado)
**ETA**: 3 meses
**Features**:
- [ ] Todas integrações principais (Jira, Azure, GitHub)
- [ ] Monitoring completo
- [ ] Security hardening completo
- [ ] Relatórios financeiros (FEAT-001)
- [ ] Notificações Slack/Teams (FEAT-003)
- [ ] Performance otimizado
- [ ] Documentação completa

---

## 📞 Suporte e Dúvidas

- **Documentação**: Ver `OVERVIEW.md` para arquitetura
- **Issues**: Criar issue no GitHub
- **Claude Memory**: Consultar `.claude/projects/*/memory/MEMORY.md`

---

## 🔄 Como Atualizar Este Documento

Ao completar uma task:
1. Mover de 🔲 para ✅
2. Adicionar data e commit hash
3. Documentar decisões importantes em ADRs
4. Atualizar tabela de Status Geral
5. Commit com mensagem: `docs: update roadmap - complete [TASK-ID]`

Ao adicionar nova task:
1. Escolher ID único (ex: FEAT-009)
2. Definir prioridade (P0-P3)
3. Estimar tempo realista
4. Listar dependências
5. Adicionar à seção apropriada
