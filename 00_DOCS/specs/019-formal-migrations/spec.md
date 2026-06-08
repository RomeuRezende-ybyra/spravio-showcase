# Feature Specification: Formal Migrations

> 🟠 MÉDIO: Criar migrations formais para mudanças das fases 10-16

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 019-formal-migrations |
| **Branch** | `fix/019-formal-migrations` |
| **Prioridade** | 🟠 Média |
| **Data** | 2026-04-04 |
| **Status** | Ready for Implementation |

---

## 1. Resumo

As fases 10-16 adicionaram muitos campos e models ao schema, mas foram aplicados via `prisma db push` em vez de migrations formais. Isso impede rollback e dificulta deploy em novos ambientes. Esta feature cria migrations retroativas para documentar todas as mudanças.

---

## 2. Motivação

### Problema
- **6 migrations formais** existem (fases 1-9)
- **Fases 10-16** usaram `db push` — sem histórico
- Novos desenvolvedores não conseguem recriar o banco
- Impossível fazer rollback de mudanças específicas
- CI/CD quebrado se depender de migrations

### Impacto
- **Onboarding** difícil para novos devs
- **Disaster recovery** comprometido
- **Auditoria** incompleta de mudanças

### Métricas de Sucesso
- [ ] Todas mudanças de schema documentadas em migrations
- [ ] `prisma migrate deploy` funciona em banco limpo
- [ ] `prisma migrate reset` recria banco completo
- [ ] Histórico de migrations reflete ordem real das mudanças

---

## 3. Análise de Mudanças

### Fase 10 — GitLab + Teams
```prisma
// Novos campos em Project
gitlabProjectId  String?

// Novos campos em Developer  
gitlabUserId     String?

// Novos campos em Issue
gitlabMRNumber   Int?

// Novo model
model TeamsConfig {
  id         String   @id @default(cuid())
  projectId  String   @unique
  webhookUrl String
  alertTypes String[]
  isActive   Boolean  @default(true)
}

// Novo enum value
SyncType: + GITLAB
```

### Fase 11 — Tempo + Clockify
```prisma
// Novos campos em SprintHours
externalId String?
source     String   // "manual" | "tempo" | "clockify"

// Novos models
model TempoConfig {
  id         String    @id @default(cuid())
  projectId  String    @unique
  apiToken   String
  lastSyncAt DateTime?
}

model ClockifyConfig {
  id          String    @id @default(cuid())
  projectId   String    @unique
  apiKey      String
  workspaceId String
  lastSyncAt  DateTime?
}

// Novos enum values
SyncType: + TEMPO, + CLOCKIFY
```

### Fase 12 — AI Forecast
```prisma
// Novo model
model DeliveryForecast {
  id                String   @id @default(cuid())
  projectId         String
  sprintId          String?
  onTimeProbability Float
  predictedEndDate  DateTime?
  confidence        String   // "low" | "medium" | "high"
  reasoning         String
  createdAt         DateTime @default(now())
}
```

### Fase 13 — Trello
```prisma
// Novos campos
Project.trelloBoardId    String?
Sprint.trelloListId      String?
Issue.trelloCardId       String?
Developer.trelloMemberId String?

// Novo enum value
SyncType: + TRELLO
```

### Fase 14 — ClickUp
```prisma
// Novos campos
Project.clickupSpaceId   String?
Sprint.clickupSprintId   String?
Issue.clickupTaskId      String?
Developer.clickupUserId  String?

// Novo enum value
SyncType: + CLICKUP
```

### Fase 15 — Linear
```prisma
// Novos campos
Project.linearTeamId     String?
Sprint.linearCycleId     String?
Issue.linearIssueId      String?
Developer.linearUserId   String?

// Novo enum value
SyncType: + LINEAR
```

### Fase 16 — Asana + Monday
```prisma
// Asana
Project.asanaProjectId   String?
Sprint.asanaSectionId    String?
Issue.asanaTaskId        String?
Developer.asanaUserId    String?

// Monday
Project.mondayBoardId    String?
Sprint.mondayGroupId     String?
Issue.mondayItemId       String?
Developer.mondayUserId   String?

// Novos enum values
SyncType: + ASANA, + MONDAY
```

---

## 4. Estratégia de Migration

### Opção A: Migration Única (Recomendada)
Uma migration que captura todo o estado atual:
```bash
prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
```

**Pros**: Simples, funciona  
**Cons**: Não reflete histórico real

### Opção B: Migrations Retroativas
Criar uma migration por fase (10-16):
```
20260404000001_phase_10_gitlab_teams
20260404000002_phase_11_tempo_clockify
20260404000003_phase_12_ai_forecast
20260404000004_phase_13_trello
20260404000005_phase_14_clickup
20260404000006_phase_15_linear
20260404000007_phase_16_asana_monday
```

**Pros**: Histórico claro  
**Cons**: Mais complexo, pode ter conflitos

### Decisão
**Opção A** — Uma migration consolidada é mais segura para produção já em execução.

---

## 5. Implementação

### Passo 1: Baseline Migration
```bash
# Marcar estado atual como baseline
prisma migrate resolve --applied "20260404000000_baseline_phases_10_16"
```

### Passo 2: Criar Migration File
```sql
-- prisma/migrations/20260404000000_baseline_phases_10_16/migration.sql

-- Phase 10: GitLab + Teams
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "gitlabProjectId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "gitlabUserId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "gitlabMRNumber" INTEGER;

CREATE TABLE IF NOT EXISTS "TeamsConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "alertTypes" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "TeamsConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TeamsConfig_projectId_key" ON "TeamsConfig"("projectId");

-- Phase 11: Tempo + Clockify
ALTER TABLE "SprintHours" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE "SprintHours" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'manual';

CREATE TABLE IF NOT EXISTS "TempoConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    CONSTRAINT "TempoConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TempoConfig_projectId_key" ON "TempoConfig"("projectId");

CREATE TABLE IF NOT EXISTS "ClockifyConfig" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    CONSTRAINT "ClockifyConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ClockifyConfig_projectId_key" ON "ClockifyConfig"("projectId");

-- Phase 12: AI Forecast
CREATE TABLE IF NOT EXISTS "DeliveryForecast" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sprintId" TEXT,
    "onTimeProbability" DOUBLE PRECISION NOT NULL,
    "predictedEndDate" TIMESTAMP(3),
    "confidence" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryForecast_pkey" PRIMARY KEY ("id")
);

-- Phase 13: Trello
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "trelloBoardId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "trelloListId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "trelloCardId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "trelloMemberId" TEXT;

-- Phase 14: ClickUp
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "clickupSpaceId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "clickupSprintId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "clickupTaskId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "clickupUserId" TEXT;

-- Phase 15: Linear
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "linearTeamId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "linearCycleId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "linearIssueId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "linearUserId" TEXT;

-- Phase 16: Asana + Monday
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "asanaProjectId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "asanaSectionId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "asanaTaskId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "asanaUserId" TEXT;

ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "mondayBoardId" TEXT;
ALTER TABLE "Sprint" ADD COLUMN IF NOT EXISTS "mondayGroupId" TEXT;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "mondayItemId" TEXT;
ALTER TABLE "Developer" ADD COLUMN IF NOT EXISTS "mondayUserId" TEXT;
```

### Passo 3: Atualizar _prisma_migrations
```bash
# Em produção, marcar como já aplicada
prisma migrate resolve --applied "20260404000000_baseline_phases_10_16"
```

---

## 6. Verificação

```bash
# 1. Verificar migrations listadas
pnpm --filter api prisma migrate status

# 2. Testar em banco limpo
docker-compose down -v
docker-compose up -d postgres
pnpm --filter api prisma migrate deploy

# 3. Verificar schema
pnpm --filter api prisma db pull --print
```

---

## 7. Rollback Plan

Se algo der errado:
1. A migration usa `IF NOT EXISTS` — idempotente
2. Dados existentes não são afetados
3. Pode rodar múltiplas vezes sem erro

---

## 8. Definition of Done

- [ ] Migration file criado em `prisma/migrations/`
- [ ] `prisma migrate status` mostra todas migrations aplicadas
- [ ] `prisma migrate deploy` funciona em banco limpo
- [ ] Schema gerado corresponde ao schema.prisma
- [ ] CLAUDE.md atualizado

---

## 9. Estimativa

| Fase | Tempo |
|------|-------|
| Analisar diff atual vs migrations | 30min |
| Criar migration SQL | 1h |
| Testar em banco limpo | 30min |
| Aplicar em produção | 15min |
| **Total** | ~2.5h |
