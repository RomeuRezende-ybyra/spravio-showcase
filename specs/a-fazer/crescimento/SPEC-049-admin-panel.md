---
id: SPEC-049
title: "Admin Panel Interno"
status: a-fazer
prioridade: crescimento
categoria: plataforma
pontos: 13
mvp: false
ultima_atualizacao: "2026-05-03"
---

# Admin Panel Interno

## Resumo
Painel administrativo para operadores do Spravio (nos). Listar organizacoes, usuarios, planos, MRR, impersonation com auditoria. Essencial para suporte e gestao do negocio.

## Status Atual
**0% implementado.** Gestao de clientes e feita diretamente no banco.

## O que Falta Implementar
- [ ] Role `SUPER_ADMIN` no sistema (separado de org roles)
- [ ] Rota protegida `/admin` com layout proprio
- [ ] Dashboard admin: total orgs, usuarios, MRR, churn
- [ ] Listagem de organizacoes com filtro e busca
- [ ] Detalhes da org: plano, membros, projetos, ultimo acesso
- [ ] Impersonation (login como usuario) com log de auditoria
- [ ] Acoes: bloquear conta, alterar plano, aplicar desconto
- [ ] Logs de acoes admin

## Criterios de Aceitacao
- [ ] Acesso restrito a SUPER_ADMIN
- [ ] Dashboard com metricas SaaS
- [ ] Impersonation funcional com auditoria
- [ ] `pnpm typecheck` — 0 errors
