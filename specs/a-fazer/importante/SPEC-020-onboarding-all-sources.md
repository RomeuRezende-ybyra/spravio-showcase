---
id: SPEC-020
title: "Onboarding para Todas as Fontes"
status: a-fazer
prioridade: importante
categoria: ux
ultima_atualizacao: "2026-04-04"
---

# Onboarding para Todas as Fontes

## Resumo
O wizard de onboarding suporta apenas Jira e Azure DevOps, mas o backend ja tem integracoes completas para 8 fontes (+ GitLab, Trello, ClickUp, Linear, Asana, Monday).

## Status Atual
**0% implementado.** Wizard so mostra 2 fontes.

## O que Falta Implementar
- [ ] Expandir wizard para 8 fontes PM
- [ ] UI: grid com 8 opcoes no step-connect-source
- [ ] Form: campos especificos por fonte no step-create-project
- [ ] Backend: validacao Zod aceitar todas as 8 fontes
- [ ] Backend: dispatch do sync job correto por fonte

## Criterios de Aceitacao
- [ ] Wizard mostra 8 fontes de PM
- [ ] Cada fonte tem form fields corretos
- [ ] Backend aceita e processa as 8 fontes
- [ ] Sync job dispara corretamente para cada fonte

## Dependencias
- **Spec original**: `specs/020-onboarding-all-sources/spec.md` (arquivo historico)
