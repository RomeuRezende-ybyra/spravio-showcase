---
id: SPEC-031
title: "GitHub OAuth Integration"
status: concluido
prioridade: essencial
categoria: integracao
ultima_atualizacao: "2026-05-02"
pr_referencia: "Commit c658813 — feat(github): full GitHub OAuth integration with webhooks"
---

# GitHub OAuth Integration

## Resumo
Integracao completa com GitHub: OAuth login, org-level token management, webhook auto-registration, PR status sync em tempo real, developer metrics.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Auth OAuth** (`apps/api/src/modules/auth/route.ts`): GitHub OAuth login + account linking
- **Org GitHub** (`apps/api/src/modules/organizations/route.ts`): connect/disconnect/status
- **Webhook Receiver** (`apps/api/src/modules/github-webhook/route.ts`): HMAC-SHA256 verification
- **Sync Job** (`apps/api/src/jobs/syncGithub.job.ts`): PRs, reviews, contributor stats

### Frontend
- **Login Page**: "Sign in with GitHub" button
- **Onboarding**: GitHub connection step
- **Settings**: GitHub org status, connect/disconnect
- **Repo Selector**: Search + link repos to projects

### Modelos de Dados
```prisma
model Account { userId, provider, providerAccountId, accessToken, refreshToken }
model GitHubWebhookConfig { orgId, webhookId, webhookSecret, active }
model GitHubWebhookEvent { configId, deliveryId, event, action, payload, processed }
```

### Security
- Tokens encrypted via `secureToken()`/`readToken()`
- Webhook HMAC-SHA256 timing-safe verification
- Tenant isolation on all GitHub queries

## Criterios de Aceitacao
- [x] GitHub OAuth login funcional
- [x] Account linking para usuarios existentes
- [x] Org connect/disconnect com token criptografado
- [x] Webhook auto-registration
- [x] PR status sync via webhooks
- [x] Project-level repo linking
- [x] Developer metrics (merge rate, cycle time, review contribution)
- [x] Jira key extraction de PR title/branch/body

## Dependencias
- **Expande**: SPEC-004 (GitHub Basic)
- **Spec original**: `specs/031-github-integration/` (arquivos historicos)
