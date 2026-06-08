# Spravio — Indice de Specs (SDD)

> Fonte unica de verdade para todas as funcionalidades do projeto.
> Workflow: `spec.md` → Implementacao → Spec atualizada → `CHANGELOG.md`

---

## Progresso

| Metrica | Concluido | Total | Progresso |
|---------|-----------|-------|-----------|
| **MVP** | 105 pts | 120 pts | **87.5%** |
| **Total** | 141 pts | 255 pts | **55.3%** |

---

## Concluido (29) — 141 pts

| ID | Spec | Categoria | Pts | MVP |
|----|------|-----------|-----|-----|
| SPEC-001 | [Foundation & Monorepo Setup](concluido/SPEC-001-foundation.md) | infraestrutura | 13 | Sim |
| SPEC-002 | [Jira Integration](concluido/SPEC-002-jira-integration.md) | integracao | 8 | Sim |
| SPEC-003 | [Dashboard](concluido/SPEC-003-dashboard.md) | plataforma | 8 | Sim |
| SPEC-004 | [GitHub Integration (Basic)](concluido/SPEC-004-github-basic.md) | integracao | 5 | Sim |
| SPEC-005 | [GP & Roles (RBAC)](concluido/SPEC-005-gp-roles.md) | plataforma | 5 | Sim |
| SPEC-006 | [SaaS Features (Stripe & Portal)](concluido/SPEC-006-saas-stripe-portal.md) | plataforma | 8 | Sim |
| SPEC-007 | [Slack Notifications](concluido/SPEC-007-slack-notifications.md) | integracao | 3 | — |
| SPEC-008 | [Budget & Financial](concluido/SPEC-008-budget-financial.md) | plataforma | 8 | Sim |
| SPEC-009 | [Azure DevOps Integration](concluido/SPEC-009-azure-devops.md) | integracao | 5 | — |
| SPEC-010 | [GitLab + Microsoft Teams](concluido/SPEC-010-gitlab-teams.md) | integracao | 5 | — |
| SPEC-011 | [Tempo + Clockify (Time Tracking)](concluido/SPEC-011-tempo-clockify.md) | integracao | 3 | — |
| SPEC-012 | [AI Forecast (Anthropic Claude)](concluido/SPEC-012-ai-forecast.md) | plataforma | 5 | — |
| SPEC-013 | [Trello Integration](concluido/SPEC-013-trello.md) | integracao | 3 | — |
| SPEC-014 | [ClickUp Integration](concluido/SPEC-014-clickup.md) | integracao | 3 | — |
| SPEC-015 | [Linear Integration](concluido/SPEC-015-linear.md) | integracao | 3 | — |
| SPEC-016 | [Asana + Monday.com](concluido/SPEC-016-asana-monday.md) | integracao | 3 | — |
| SPEC-017 | [Password Security (bcrypt)](concluido/SPEC-017-password-security.md) | infraestrutura | 2 | Sim |
| SPEC-019 | [Consolidation Migration](concluido/SPEC-019-consolidation-migration.md) | infraestrutura | 3 | Sim |
| SPEC-031 | [GitHub OAuth Integration](concluido/SPEC-031-github-oauth.md) | integracao | 5 | Sim |
| SPEC-032 | [Production Hardening](concluido/SPEC-032-production-hardening.md) | infraestrutura | 5 | Sim |
| SPEC-033 | [Dashboard & UI Overhaul (OKLCH)](concluido/SPEC-033-dashboard-ui-overhaul.md) | ux | 8 | Sim |
| SPEC-034 | [Landing Page & Auth Flows](concluido/SPEC-034-landing-page-auth.md) | ux | 5 | Sim |
| SPEC-035 | [VPS Migration & Deployment](concluido/SPEC-035-vps-migration.md) | infraestrutura | 5 | Sim |
| SPEC-036 | [Settings APIs](concluido/SPEC-036-settings-apis.md) | plataforma | 5 | Sim |
| SPEC-037 | [Client Management (Fix Rapido)](concluido/SPEC-037-client-management.md) | plataforma | 2 | Sim |
| SPEC-051 | [Project Creation Completo](concluido/SPEC-051-project-creation-complete.md) | plataforma | 5 | Sim |
| SPEC-018 | [Auth Guards](concluido/SPEC-018-auth-guards.md) | infraestrutura | 5 | Sim |
| SPEC-023 | [Token Encryption at Rest](concluido/SPEC-023-token-encryption.md) | infraestrutura | 3 | — |

---

## Em Andamento (0)

_Nenhuma spec em andamento._

---

## A Fazer — Essencial (4) — 15 pts

| ID | Spec | Categoria | Pts | MVP | O que falta |
|----|------|-----------|-----|-----|-------------|
| SPEC-038 | [Convite de Membros](a-fazer/essencial/SPEC-038-team-invites.md) | plataforma | 5 | Sim | Model, API, UI, email |
| SPEC-039 | [Email Transacional](a-fazer/essencial/SPEC-039-transactional-email.md) | infraestrutura | 5 | Sim | Resend, templates, fila |
| SPEC-040 | [Perfil de Usuario](a-fazer/essencial/SPEC-040-user-profile.md) | ux | 3 | Sim | Avatar, cargo, timezone |
| SPEC-041 | [Termos e Privacidade](a-fazer/essencial/SPEC-041-terms-privacy.md) | plataforma | 2 | Sim | Paginas legais, aceite |

## A Fazer — Importante (8) — 63 pts

| ID | Spec | Categoria | Pts | O que falta |
|----|------|-----------|-----|-------------|
| SPEC-020 | [Onboarding para Todas as Fontes](a-fazer/importante/SPEC-020-onboarding-all-sources.md) | ux | 5 | Wizard so suporta Jira/Azure |
| SPEC-021 | [Settings com Todas as Integracoes](a-fazer/importante/SPEC-021-settings-full-config.md) | ux | 5 | Forms de Teams, Tempo, Clockify |
| SPEC-022 | [Test Foundation (Vitest)](a-fazer/importante/SPEC-022-test-foundation.md) | infraestrutura | 5 | Zero testes no codebase |
| SPEC-042 | [Client Management Completo](a-fazer/importante/SPEC-042-client-crud.md) | plataforma | 8 | Model, CRUD, filtros |
| SPEC-043 | [Exportacao de Dados](a-fazer/importante/SPEC-043-data-export.md) | plataforma | 5 | CSV/PDF export |
| SPEC-044 | [Notificacoes In-App](a-fazer/importante/SPEC-044-in-app-notifications.md) | ux | 8 | Central, sino, alertas |
| SPEC-045 | [Pagina de Precos](a-fazer/importante/SPEC-045-pricing-page.md) | ux | 3 | Pricing page publica |
| SPEC-046 | [Google OAuth](a-fazer/importante/SPEC-046-google-oauth.md) | plataforma | 3 | Login social Google |

## A Fazer — Crescimento (5) — 60 pts

| ID | Spec | Categoria | Pts | O que falta |
|----|------|-----------|-----|-------------|
| SPEC-024→030 | [Security & LGPD Pack](a-fazer/crescimento/SPEC-023-to-030-security-lgpd.md) | infraestrutura | 18 | 7 specs seguranca/LGPD restantes |
| SPEC-047 | [Backup & Recovery](a-fazer/crescimento/SPEC-047-backup-recovery.md) | infraestrutura | 5 | pg_dump, S3, restore |
| SPEC-048 | [API Publica](a-fazer/crescimento/SPEC-048-public-api.md) | plataforma | 13 | REST API, docs, rate limit |
| SPEC-049 | [Admin Panel](a-fazer/crescimento/SPEC-049-admin-panel.md) | plataforma | 13 | Painel admin interno |
| SPEC-050 | [Relatorios Avancados](a-fazer/crescimento/SPEC-050-advanced-reports.md) | plataforma | 8 | PDF, agendamento, email |

---

## Estatisticas

| Status | Quantidade | Pontos |
|--------|-----------|--------|
| Concluido | 29 | 141 |
| A Fazer (Essencial) | 4 | 15 |
| A Fazer (Importante) | 8 | 63 |
| A Fazer (Crescimento) | 5 | 57 |
| **Total** | **45** | **255** (sem contar SPEC-023-030 como 8 specs individuais) |

---

## Pontuacao por Prioridade

| Fase | Concluido | Pendente | Total | Progresso |
|------|-----------|----------|-------|-----------|
| MVP (essencial) | 105 pts | 15 pts | 120 pts | 87.5% |
| Importante | 0 pts | 63 pts | 63 pts | 0% |
| Crescimento | 36 pts | 57 pts | 93 pts | 38.7% |

> **Nota:** Integracoes nao-MVP (Slack, Azure, GitLab, etc.) somam 33 pts no crescimento ja concluido.

---

## Arquivos Historicos

Os specs originais (formato antigo) estao preservados em `specs/_archive/`.

---

*Ultima atualizacao: 2026-05-03*
