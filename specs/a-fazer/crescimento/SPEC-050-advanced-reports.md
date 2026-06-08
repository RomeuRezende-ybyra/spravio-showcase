---
id: SPEC-050
title: "Relatorios Avancados"
status: a-fazer
prioridade: crescimento
categoria: plataforma
pontos: 8
mvp: false
ultima_atualizacao: "2026-05-03"
---

# Relatorios Avancados

## Resumo
Relatorios programados e sob demanda: operacional, financeiro, produtividade por equipe/periodo. Com agendamento e envio automatico por email.

## Status Atual
**15% implementado.** Dashboard mostra metricas em tempo real mas nao gera relatorios exportaveis nem agendados.

## O que Falta Implementar
- [ ] Model `ReportConfig` (orgId, type, frequency, recipients, filters)
- [ ] Tipos: operacional, financeiro, produtividade, sprint-review
- [ ] API POST `/reports/generate` — gerar sob demanda
- [ ] API CRUD `/reports/schedules` — agendar relatorios
- [ ] Job BullMQ `generate-report` — geracao assincrona
- [ ] Templates PDF para cada tipo de relatorio
- [ ] Envio por email com PDF anexo (depende SPEC-039)
- [ ] UI: pagina `/reports` com historico e agendamento

## Criterios de Aceitacao
- [ ] Relatorio gerado sob demanda em PDF
- [ ] Agendamento semanal/mensal funcional
- [ ] Email enviado com relatorio anexo
- [ ] `pnpm typecheck` — 0 errors

## Dependencias
- **Depende de**: SPEC-039 (Email), SPEC-043 (Export)
