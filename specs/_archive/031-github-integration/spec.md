# 031 — GitHub OAuth Integration

> **Status:** ✅ Implementado (retroativo)
> **Commit:** `c658813`
> **Data:** 2026-05-02

---

## Problema

O Spravio precisa se conectar aos repositórios GitHub das organizações para:

1. Sincronizar pull requests e mapear para issues do Jira
2. Calcular métricas de developer (merge rate, cycle time, review contribution)
3. Receber eventos em tempo real via webhooks (push, pull_request)
4. Permitir login via GitHub OAuth (onboarding simplificado)

Sem essa integração, o tracking de atividade de código depende de input manual.

---

## Solução

Integração completa com GitHub em 4 camadas:

### 1. User Authentication (OAuth Login)
- Login/registro via GitHub OAuth
- Account linking para usuários existentes
- Token armazenado na tabela `Account`

### 2. Organization Connection
- Owner conecta organização ao GitHub via access token
- Token criptografado em `OrganizationSettings.githubToken`
- Auto-registro de webhook na organização GitHub

### 3. Project Linking
- Cada projeto pode ser vinculado a um repositório GitHub
- Repo selector com busca (lista repos acessíveis pelo token da org)
- Campo `Project.githubRepo` (formato: `owner/repo`)

### 4. Data Sync & Webhooks
- Background job (`sync-github`) para sync periódico de PRs, reviews, stats
- Webhook receiver para updates em tempo real (PR status)
- Mapeamento automático PR → Issue via extração de Jira keys

---

## Escopo

### In Scope
- GitHub OAuth login e account linking
- Org-level token management (connect/disconnect/status)
- Webhook auto-registration (push, pull_request)
- Webhook receiver com HMAC-SHA256 verification
- PR status sync (OPEN/MERGED/CLOSED) via webhooks
- Project-level repo linking
- Background sync job (PRs, reviews, contributor stats)
- Developer metrics calculation
- Jira key extraction de PR title/branch/body
- Frontend: repo selector, onboarding step, status display

### Out of Scope
- GitHub Actions integration
- Commit-level tracking (apenas PRs)
- GitHub Issues sync (Spravio usa Jira/Azure/etc como PM)
- GitHub Projects/Boards
- Fine-grained PATs (usa classic OAuth tokens)

---

## Requisitos

### Funcionais
1. Usuário pode fazer login/registro via GitHub OAuth
2. Owner pode conectar organização ao GitHub (1 token por org)
3. Webhook é registrado automaticamente ao conectar
4. PRs são sincronizados com status correto (OPEN/MERGED/CLOSED)
5. Issues do Jira são linkadas automaticamente via PR title/branch
6. Developer metrics são calculados a partir de dados do GitHub
7. Owner pode desconectar organização (limpa token + webhook config)

### Não-Funcionais
1. Tokens criptografados at rest (`secureToken()`)
2. Webhook verification com timing-safe comparison
3. Rate limiting respeitando limites da GitHub API
4. Redis cache com TTL 5min para dados do GitHub
5. Tenant isolation em todas as queries

---

## Modelo de Dados

### Novos Models
- `GitHubWebhookConfig` — Configuração de webhook por org (secret, events, active)
- `GitHubWebhookEvent` — Log de eventos recebidos (idempotência via deliveryId)

### Fields Adicionados
- `OrganizationSettings.githubOrg` — Login da org no GitHub
- `OrganizationSettings.githubToken` — Token criptografado
- `Project.githubRepo` — Repo vinculado (formato `owner/repo`)
- `Issue.linkedPRNumber` — Número do PR linkado
- `Issue.linkedPRStatus` — Status do PR (OPEN/MERGED/CLOSED)

---

## Referências

- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [GitHub REST API](https://docs.github.com/en/rest)
