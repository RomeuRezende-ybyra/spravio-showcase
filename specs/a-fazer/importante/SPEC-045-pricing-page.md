---
id: SPEC-045
title: "Pagina de Precos"
status: a-fazer
prioridade: importante
categoria: ux
pontos: 3
mvp: false
ultima_atualizacao: "2026-05-03"
---

# Pagina de Precos

## Resumo
Pagina publica `/pricing` com planos, comparacao de features, toggle mensal/anual e CTAs para checkout. Necessaria para conversao de visitantes em clientes.

## Status Atual
**0% implementado.** Landing page existe (SPEC-034) mas sem pagina de precos dedicada.

## O que Falta Implementar
- [ ] Pagina `/pricing` com design OKLCH
- [ ] Cards de planos (Free, Pro, Enterprise) com precos e features
- [ ] Toggle mensal/anual com desconto
- [ ] CTA "Start Free Trial" / "Contact Sales"
- [ ] FAQ de billing
- [ ] Link no header da landing page

## Criterios de Aceitacao
- [ ] Pagina publica responsiva
- [ ] Planos refletem configuracao do Stripe
- [ ] CTAs redirecionam para registro ou checkout
- [ ] `pnpm typecheck` — 0 errors
