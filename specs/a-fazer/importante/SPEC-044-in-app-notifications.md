---
id: SPEC-044
title: "Notificacoes In-App"
status: a-fazer
prioridade: importante
categoria: ux
pontos: 8
mvp: false
ultima_atualizacao: "2026-05-03"
---

# Notificacoes In-App

## Resumo
Central de notificacoes dentro da aplicacao: icone de sino com contador, lista de notificacoes lidas/nao lidas, alertas de sprint, deploy, PR, budget.

## Status Atual
**0% implementado.** Alertas existem apenas via Slack (SPEC-007). Nenhuma notificacao dentro do app.

## O que Falta Implementar
- [ ] Model `Notification` no Prisma (userId, type, title, body, readAt, metadata, createdAt)
- [ ] API GET `/notifications` — listar (paginado)
- [ ] API PUT `/notifications/:id/read` — marcar como lida
- [ ] API PUT `/notifications/read-all` — marcar todas como lidas
- [ ] API GET `/notifications/unread-count` — contador
- [ ] Servico `NotificationService` — criar notificacoes a partir de eventos
- [ ] Icone de sino no topbar com badge de contador
- [ ] Dropdown/painel de notificacoes
- [ ] Tipos: sprint_completed, pr_stale, budget_warning, sync_failed, invite_received

## Criterios de Aceitacao
- [ ] Sino no topbar mostra contador de nao lidas
- [ ] Painel lista notificacoes com scroll
- [ ] Marcar como lida individual e em lote
- [ ] Novas notificacoes geradas automaticamente por eventos
- [ ] `pnpm typecheck` — 0 errors
