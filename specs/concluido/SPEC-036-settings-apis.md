---
id: SPEC-036
title: "Settings APIs"
status: concluido
prioridade: essencial
categoria: plataforma
ultima_atualizacao: "2026-04-30"
pr_referencia: "Commits 82d531d → 6c15b93"
---

# Settings APIs

## Resumo
APIs e frontend para configuracoes organizacionais: notifications, security (sessions + audit log), webhooks com delivery tracking, API keys com geracao segura.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend (via Organization Settings endpoints)
- **Notification Settings**: Preferencias por evento (email/slack/in-app)
- **Security**: Sessions ativas, audit log
- **Webhooks**: CRUD + delivery log com status e response time
- **API Keys**: Geracao segura, hash, scopes, expiry

### Frontend
- **Notifications** (`apps/web/src/app/(dashboard)/settings/notifications/`)
- **Security** (`apps/web/src/app/(dashboard)/settings/security/`)
- **Webhooks** (`apps/web/src/app/(dashboard)/settings/webhooks/`)
- **API Keys** (`apps/web/src/app/(dashboard)/settings/api/`)

### Modelos de Dados
```prisma
model NotificationSetting { userId, event, emailEnabled, slackEnabled, inAppEnabled }
model NotificationChannel { userId, type, destination }
model Session { userId, token, device, ipAddress, location, lastActiveAt }
model AuditLog { userId, orgId, action, details, ipAddress }
model Webhook { orgId, url, events[], secret, active }
model WebhookDelivery { webhookId, event, payload, statusCode, responseTime }
model ApiKey { orgId, name, prefix, hash, scopes[], expiresAt }
```

## Criterios de Aceitacao
- [x] Notification settings per event
- [x] Session management (list, revoke)
- [x] Audit log funcional
- [x] Webhook CRUD + delivery tracking
- [x] API key generation + management
