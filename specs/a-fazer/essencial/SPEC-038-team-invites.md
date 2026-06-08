---
id: SPEC-038
title: "Convite de Membros"
status: a-fazer
prioridade: essencial
categoria: plataforma
pontos: 5
mvp: true
ultima_atualizacao: "2026-05-03"
---

# Convite de Membros

## Resumo
Permitir que o owner/admin da organizacao convide novos membros via email. O convidado recebe um link, cria conta (ou loga) e e associado a org com o role escolhido.

## Status Atual
**0% implementado.** Usuarios so entram via registro manual, sem vinculo a org existente.

## O que Falta Implementar
- [ ] Model `Invitation` no Prisma (email, orgId, role, token, expiresAt, status)
- [ ] API POST `/organizations/:orgId/invitations` — criar convite
- [ ] API GET `/invitations/:token` — validar convite
- [ ] API POST `/invitations/:token/accept` — aceitar convite
- [ ] Envio de email com link de convite (depende de SPEC-039)
- [ ] UI: tela de convite em Settings > Members
- [ ] UI: pagina `/invite/:token` para aceitar convite
- [ ] Listar convites pendentes com opcao de reenviar/cancelar

## Criterios de Aceitacao
- [ ] Admin consegue convidar membro por email
- [ ] Convidado recebe email com link
- [ ] Ao aceitar, usuario e associado a org com role correto
- [ ] Convites expiram apos 7 dias
- [ ] `pnpm typecheck` — 0 errors

## Dependencias
- **Depende de**: SPEC-039 (Email Transacional)
