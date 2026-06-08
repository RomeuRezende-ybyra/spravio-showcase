---
id: SPEC-012
title: "AI Forecast (Anthropic Claude)"
status: concluido
prioridade: essencial
categoria: plataforma
ultima_atualizacao: "2026-04-01"
---

# AI Forecast (Anthropic Claude)

## Resumo
Previsao de entrega usando Anthropic Claude API: analise de velocity, burndown, riscos e probabilidade de conclusao do sprint.

## Status Atual
**100% implementado.**

## O que Ja Existe

### Backend
- **Anthropic Integration** (`apps/api/src/integrations/anthropic/`): Claude API client
- **Forecast Module** (`apps/api/src/modules/forecast/`): Generate, history, display

### Frontend
- **Forecast Dashboard** (`apps/web/src/app/(dashboard)/forecast/`)
- **Forecast Components** (`apps/web/src/components/forecast/`)

### Modelos de Dados
```prisma
model DeliveryForecast { projectId, sprintId, confidenceLevel, probability, reasoning, generatedAt }
```

### Endpoints API
| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | /projects/:projectId/forecast | Ultimo forecast |
| GET | /projects/:projectId/forecast/history | Historico |
| POST | /projects/:projectId/forecast/generate | Gerar novo forecast |
