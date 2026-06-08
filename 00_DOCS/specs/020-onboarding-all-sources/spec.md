# Feature Specification: Onboarding All Sources

> 🟡 BAIXO: Expandir wizard de onboarding para suportar todas as 7 fontes de PM

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 020-onboarding-all-sources |
| **Branch** | `feat/020-onboarding-all-sources` |
| **Prioridade** | 🟡 Baixa |
| **Data** | 2026-04-04 |
| **Status** | Ready for Implementation |

---

## 1. Resumo

O wizard de onboarding atual (`onboarding-wizard.tsx:23`) só suporta Jira e Azure DevOps como fontes de projeto. Esta feature expande para suportar todas as 7 fontes: Jira, Azure DevOps, Trello, ClickUp, Linear, Asana e Monday.com.

---

## 2. Motivação

### Problema
- Usuários de Trello, ClickUp, Linear, Asana, Monday não conseguem usar o onboarding
- Precisam criar projetos manualmente após o wizard
- Experiência de primeira hora fragmentada

### Impacto
- **Adoção reduzida** — usuários desistem se não virem sua ferramenta
- **Support tickets** — "como conectar meu Trello?"
- **Churn** — trial abandonado por fricção

### Métricas de Sucesso
- [ ] 7 fontes selecionáveis no wizard
- [ ] Formulário dinâmico por fonte
- [ ] Teste de conexão funcional para cada fonte
- [ ] Primeiro projeto criado independente da fonte

---

## 3. User Stories

### Story 1: Seleção de Fonte
**Como** novo usuário  
**Eu quero** escolher minha ferramenta de PM no onboarding  
**Para que** eu configure o Spravio para minha stack

#### Critérios de Aceite
- [ ] Grid de 7 cards com logos das ferramentas
- [ ] Seleção única (radio behavior)
- [ ] Descrição breve de cada ferramenta
- [ ] Visual feedback de seleção

### Story 2: Configuração Específica
**Como** usuário de ClickUp  
**Eu quero** ver apenas os campos relevantes para ClickUp  
**Para que** eu não fique confuso com campos de Jira

#### Critérios de Aceite
- [ ] Formulário muda dinamicamente por fonte
- [ ] Labels específicos (ex: "Space ID" para ClickUp, "Board ID" para Trello)
- [ ] Placeholders com exemplos reais
- [ ] Links para documentação de cada API

---

## 4. Configuração por Fonte

### Campos Necessários

| Fonte | Campos | Env Vars |
|-------|--------|----------|
| **Jira** | Base URL, Email, API Token, Cloud ID | `JIRA_*` |
| **Azure DevOps** | Org Name, Project, PAT | `AZURE_*` |
| **Trello** | API Key, Token, Board ID | `TRELLO_*` |
| **ClickUp** | API Token, Space ID | `CLICKUP_*` |
| **Linear** | API Key, Team ID | `LINEAR_*` |
| **Asana** | Access Token, Project GID | `ASANA_*` |
| **Monday** | API Token, Board ID | `MONDAY_*` |

### Formulários

```typescript
// Jira
{
  baseUrl: string;      // "https://your-domain.atlassian.net"
  email: string;        // "you@company.com"
  apiToken: string;     // Jira API token
  projectKey: string;   // "PROJ"
}

// Azure DevOps
{
  organization: string; // "your-org"
  project: string;      // "your-project"
  pat: string;          // Personal Access Token
}

// Trello
{
  apiKey: string;       // Trello API key
  token: string;        // Trello token
  boardId: string;      // Board ID or URL
}

// ClickUp
{
  apiToken: string;     // ClickUp API token
  spaceId: string;      // Space ID
}

// Linear
{
  apiKey: string;       // Linear API key
  teamId: string;       // Team ID (or key like "ENG")
}

// Asana
{
  accessToken: string;  // Asana PAT
  projectGid: string;   // Project GID
}

// Monday
{
  apiToken: string;     // Monday API token
  boardId: string;      // Board ID
}
```

---

## 5. UI Design

### Step 1: Selecionar Fonte

```
┌─────────────────────────────────────────────────────┐
│         Qual ferramenta você usa?                   │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Jira   │  │  Azure  │  │ Trello  │  │ClickUp │ │
│  │  [logo] │  │  [logo] │  │  [logo] │  │  [logo] │ │
│  │    ●    │  │    ○    │  │    ○    │  │    ○    │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ Linear  │  │  Asana  │  │ Monday  │              │
│  │  [logo] │  │  [logo] │  │  [logo] │              │
│  │    ○    │  │    ○    │  │    ○    │              │
│  └─────────┘  └─────────┘  └─────────┘              │
├─────────────────────────────────────────────────────┤
│                              [Continuar →]          │
└─────────────────────────────────────────────────────┘
```

### Step 2: Configurar Conexão (dinâmico)

```
┌─────────────────────────────────────────────────────┐
│         Conectar ao Trello                          │
├─────────────────────────────────────────────────────┤
│  API Key                                            │
│  ┌─────────────────────────────────────────────┐    │
│  │ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx            │    │
│  └─────────────────────────────────────────────┘    │
│  ⓘ Obtenha em trello.com/app-key                   │
│                                                     │
│  Token                                              │
│  ┌─────────────────────────────────────────────┐    │
│  │ ****************************************    │    │
│  └─────────────────────────────────────────────┘    │
│  ⓘ Gere um token após obter a API key              │
│                                                     │
│  Board ID ou URL                                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ https://trello.com/b/xxxxx/my-board         │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [Testar Conexão]                                   │
│                                                     │
│  ✅ Conexão bem sucedida! Board "My Board" encontrado│
├─────────────────────────────────────────────────────┤
│  [← Voltar]                      [Continuar →]      │
└─────────────────────────────────────────────────────┘
```

### Step 3: Criar Projeto

```
┌─────────────────────────────────────────────────────┐
│         Criar seu primeiro projeto                  │
├─────────────────────────────────────────────────────┤
│  Nome do Projeto                                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ My Board                        (auto-fill) │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [Criar Projeto e Iniciar Sync]                     │
│                                                     │
│  ⏳ Sincronizando dados do Trello...               │
│  ████████████░░░░░░░░░░░░░░░░░░░ 45%               │
│  • 3 listas encontradas                             │
│  • 24 cards importados                              │
│  • 5 membros sincronizados                          │
└─────────────────────────────────────────────────────┘
```

---

## 6. Componentes

### Novos Componentes

```
apps/web/src/components/onboarding/
├── SourceSelector.tsx       # Grid de seleção
├── SourceCard.tsx           # Card individual
├── ConnectionForm.tsx       # Form dinâmico
├── forms/
│   ├── JiraForm.tsx
│   ├── AzureForm.tsx
│   ├── TrelloForm.tsx
│   ├── ClickUpForm.tsx
│   ├── LinearForm.tsx
│   ├── AsanaForm.tsx
│   └── MondayForm.tsx
├── ConnectionTest.tsx       # Botão + feedback
└── SyncProgress.tsx         # Barra de progresso
```

### Source Logos

```typescript
// Usar Lucide icons ou SVGs custom
const SOURCE_CONFIG = {
  jira: { name: 'Jira', icon: JiraIcon, color: '#0052CC' },
  azure: { name: 'Azure DevOps', icon: AzureIcon, color: '#0078D4' },
  trello: { name: 'Trello', icon: TrelloIcon, color: '#0079BF' },
  clickup: { name: 'ClickUp', icon: ClickUpIcon, color: '#7B68EE' },
  linear: { name: 'Linear', icon: LinearIcon, color: '#5E6AD2' },
  asana: { name: 'Asana', icon: AsanaIcon, color: '#F06A6A' },
  monday: { name: 'Monday', icon: MondayIcon, color: '#FF3D57' },
};
```

---

## 7. API Endpoints

### Teste de Conexão

```typescript
// POST /onboarding/test-connection
{
  source: 'trello' | 'jira' | ...;
  credentials: { /* source-specific */ };
}

// Response
{
  success: boolean;
  projectName?: string;  // Nome do board/project encontrado
  error?: string;
}
```

### Criar Projeto

```typescript
// POST /projects (existente, expandir)
{
  name: string;
  source: 'trello' | 'jira' | ...;
  sourceConfig: { /* source-specific IDs */ };
}
```

---

## 8. Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] 7 fontes selecionáveis no wizard
- [ ] Formulário dinâmico funciona para cada fonte
- [ ] Teste de conexão funciona para cada fonte
- [ ] Projeto criado e sync iniciado
- [ ] CLAUDE.md atualizado

---

## 9. Estimativa

| Fase | Tempo |
|------|-------|
| SourceSelector + Cards | 1h |
| 7 formulários específicos | 3h |
| Teste de conexão (backend) | 1.5h |
| Integração com wizard existente | 1h |
| Testes manuais | 1h |
| **Total** | ~7.5h |
