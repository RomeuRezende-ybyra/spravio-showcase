---
id: SPEC-040
title: "Perfil de Usuario Completo"
status: a-fazer
prioridade: essencial
categoria: ux
pontos: 3
mvp: true
ultima_atualizacao: "2026-05-03"
---

# Perfil de Usuario Completo

## Resumo
Expandir o perfil do usuario com avatar upload, cargo, telefone, timezone e preferencias de notificacao. Hoje o perfil so tem nome e email.

## Status Atual
**20% implementado.** Existe pagina de profile basica mas sem campos extras nem upload de avatar.

## O que Falta Implementar
- [ ] Campos no model User: `phone`, `jobTitle`, `timezone`, `locale`
- [ ] API PUT `/users/me/profile` — atualizar perfil
- [ ] Upload de avatar (S3 ou local storage) com resize
- [ ] UI: formulario completo em `/settings/profile`
- [ ] Seletor de timezone e idioma (PT/EN)

## Criterios de Aceitacao
- [ ] Usuario atualiza avatar, cargo, telefone e timezone
- [ ] Avatar exibido no sidebar e topbar
- [ ] Timezone afeta exibicao de datas
- [ ] `pnpm typecheck` — 0 errors
