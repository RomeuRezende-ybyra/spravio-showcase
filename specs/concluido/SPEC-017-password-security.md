---
id: SPEC-017
title: "Password Security (bcrypt)"
status: concluido
prioridade: essencial
categoria: infraestrutura
ultima_atualizacao: "2026-04-28"
pr_referencia: "Commit 508d41e — Production Hardening batch"
---

# Password Security (bcrypt)

## Resumo
Substituicao de senhas plaintext por bcrypt hashing. Novos registros usam hash, login usa bcrypt.compare(), senhas existentes re-hashed no proximo login.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Auth Route** (`apps/api/src/modules/auth/route.ts`): bcrypt hash no registro, bcrypt.compare() no login
- **bcryptjs** dependency: JavaScript puro, sem native bindings

### Regras de Negocio
- RN-01: Cost factor 12 (~250ms por hash)
- RN-02: Deteccao automatica plaintext vs hash (prefixo `$2a$`/`$2b$`)
- RN-03: Re-hash transparente no login para senhas legacy
- RN-04: Minimo 8 caracteres

## Criterios de Aceitacao
- [x] Registro salva bcrypt hash
- [x] Login usa bcrypt.compare()
- [x] Senhas plaintext re-hashed no login
- [x] Validacao: minimo 8 caracteres
- [x] Seed data atualizado com hashes

## Dependencias
- **Spec original**: `specs/017-password-security/spec.md` (arquivo historico)
