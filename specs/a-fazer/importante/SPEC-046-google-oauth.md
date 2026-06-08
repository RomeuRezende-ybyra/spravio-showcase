---
id: SPEC-046
title: "Google OAuth Login"
status: a-fazer
prioridade: importante
categoria: plataforma
pontos: 3
mvp: false
ultima_atualizacao: "2026-05-03"
---

# Google OAuth Login

## Resumo
Login social via Google OAuth 2.0. Complementa o login via email/senha e GitHub OAuth (SPEC-031). Google e o provider mais esperado por usuarios corporativos.

## Status Atual
**0% implementado.** NextAuth ja suporta providers, mas Google nao esta configurado.

## O que Falta Implementar
- [ ] Adicionar Google provider no NextAuth config
- [ ] Variaveis `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- [ ] Linking de conta Google a usuario existente (via Account table)
- [ ] Botao "Continue with Google" na pagina de login/registro
- [ ] Tratamento de conflito de email (conta ja existe com outro provider)

## Criterios de Aceitacao
- [ ] Login via Google funcional
- [ ] Conta Google linkada ao usuario
- [ ] Conflito de email tratado com mensagem clara
- [ ] `pnpm typecheck` — 0 errors
