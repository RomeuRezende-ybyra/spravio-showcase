# Feature Specification: Full Settings Page

> 🟡 BAIXO: Expor configurações de Teams, Tempo e Clockify na página de settings

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 021-settings-full-config |
| **Branch** | `feat/021-settings-full-config` |
| **Prioridade** | 🟡 Baixa |
| **Data** | 2026-04-04 |
| **Status** | Ready for Implementation |

---

## 1. Resumo

A página de configurações do projeto (`settings/page.tsx`) atualmente só mostra configuração do Slack. Esta feature adiciona tabs/seções para Microsoft Teams, Tempo (time tracking) e Clockify, permitindo configuração completa de todas as integrações.

---

## 2. Motivação

### Problema
- Usuários não conseguem configurar Teams pela UI
- Configuração de Tempo/Clockify não tem interface
- Precisam usar API diretamente ou pedir ao suporte

### Impacto
- **Adoção** — integrações existentes mas inacessíveis
- **Self-service** — usuários dependentes de suporte
- **Consistência** — Slack configurável, outros não

### Métricas de Sucesso
- [ ] Todas 4 integrações configuráveis pela UI
- [ ] UI consistente entre todas as integrações
- [ ] Teste de conexão disponível para cada uma

---

## 3. User Stories

### Story 1: Configurar Teams
**Como** owner/PM  
**Eu quero** configurar notificações do Teams pela UI  
**Para que** eu receba alertas no canal da minha equipe

#### Critérios de Aceite
- [ ] Form para webhook URL do Teams
- [ ] Seleção de tipos de alerta (checkboxes)
- [ ] Toggle ativo/inativo
- [ ] Botão "Enviar notificação de teste"
- [ ] Feedback de sucesso/erro

### Story 2: Configurar Tempo
**Como** owner/PM  
**Eu quero** conectar Tempo para importar horas automaticamente  
**Para que** o budget tracking use dados reais

#### Critérios de Aceite
- [ ] Form para API token do Tempo
- [ ] Teste de conexão
- [ ] Exibir última sincronização
- [ ] Botão para forçar sync manual

### Story 3: Configurar Clockify
**Como** owner/PM usando Clockify  
**Eu quero** conectar Clockify como alternativa ao Tempo  
**Para que** horas sejam importadas da minha ferramenta

#### Critérios de Aceite
- [ ] Form para API key + Workspace ID
- [ ] Teste de conexão
- [ ] Exibir última sincronização
- [ ] Botão para forçar sync manual

---

## 4. UI Design

### Layout com Tabs

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Configurações do Projeto: Spravio Dashboard             │
├─────────────────────────────────────────────────────────────┤
│  [Notificações]  [Time Tracking]  [Integrações]  [Perigos]  │
├─────────────────────────────────────────────────────────────┤
```

### Tab: Notificações

```
┌─────────────────────────────────────────────────────────────┐
│  Notificações                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔔 Slack                                     [ON] 🟢│    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Webhook URL                                         │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ https://hooks.slack.com/services/xxx/yyy/zzz   │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │                                                     │    │
│  │ Tipos de Alerta:                                    │    │
│  │ ☑️ PR Stale (warning)    ☑️ PR Stale (critical)     │    │
│  │ ☑️ Budget > 80%          ☑️ Sprint health baixo     │    │
│  │ ☑️ Done sem código       ☑️ Forecast < 50%          │    │
│  │                                                     │    │
│  │ [Testar] [Salvar]                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 💬 Microsoft Teams                          [OFF] ⚪│    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Webhook URL                                         │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ https://outlook.office.com/webhook/xxx...      │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │ ⓘ Configure um Incoming Webhook no Teams           │    │
│  │                                                     │    │
│  │ Tipos de Alerta:                                    │    │
│  │ ☐ PR Stale (warning)    ☐ PR Stale (critical)       │    │
│  │ ☐ Budget > 80%          ☐ Sprint health baixo       │    │
│  │ ☐ Done sem código       ☐ Forecast < 50%            │    │
│  │                                                     │    │
│  │ [Testar] [Salvar]                                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tab: Time Tracking

```
┌─────────────────────────────────────────────────────────────┐
│  Time Tracking                                              │
├─────────────────────────────────────────────────────────────┤
│  Selecione a fonte de horas para cálculo de budget:        │
│                                                             │
│  ○ Manual (entrada manual de horas)                         │
│  ● Tempo (Jira Time Tracking)                               │
│  ○ Clockify                                                 │
│                                                             │
│  ────────────────────────────────────────────────────────── │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ⏱️ Tempo                                    [ON] 🟢 │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ API Token                                           │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●              │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │ ⓘ Obtenha em tempo.io → Settings → API Integration │    │
│  │                                                     │    │
│  │ Status: ✅ Conectado                                │    │
│  │ Última sync: 04/04/2026 14:32                       │    │
│  │ Horas importadas: 156.5h (este sprint)              │    │
│  │                                                     │    │
│  │ [Testar Conexão] [Sincronizar Agora] [Salvar]       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🕐 Clockify                                [OFF] ⚪ │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ API Key                                             │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │                                                 │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │                                                     │    │
│  │ Workspace ID                                        │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │                                                 │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │ ⓘ Obtenha em clockify.me → Settings → API          │    │
│  │                                                     │    │
│  │ [Testar Conexão] [Salvar]                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Componentes

### Estrutura

```
apps/web/src/app/(dashboard)/projects/[id]/settings/
├── page.tsx                    # Layout com tabs
├── loading.tsx                 # Skeleton
├── error.tsx                   # Error boundary
└── components/
    ├── SettingsTabs.tsx        # Tab navigation
    ├── NotificationsTab.tsx    # Slack + Teams
    ├── TimeTrackingTab.tsx     # Tempo + Clockify
    ├── IntegrationsTab.tsx     # GitHub/GitLab config (futuro)
    ├── DangerZoneTab.tsx       # Delete project
    ├── SlackConfigForm.tsx     # Form existente (refatorar)
    ├── TeamsConfigForm.tsx     # NEW
    ├── TempoConfigForm.tsx     # NEW
    ├── ClockifyConfigForm.tsx  # NEW
    └── ConnectionStatus.tsx    # Componente de status
```

### Componente Reutilizável

```typescript
// IntegrationCard.tsx
interface IntegrationCardProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  children: React.ReactNode;
  onTest?: () => Promise<boolean>;
  onSave: () => Promise<void>;
  lastSync?: Date;
}
```

---

## 6. API Endpoints (existentes)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/projects/:id/slack-config` | GET/PUT | Config Slack |
| `/projects/:id/teams-config` | GET/PUT | Config Teams |
| `/projects/:id/tempo-config` | GET/PUT | Config Tempo |
| `/projects/:id/clockify-config` | GET/PUT | Config Clockify |
| `/projects/:id/*/test` | POST | Testar conexão |
| `/projects/:id/*/sync` | POST | Forçar sync |

---

## 7. Tipos de Alerta

```typescript
type AlertType = 
  | 'pr_stale_warning'      // PR > 24h
  | 'pr_stale_critical'     // PR > 72h
  | 'budget_warning'        // Budget > 80%
  | 'sprint_health_low'     // Completion < 40% com < 3 dias
  | 'done_without_code'     // Card DONE sem commits
  | 'forecast_low';         // Probability < 50%
```

---

## 8. Validação

```typescript
// TeamsConfigSchema
const TeamsConfigInputSchema = z.object({
  webhookUrl: z.string().url().startsWith('https://'),
  alertTypes: z.array(z.enum([...])),
  isActive: z.boolean(),
});

// TempoConfigSchema
const TempoConfigInputSchema = z.object({
  apiToken: z.string().min(10),
});

// ClockifyConfigSchema
const ClockifyConfigInputSchema = z.object({
  apiKey: z.string().min(10),
  workspaceId: z.string().min(1),
});
```

---

## 9. Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] 4 integrações configuráveis pela UI
- [ ] Teste de conexão funciona para cada uma
- [ ] Sync manual funciona para Tempo/Clockify
- [ ] Feedback visual de status (conectado/desconectado)
- [ ] loading.tsx + error.tsx na página
- [ ] CLAUDE.md atualizado

---

## 10. Estimativa

| Fase | Tempo |
|------|-------|
| Refatorar settings com tabs | 1h |
| TeamsConfigForm | 1h |
| TempoConfigForm | 1h |
| ClockifyConfigForm | 1h |
| ConnectionStatus component | 30min |
| Testes manuais | 1h |
| **Total** | ~5.5h |
