---
id: SPEC-006
title: "SaaS Features (Stripe & Portal)"
status: concluido
prioridade: essencial
categoria: plataforma
ultima_atualizacao: "2026-04-01"
---

# SaaS Features (Stripe & Portal)

## Resumo
Billing via Stripe (checkout, portal, subscription management) e portal publico de projeto com token de acesso.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Billing Module** (`apps/api/src/modules/billing/`): Stripe checkout, portal, webhooks
- **Portal Module** (`apps/api/src/modules/portal/`): Token-based public access

### Frontend
- **Billing Page** (`apps/web/src/app/(dashboard)/settings/billing/`)
- **Portal Components** (`apps/web/src/components/portal/`)

### Modelos de Dados
```prisma
model Organization { stripeCustomerId, subscriptionStatus, planId, trialEndsAt }
enum SubscriptionStatus { TRIALING, ACTIVE, PAST_DUE, CANCELLED }
enum PlanId { starter, growth, scale }
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | /billing/checkout | Criar sessao Stripe |
| POST | /billing/portal | Abrir portal Stripe |
| GET | /billing/subscription | Status da subscription |
| POST | /billing/webhook | Webhook do Stripe |
| POST | /projects/:projectId/portal-token | Gerar token do portal |
| GET | /portal/:token | Acessar portal publico |

## Criterios de Aceitacao
- [x] Checkout Stripe funcional
- [x] Portal de billing Stripe
- [x] Webhook de subscription status
- [x] Portal publico com token
