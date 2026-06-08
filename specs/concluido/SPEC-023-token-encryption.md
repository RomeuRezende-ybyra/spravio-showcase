---
id: SPEC-023
title: "Token Encryption at Rest (AES-256-GCM)"
status: concluido
prioridade: crescimento
categoria: infraestrutura
pontos: 3
mvp: false
ultima_atualizacao: "2026-05-03"
---

# Token Encryption at Rest (AES-256-GCM)

## Resumo

Completar a cobertura de criptografia em repouso para todos os tokens e credenciais sensíveis armazenados no banco. A infraestrutura AES-256-GCM ja existia (`secureToken`/`readToken`), mas alguns tokens ainda estavam em plaintext.

## Status Atual

**100% implementado.** Todos os tokens e credenciais sensíveis agora são criptografados antes de gravar no banco.

## O que ja estava criptografado (antes desta spec)

- OrganizationSettings: `jiraApiToken`, `azurePersonalAccessToken`, `githubToken`
- TempoConfig: `apiToken`
- ClockifyConfig: `apiKey`
- GitHubWebhookConfig: `webhookSecret`

## O que foi criptografado nesta spec

- [x] `Account.access_token` (OAuth GitHub) — 2 locais de escrita
- [x] `SlackConfig.webhookUrl` — encrypt na escrita, decrypt na leitura
- [x] `TeamsConfig.webhookUrl` — encrypt na escrita, decrypt na leitura
- [x] `NotificationChannel.slackWebhookUrl` — encrypt na escrita, decrypt na leitura
- [x] `pnpm typecheck` — 0 errors

## Retrocompatibilidade

`readToken()` detecta automaticamente se o valor e criptografado ou plaintext. Tokens existentes em plaintext continuam funcionando e serao criptografados na proxima atualizacao.

## Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `apps/api/src/modules/auth/route.ts` | `secureToken(accessToken)` nos 2 `account.create` |
| `apps/api/src/modules/slack-config/repository.ts` | Encrypt/decrypt `webhookUrl` |
| `apps/api/src/modules/teams-config/repository.ts` | Encrypt/decrypt `webhookUrl` |
| `apps/api/src/routes/notifications.ts` | Encrypt/decrypt `slackWebhookUrl` |

## Criterios de Aceitacao

- [x] Todos os tokens criptografados com AES-256-GCM antes de salvar no DB
- [x] Leitura transparente com retrocompatibilidade para plaintext
- [x] `pnpm typecheck` — 0 errors
