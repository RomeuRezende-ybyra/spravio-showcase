---
id: SPEC-034
title: "Landing Page & Auth Flows"
status: concluido
prioridade: essencial
categoria: ux
ultima_atualizacao: "2026-04-15"
pr_referencia: "Commits d026e79 → 880aded"
---

# Landing Page & Auth Flows

## Resumo
Landing page completa (responsive, animada), suporte multilingual (EN/PT), fluxo de password reset com verificacao por email.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Frontend
- **Landing Page** (`apps/web/src/app/page.tsx`): Hero, features, pricing, integrations strip
- **Landing Components** (`apps/web/src/components/landing/`)
- **Login** (`apps/web/src/app/(auth)/login/`): Email/password + GitHub OAuth
- **Register** (`apps/web/src/app/(auth)/register/`)
- **Forgot Password** (`apps/web/src/app/(auth)/forgot-password/`)
- **Verify Code** (`apps/web/src/app/(auth)/verify-code/`): 6-digit code
- **Reset Password** (`apps/web/src/app/(auth)/reset-password/`)

### Backend
- **Auth Routes**: POST /auth/forgot-password, /auth/verify-reset-code, /auth/reset-password

### i18n
- Multilingual support (EN/PT)

## Criterios de Aceitacao
- [x] Landing page responsiva
- [x] Animacoes funcionais
- [x] Password reset flow completo
- [x] Multilingual EN/PT
