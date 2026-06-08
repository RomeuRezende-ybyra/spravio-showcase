---
id: SPEC-048
title: "API Publica Documentada"
status: a-fazer
prioridade: crescimento
categoria: plataforma
pontos: 13
mvp: false
ultima_atualizacao: "2026-05-03"
---

# API Publica Documentada

## Resumo
REST API publica para clientes do Spravio integrarem seus proprios sistemas. Autenticacao via API Key, rate limiting, documentacao Swagger/OpenAPI, e versionamento.

## Status Atual
**0% implementado.** API interna existe mas sem auth por API key, sem docs publicas, sem rate limiting por cliente.

## O que Falta Implementar
- [ ] Model `ApiKey` no Prisma (key, orgId, name, scopes, lastUsedAt, expiresAt)
- [ ] API CRUD para API keys em Settings
- [ ] Middleware de auth por API key (header `X-API-Key`)
- [ ] Rate limiting por API key (Redis, 1000 req/hora)
- [ ] Swagger/OpenAPI auto-gerado com `@fastify/swagger`
- [ ] Pagina publica `/docs/api` com Swagger UI
- [ ] Endpoints publicos: projects, sprints, developers, issues
- [ ] Versionamento: `/v1/...`
- [ ] Logs de uso por API key

## Criterios de Aceitacao
- [ ] Cliente gera API key em Settings
- [ ] Requests autenticados via `X-API-Key` funcionam
- [ ] Rate limiting aplicado por key
- [ ] Documentacao Swagger acessivel
- [ ] `pnpm typecheck` — 0 errors
