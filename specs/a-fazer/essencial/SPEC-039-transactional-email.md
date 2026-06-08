---
id: SPEC-039
title: "Email Transacional"
status: a-fazer
prioridade: essencial
categoria: infraestrutura
pontos: 5
mvp: true
ultima_atualizacao: "2026-05-03"
---

# Email Transacional

## Resumo
Infraestrutura para envio de emails transacionais (convites, alertas, confirmacoes). Usar Resend como provider com templates HTML.

## Status Atual
**0% implementado.** Apenas password reset via NextAuth (sem template proprio).

## O que Falta Implementar
- [ ] Integrar Resend SDK no backend (`@spravio/api`)
- [ ] Criar servico `EmailService` com metodos: `sendInvite`, `sendAlert`, `sendPasswordReset`
- [ ] Templates HTML para: convite, alerta de projeto, boas-vindas
- [ ] Variavel de ambiente `RESEND_API_KEY`
- [ ] Fila BullMQ para envio assincrono (job `send-email`)
- [ ] Logs de envio (sucesso/falha) no banco

## Criterios de Aceitacao
- [ ] Email de convite enviado com sucesso via Resend
- [ ] Templates responsivos com branding Spravio
- [ ] Falhas de envio logadas e retentaveis
- [ ] `pnpm typecheck` — 0 errors

## Dependencias
- **Bloqueia**: SPEC-038 (Convite de Membros)
