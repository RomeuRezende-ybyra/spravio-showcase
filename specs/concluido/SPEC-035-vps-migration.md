---
id: SPEC-035
title: "VPS Migration & Deployment"
status: concluido
prioridade: essencial
categoria: infraestrutura
ultima_atualizacao: "2026-04-10"
pr_referencia: "Commits beae879 → da97fa8"
---

# VPS Migration & Deployment

## Resumo
Migracao de Vercel para VPS self-hosted com Traefik reverse proxy, auto-TLS via Let's Encrypt, deploy automatico via GitHub Actions.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Infraestrutura
- **VPS**: Self-hosted (Hetzner)
- **Traefik**: Reverse proxy com auto-TLS (Let's Encrypt)
- **Docker Compose Prod** (`docker-compose.prod.yml`): 4 services (postgres, redis, api, web)
- **Domain**: spravio.io + api.spravio.io + www redirect
- **GHCR**: GitHub Container Registry para images

### CI/CD
- **deploy.yml**: Build → GHCR → SSH deploy
- **deploy-direct-build.yml**: Build direto na VPS (fallback)
- **update-env-production.yml**: Atualizar .env na VPS
- **fix-production.yml**: Scripts de correcao
- **verify-production.yml**: Verificacao pos-deploy

## Criterios de Aceitacao
- [x] VPS funcional com Traefik
- [x] Auto-TLS para spravio.io
- [x] Deploy automatico via push em main
- [x] WWW redirect funcional
- [x] Health checks pos-deploy
