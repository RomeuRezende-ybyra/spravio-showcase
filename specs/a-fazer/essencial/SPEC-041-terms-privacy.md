---
id: SPEC-041
title: "Termos de Uso e Privacidade"
status: a-fazer
prioridade: essencial
categoria: plataforma
pontos: 2
mvp: true
ultima_atualizacao: "2026-05-03"
---

# Termos de Uso e Privacidade

## Resumo
Paginas publicas de Termos de Uso e Politica de Privacidade, com aceite obrigatorio no registro. Necessario para compliance basico e confianca do usuario.

## Status Atual
**0% implementado.** Nenhuma pagina legal existe.

## O que Falta Implementar
- [ ] Pagina `/terms` — Termos de Uso
- [ ] Pagina `/privacy` — Politica de Privacidade
- [ ] Checkbox de aceite no formulario de registro
- [ ] Campo `acceptedTermsAt` no model User
- [ ] Links no footer da landing page e do app

## Criterios de Aceitacao
- [ ] Paginas publicas acessiveis sem login
- [ ] Registro bloqueado sem aceite dos termos
- [ ] Data de aceite registrada no banco
- [ ] `pnpm typecheck` — 0 errors
