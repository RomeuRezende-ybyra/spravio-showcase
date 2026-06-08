---
id: SPEC-021
title: "Settings com Todas as Integracoes"
status: a-fazer
prioridade: importante
categoria: ux
ultima_atualizacao: "2026-04-04"
---

# Settings com Todas as Integracoes

## Resumo
Pagina de Settings do projeto so mostra Slack. Teams, Tempo e Clockify tem endpoints no backend mas nao tem UI.

## Status Atual
**25% implementado.** Slack form existe, faltam 3 forms.

## O que Ja Existe
- Slack settings form (`components/slack/slack-settings-form.tsx`)
- API endpoints para Teams (4), Tempo (5), Clockify (5)

## O que Falta Implementar
- [ ] Criar `teams-settings-form.tsx`
- [ ] Criar `tempo-settings-form.tsx`
- [ ] Criar `clockify-settings-form.tsx`
- [ ] Reestruturar settings page com tabs
- [ ] Adicionar metodos ao API client (teams, tempo, clockify)
- [ ] Criar `loading.tsx` + `error.tsx`

## Criterios de Aceitacao
- [ ] Settings page com 4 tabs funcionais
- [ ] Teams form: GET, PUT, DELETE, test
- [ ] Tempo form: GET, PUT, DELETE, test, sync
- [ ] Clockify form: GET, PUT, DELETE, test, sync
- [ ] `loading.tsx` + `error.tsx` presentes

## Dependencias
- **Spec original**: `specs/021-settings-full-config/spec.md` (arquivo historico)
