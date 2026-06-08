---
id: SPEC-010
title: "GitLab + Microsoft Teams"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# GitLab + Microsoft Teams

## Resumo
Integracao com GitLab (repos, MRs, developers) e Microsoft Teams (webhook notifications).

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **GitLab Integration** (`apps/api/src/integrations/gitlab/`): client, endpoints, mappers, types
- **GitLab Sync Job** (`apps/api/src/jobs/syncGitlab.job.ts`)
- **Teams Integration** (`apps/api/src/integrations/teams/`): Webhook client
- **Teams Config Module** (`apps/api/src/modules/teams-config/`)
- **Teams Alert Job** (`apps/api/src/jobs/teamsAlert.job.ts`)

### Modelos de Dados
```prisma
model Developer { gitlabId, gitlabUsername }
model TeamsConfig { projectId, webhookUrl, alertTypes[], enabled }
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /projects/:projectId/teams-config | Obter config |
| PUT | /projects/:projectId/teams-config | Atualizar config |
| DELETE | /projects/:projectId/teams-config | Remover config |
| POST | /projects/:projectId/teams-config/test | Enviar teste |
