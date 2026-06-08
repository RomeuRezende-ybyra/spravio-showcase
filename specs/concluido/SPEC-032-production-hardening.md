---
id: SPEC-032
title: "Production Hardening"
status: concluido
prioridade: essencial
categoria: infraestrutura
ultima_atualizacao: "2026-04-28"
pr_referencia: "Commits 508d41e → 1850bca"
---

# Production Hardening

## Resumo
Health checks, deploy scripts, env validation, GHCR package visibility, build direto na VPS.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Infraestrutura
- **Health Check** (`apps/api/src/modules/`): `/health` e `/health/detailed` endpoints
- **Deploy Workflows**: `deploy.yml`, `deploy-direct-build.yml`
- **GHCR**: Automated package visibility
- **Env Validation**: Checagem de variaveis obrigatorias no startup

### CI/CD
- **GitHub Actions**: Build → Push GHCR → SSH deploy
- **Docker**: Multi-stage builds com cache
- **Traefik**: Reverse proxy com auto-TLS

## Criterios de Aceitacao
- [x] Health check endpoints funcionais
- [x] Deploy automatico via push em main
- [x] GHCR images publicadas
- [x] Env validation no startup da API
