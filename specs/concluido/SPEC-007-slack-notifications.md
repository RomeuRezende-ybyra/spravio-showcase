---
id: SPEC-007
title: "Slack Notifications"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-04-01"
---

# Slack Notifications

## Resumo
Notificacoes via Slack webhook por projeto com configuracao de tipos de alerta (sprint health, stale PRs, budget).

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Slack Integration** (`apps/api/src/integrations/slack/`): Webhook client
- **Slack Config Module** (`apps/api/src/modules/slack-config/`): Config por projeto
- **Alert Detector** (`apps/api/src/jobs/alertDetector.ts`): Detecao de condicoes
- **Slack Alert Job** (`apps/api/src/jobs/slackAlert.job.ts`): Envio de alertas

### Frontend
- **Slack Config** (`apps/web/src/components/slack/`): UI de configuracao

### Modelos de Dados
```prisma
model SlackConfig { projectId, webhookUrl, channel, alertTypes[], enabled }
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /projects/:projectId/slack-config | Obter config |
| PUT | /projects/:projectId/slack-config | Atualizar config |
| POST | /projects/:projectId/slack-config/test | Enviar teste |
