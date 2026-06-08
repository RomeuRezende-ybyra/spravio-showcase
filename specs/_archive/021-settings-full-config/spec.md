# Spec: Settings com Todas as Integrações

> ID: 021-settings-full-config
> Status: Draft
> Autor: Claude
> Data: 2026-04-04

---

## Problema

A página de Settings do projeto só mostra o formulário do **Slack**. Os endpoints de **Teams**, **Tempo** e **Clockify** existem no backend mas não têm UI. Além disso, a página não tem `loading.tsx` nem `error.tsx` (requisito da constitution).

**Estado atual:**

| Integração | API Endpoints | UI Form | API Client Methods |
|------------|--------------|---------|-------------------|
| Slack | 3 endpoints | Sim | Sim |
| Teams | 4 endpoints | Nenhum | Nenhum |
| Tempo | 5 endpoints | Nenhum | Nenhum |
| Clockify | 5 endpoints | Nenhum | Nenhum |

**Arquivos existentes:**
- UI: `components/slack/slack-settings-form.tsx` (único form)
- Page: `projects/[projectId]/settings/page.tsx` (só renderiza Slack)
- API client: `lib/api/client.ts` — só tem métodos `apiClient.slack.*`

---

## Solução Proposta

Reestruturar a página de Settings em **tabs** (Slack, Teams, Tempo, Clockify) com formulários dedicados para cada integração. Adicionar métodos ao API client para Teams, Tempo e Clockify. Criar `loading.tsx` e `error.tsx`.

---

## Escopo

### Incluído
- Criar componentes: `teams-settings-form.tsx`, `tempo-settings-form.tsx`, `clockify-settings-form.tsx`
- Reestruturar Settings page com tabs (shadcn/ui Tabs)
- Adicionar métodos ao API client: `apiClient.teams.*`, `apiClient.tempo.*`, `apiClient.clockify.*`
- Criar `loading.tsx` e `error.tsx` para settings route
- Cada form: GET config, PUT/save, test connection, delete config

### Excluído
- Novos endpoints de API (já existem todos)
- Portal/billing settings (já é rota separada)
- Notificações de projeto (regras de alerta) — feature separada

---

## Requisitos

### Funcionais
1. **[RF-01]** Settings page DEVE ter 4 tabs: Slack, Teams, Tempo, Clockify
2. **[RF-02]** Cada tab DEVE ter formulário para configurar a integração
3. **[RF-03]** Cada form DEVE ter: campos de config, botão Save, botão Test, botão Delete (exceto Slack que não tem delete)
4. **[RF-04]** API client DEVE expor métodos para todas as 4 integrações
5. **[RF-05]** `loading.tsx` e `error.tsx` DEVEM existir na rota de settings

### Não-funcionais
1. **[RNF-01]** Forms devem carregar a config existente via GET ao montar
2. **[RNF-02]** Feedback visual em Save/Test/Delete (loading state, success/error toast)

---

## Arquivos Impactados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `apps/web/src/app/(dashboard)/projects/[projectId]/settings/page.tsx` | Modificação — layout com tabs |
| `apps/web/src/app/(dashboard)/projects/[projectId]/settings/loading.tsx` | Criação |
| `apps/web/src/app/(dashboard)/projects/[projectId]/settings/error.tsx` | Criação |
| `apps/web/src/components/teams/teams-settings-form.tsx` | Criação |
| `apps/web/src/components/tempo/tempo-settings-form.tsx` | Criação |
| `apps/web/src/components/clockify/clockify-settings-form.tsx` | Criação |
| `apps/web/src/lib/api/client.ts` | Modificação — adicionar teams/tempo/clockify methods |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Formulários diferentes por integração | Template base consistente; só os campos variam |
| API client cresce demais | Organizar por namespace: `apiClient.teams.*`, `apiClient.tempo.*`, etc. (padrão já usado com `apiClient.slack.*`) |
| Endpoint DELETE não existe no Slack | Slack form não mostra botão Delete — tratar por integração |

---

## Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] Settings page com 4 tabs funcionais
- [ ] Teams form: GET, PUT, DELETE, test
- [ ] Tempo form: GET, PUT, DELETE, test, sync
- [ ] Clockify form: GET, PUT, DELETE, test, sync
- [ ] `loading.tsx` + `error.tsx` presentes
- [ ] API client com métodos para todas as integrações

---

## Notas

- **Campos por integração (do backend):**
  - Slack: `webhookUrl`, `channelId?`, `alertTypes[]`, `isActive`
  - Teams: `webhookUrl`, `alertTypes[]`, `isActive`
  - Tempo: `apiToken`, `isActive` (+ sync e lastSyncAt readonly)
  - Clockify: `apiKey`, `workspaceId`, `isActive` (+ sync e lastSyncAt readonly)
- Tempo e Clockify têm botão "Sync Now" além de Test — disparam sync de time tracking
- O Slack settings form existente (`slack-settings-form.tsx`) serve de referência para o padrão visual
