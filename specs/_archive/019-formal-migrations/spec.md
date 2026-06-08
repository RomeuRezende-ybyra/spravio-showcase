# Spec: Migrations Formais para Fases 10–16

> ID: 019-formal-migrations
> Status: Draft
> Autor: Claude
> Data: 2026-04-04

---

## Problema

As fases 10–16 adicionaram models e campos via `prisma db push` sem criar migrations formais. Isso significa que:
- Não há histórico rastreável das mudanças de schema
- Rollback de schema é impossível via Prisma
- Deploy em ambientes novos depende de `db push` em vez de `migrate deploy`
- Risco de drift entre ambientes (dev, staging, prod)

**Models sem migration formal:**
- `TeamsConfig` (fase 10)
- `TempoConfig` (fase 11)
- `ClockifyConfig` (fase 11)
- `DeliveryForecast` (fase 12)

**Campos adicionados sem migration:**
- `Developer`: gitlabUserId, trelloMemberId, clickupUserId, linearUserId, asanaUserId, mondayUserId
- `Project`: gitlabRepo, trelloBoardId, clickupSpaceId, linearTeamId, asanaProjectId, mondayBoardId
- `Sprint`: trelloListId, clickupSprintId, linearCycleId, asanaSectionId, mondayGroupId
- `Issue`: trelloCardId, clickupTaskId, linearIssueId, asanaTaskId, mondayItemId
- `SyncType` enum: GITLAB, TEMPO, CLOCKIFY, TRELLO, CLICKUP, LINEAR, ASANA, MONDAY
- `SprintHours.externalId`

---

## Solução Proposta

Criar uma **migration única de consolidação** (`baseline_phases_10_16`) que captura todas as mudanças de schema feitas via `db push`. Usar `prisma migrate diff` para gerar o SQL correto comparando o estado pré-fase-10 com o schema atual.

---

## Escopo

### Incluído
- Gerar migration consolidada para fases 10–16
- Validar que a migration é idempotente (não quebra DB existente)
- Documentar quais models/campos foram cobertos

### Excluído
- Refatorar schema existente (ex: Project.source → enum)
- Migrations retroativas por fase individual
- Mudanças no schema atual

---

## Requisitos

### Funcionais
1. **[RF-01]** Uma migration formal DEVE cobrir todos os models/campos das fases 10–16
2. **[RF-02]** A migration DEVE ser aplicável em DB novo (`migrate deploy` from scratch)
3. **[RF-03]** A migration DEVE ser no-op em DB existente (já tem o schema via `db push`)
4. **[RF-04]** `prisma migrate status` DEVE mostrar todas as migrations como applied

### Não-funcionais
1. **[RNF-01]** Zero downtime — migration usa `IF NOT EXISTS` onde necessário
2. **[RNF-02]** Migration DEVE ser reversível conceptualmente (documentar rollback SQL)

---

## Arquivos Impactados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `apps/api/prisma/migrations/[timestamp]_baseline_phases_10_16/migration.sql` | Criação |
| `apps/api/prisma/migrations/migration_lock.toml` | Modificação (auto) |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Migration falha em DB existente (tabelas já existem) | Usar `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` |
| Migration falha em DB novo (dependências faltando) | Testar em DB limpo com `migrate deploy` from scratch |
| Enum values já existem | Usar `DO $$ ... IF NOT EXISTS` para alterações de enum |

---

## Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] Migration file criado em `prisma/migrations/`
- [ ] `prisma migrate deploy` funciona em DB novo
- [ ] `prisma migrate deploy` é no-op em DB existente
- [ ] `prisma migrate status` sem pending migrations
- [ ] Todos os 4 models (TeamsConfig, TempoConfig, ClockifyConfig, DeliveryForecast) cobertos
- [ ] Todos os campos de integrações 10–16 cobertos

---

## Notas

- As 6 migrations existentes cobrem fases 1–9: init, github_fields, project_assignments, audit (source/budget/slack/roles), billing, azure_devops
- Approach: usar `prisma migrate diff --from-migrations --to-schema-datamodel` para gerar o SQL delta
- Em produção, pode ser necessário marcar a migration como "already applied" via `prisma migrate resolve --applied`
