---
id: SPEC-043
title: "Exportacao de Dados"
status: a-fazer
prioridade: importante
categoria: plataforma
pontos: 5
mvp: false
ultima_atualizacao: "2026-05-03"
---

# Exportacao de Dados

## Resumo
Permitir exportacao de dados em CSV e PDF: projetos, sprints, desenvolvedores, financeiro. Essencial para gestores que precisam reportar para stakeholders.

## Status Atual
**0% implementado.** Nenhuma funcionalidade de export existe.

## O que Falta Implementar
- [ ] Servico `ExportService` no backend (CSV + PDF)
- [ ] API GET `/projects/:id/export?format=csv|pdf`
- [ ] API GET `/projects/:id/developers/export?format=csv`
- [ ] API GET `/projects/:id/financials/export?format=csv|pdf`
- [ ] Geracao de PDF com layout (Puppeteer ou jsPDF)
- [ ] Botoes de export nas paginas: projetos, developers, financials
- [ ] Job assincrono para exports grandes

## Criterios de Aceitacao
- [ ] Export CSV de projetos, devs e financeiro
- [ ] Export PDF com layout profissional
- [ ] Download inicia apos clique no botao
- [ ] `pnpm typecheck` — 0 errors
