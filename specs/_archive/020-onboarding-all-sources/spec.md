# Spec: Onboarding para Todas as Fontes

> ID: 020-onboarding-all-sources
> Status: Draft
> Autor: Claude
> Data: 2026-04-04

---

## Problema

O wizard de onboarding suporta apenas **Jira e Azure DevOps**, mas o backend já tem integrações completas para 7 fontes de PM. Usuários de Trello, ClickUp, Linear, Asana e Monday.com não conseguem fazer setup via onboarding — precisariam criar o projeto manualmente e configurar a source por fora.

**Estado atual:**
- `onboarding-wizard.tsx` define `source: 'jira' | 'azure'`
- `step-connect-source.tsx` renderiza apenas 2 botões (Jira, Azure)
- `step-create-project.tsx` só trata campos de Jira e Azure
- `projects/types.ts` valida `source: z.enum(['jira', 'azure'])`
- `projects/service.ts` só dispatcha sync jobs para Jira e Azure

**Backend já pronto:**
- Integrações: `integrations/trello/`, `integrations/clickup/`, `integrations/linear/`, `integrations/asana/`, `integrations/monday/`
- Sync jobs: `syncTrello.job.ts`, `syncClickUp.job.ts`, `syncLinear.job.ts`, `syncAsana.job.ts`, `syncMonday.job.ts`
- Schema: Project já tem campos `trelloBoardId`, `clickupSpaceId`, `linearTeamId`, `asanaProjectId`, `mondayBoardId`

---

## Solução Proposta

Expandir o onboarding wizard para suportar as 7 fontes de PM. Cada fonte terá seu botão no step de seleção e campos específicos no step de criação de projeto.

---

## Escopo

### Incluído
- Adicionar 5 fontes ao wizard: Trello, ClickUp, Linear, Asana, Monday
- Atualizar UI do step-connect-source com 7 opções
- Atualizar form do step-create-project com campos por fonte
- Atualizar validação Zod no backend (`projects/types.ts`)
- Atualizar service de criação para disparar sync job correto
- Adicionar GitLab como fonte (8a opção) — integração também já existe

### Excluído
- Novas integrações (só usar as que já existem)
- OAuth flow (todas usam API tokens/keys no momento)
- Edição de source após criação do projeto

---

## Requisitos

### Funcionais
1. **[RF-01]** O wizard DEVE apresentar todas as 8 fontes: Jira, Azure DevOps, GitLab, Trello, ClickUp, Linear, Asana, Monday
2. **[RF-02]** Cada fonte DEVE ter campos de input específicos (ex: Trello → Board ID, Linear → Team ID)
3. **[RF-03]** A criação do projeto DEVE disparar o sync job correto para a fonte selecionada
4. **[RF-04]** A validação Zod no backend DEVE aceitar todas as 8 fontes
5. **[RF-05]** O step de GitHub permanece opcional e independente da fonte PM

### Não-funcionais
1. **[RNF-01]** UI responsiva — grid de fontes deve funcionar em mobile
2. **[RNF-02]** Ícones/logos claros para cada fonte

---

## Arquivos Impactados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `apps/web/src/components/onboarding/onboarding-wizard.tsx` | Modificação — expandir tipo `source` |
| `apps/web/src/components/onboarding/step-connect-source.tsx` | Modificação — 8 botões de fonte |
| `apps/web/src/components/onboarding/step-create-project.tsx` | Modificação — campos por fonte |
| `apps/api/src/modules/projects/types.ts` | Modificação — enum Zod com 8 valores |
| `apps/api/src/modules/projects/service.ts` | Modificação — dispatch de sync jobs por fonte |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| UI fica poluída com 8 opções | Grid 2x4 com ícones e nomes curtos |
| Campos variam por fonte (confusão UX) | Renderização condicional clara, placeholder com exemplo por fonte |
| Sync job falha para fonte nova | Sync jobs já existem e foram testados nas fases 10–16 |
| Credenciais de API variam por fonte | Cada campo explica o que preencher (tooltip ou helper text) |

---

## Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] Wizard mostra 8 fontes de PM
- [ ] Cada fonte tem form fields corretos
- [ ] Backend aceita e processa as 8 fontes
- [ ] Sync job dispara corretamente para cada fonte
- [ ] Step de GitHub continua funcionando

---

## Notas

- Os campos por fonte (já no Prisma schema):
  - Jira: `jiraProjectKey` (string, ex: "PROJ")
  - Azure: `azureProjectId` (string, ex: UUID)
  - GitLab: `gitlabRepo` (string, ex: "group/project")
  - Trello: `trelloBoardId` (string, ex: Board ID)
  - ClickUp: `clickupSpaceId` (string, ex: Space ID)
  - Linear: `linearTeamId` (string, ex: Team ID)
  - Asana: `asanaProjectId` (string, ex: Project GID)
  - Monday: `mondayBoardId` (string, ex: Board ID)
