# Feature Specification: Scope Minimization

> 🟡 MÉDIA: Revisar e restringir scopes/permissões das 14 integrações para mínimo necessário

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 029-scope-minimization |
| **Branch** | `feat/029-scope-minimization` |
| **Prioridade** | 🟡 Média |
| **Data** | 2026-04-21 |
| **Status** | Ready for Implementation |
| **LGPD** | Art. 6º III (necessidade / minimização) |
| **Dependências** | 023 (Token Encryption), 027 (Disconnect Flow) |

---

## 1. Resumo

Hoje, as integrações usam tokens com permissões amplas (PAT de admin, Bot Tokens full scope). Esta spec:
1. **Audita** os escopos atualmente solicitados/aceitos
2. **Documenta** o escopo mínimo necessário por funcionalidade
3. **Migra** para OAuth onde possível (em vez de PAT)
4. **Valida** que escopo é read-only quando a feature não precisa escrever
5. **Publica** justificativa de cada permissão (para Trust Center futuro)

---

## 2. Motivação

### Problema
- Jira conecta com PAT criado pelo user — pode ter permissão de admin, delete, etc.
- GitHub aceita PAT com `repo` scope total (leitura + escrita + admin)
- Azure DevOps PAT pode ter "Full access"
- Não há validação de qual scope está sendo usado
- Viola Art. 6º III da LGPD (princípio da necessidade)

### Impacto
- **Blast radius**: se token vaza, atacante pode modificar/deletar dados nos sistemas do cliente
- **Compliance**: auditoria aponta escopo excessivo
- **Vendas enterprise**: cliente sofisticado audita scopes solicitados

### Métricas de Sucesso
- [ ] Cada integração tem escopo mínimo documentado
- [ ] OAuth implementado para: GitHub, GitLab, Slack, Linear, ClickUp (quando suportado)
- [ ] Validação de token no connect alerta se scope for maior que necessário
- [ ] Trust Center lista cada scope com justificativa

---

## 3. User Stories

### Story 1: Conectar Jira com scope mínimo
**Como** gerente de agência preocupado com segurança
**Eu quero** conectar o Jira com as permissões mínimas
**Para que** um vazamento tenha impacto limitado

#### Critérios de Aceite
- [ ] Documentação explica qual API token criar no Jira
- [ ] Validação no connect: se token tem permissão de admin, avisar "scope excessivo"
- [ ] Lista de permissões que a integração realmente precisa

### Story 2: Migrar para OAuth
**Como** cliente que prefere OAuth a PAT
**Eu quero** conectar GitHub/GitLab/Slack via OAuth
**Para que** eu revogue a qualquer momento pela UI desses sistemas

#### Critérios de Aceite
- [ ] GitHub: OAuth App com scopes `read:org`, `repo:status`, `public_repo` (ajustar conforme uso real)
- [ ] GitLab: OAuth com `read_api`, `read_user`, `read_repository`
- [ ] Slack: OAuth com `channels:read`, `chat:write`, `users:read`
- [ ] Refresh tokens funcionam

### Story 3: Trust Center
**Como** prospect avaliando o Spravio
**Eu quero** ver documentação clara dos scopes
**Para que** eu valide com time de segurança antes de contratar

#### Critérios de Aceite
- [ ] Página pública ou no docs: `/security/integration-scopes`
- [ ] Tabela: integração / scope / justificativa / tipo (read-only/read-write)

---

## 4. Requisitos Funcionais

### 4.1 Auditoria Inicial
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Documentar endpoints reais chamados por cada integração | Must Have |
| RF-02 | Mapear cada endpoint para o scope mínimo que ele exige | Must Have |
| RF-03 | Relatório: `escopoAtual vs escopoMínimo` por integração | Must Have |

### 4.2 Escopo Mínimo por Integração

#### Jira
| Endpoint usado | Scope Cloud OAuth | PAT permission |
|----------------|-------------------|----------------|
| `GET /rest/api/3/project` | `read:project:jira` | "Browse projects" |
| `GET /rest/api/3/search` (JQL) | `read:jira-work` | "Browse projects" |
| `GET /rest/api/3/issue/:id` | `read:issue:jira` | "Browse projects" |

**Mínimo:** read-only, somente projetos selecionados.
**Evitar:** "Administer Jira", "Create projects", "Delete issues".

#### GitHub
| Endpoint usado | Scope OAuth | PAT Fine-grained |
|----------------|-------------|------------------|
| `GET /orgs/:org/repos` | `read:org` | Organization: read |
| `GET /repos/:owner/:repo/pulls` | `repo:status` (public) ou `repo` (private) | Pull requests: read |
| `GET /repos/:owner/:repo/commits` | mesmo | Contents: read |

**Mínimo:** `read:org`, `public_repo` (se só public), `repo` read-only (se private).
**Evitar:** `admin:org`, `delete_repo`, `write:packages`.

#### Azure DevOps
| Endpoint usado | Scope PAT |
|----------------|-----------|
| `GET /_apis/projects` | `vso.project` (Read) |
| `GET /_apis/work/boards` | `vso.work` (Read) |
| `GET /_apis/wit/workitems` | `vso.work` (Read) |

**Mínimo:** `vso.project`, `vso.work`, `vso.code` (só leitura).
**Evitar:** `vso.profile_write`, "Full access".

#### Slack
| Endpoint usado | Scope Bot Token |
|----------------|-----------------|
| `chat.postMessage` | `chat:write` |
| `channels.list` | `channels:read` |
| `conversations.info` | `channels:read` |

**Mínimo:** `chat:write`, `channels:read`.
**Evitar:** `admin`, `channels:history` (a menos que feature exija).

#### GitHub, GitLab, Linear (OAuth App)
Documentar client_id / scopes solicitados no OAuth consent screen.

#### Tempo / Clockify / Webhook-based (Teams)
| Integração | Scope |
|------------|-------|
| Tempo | API token com scope `tempo.worklog.read` |
| Clockify | API key (não tem scopes granulares — documenta limitação) |
| Teams | Incoming Webhook URL — não é auth, apenas endpoint |

### 4.3 Validação
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-04 | No connect, chamar endpoint de introspecção quando disponível | Must Have |
| RF-05 | Se scope for maior que recomendado, banner "Você deu mais permissão que necessário" | Should Have |
| RF-06 | Link para documentação de como criar token com scope mínimo | Must Have |

### 4.4 Migração OAuth
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-07 | GitHub OAuth App registrado em github.com | Should Have |
| RF-08 | GitLab OAuth application | Should Have |
| RF-09 | Slack OAuth App com consent screen | Should Have |
| RF-10 | Fluxo de refresh token | Should Have |
| RF-11 | PAT continua suportado como fallback | Must Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Documentação pública | Acessível sem login |
| RNF-02 | Fallback | PAT continua funcionando durante migração |
| RNF-03 | Compatibilidade | Clientes existentes não precisam reconectar |

---

## 6. Implementação

### 6.1 Validação de Scope no Connect

**Localização:** `apps/api/src/integrations/_shared/scope-validator.ts`

```typescript
export interface ScopeValidationResult {
  valid: boolean;
  currentScopes: string[];
  requiredScopes: string[];
  excessiveScopes: string[];
  warnings: string[];
}

export interface ScopeValidator {
  validate(token: string): Promise<ScopeValidationResult>;
}

export class GitHubScopeValidator implements ScopeValidator {
  private readonly required = ['read:org', 'repo:status'];
  private readonly acceptable = new Set([
    'read:org', 'repo:status', 'public_repo', 'repo',
  ]);

  async validate(token: string): Promise<ScopeValidationResult> {
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const scopes = (response.headers.get('x-oauth-scopes') ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean);

    const missing = this.required.filter((r) => !scopes.includes(r) && !scopes.includes('repo'));
    const excessive = scopes.filter((s) => !this.acceptable.has(s));
    const warnings: string[] = [];

    if (scopes.includes('admin:org') || scopes.includes('delete_repo')) {
      warnings.push('Your token has admin permissions. Consider using a fine-grained PAT with read-only access.');
    }

    return {
      valid: missing.length === 0,
      currentScopes: scopes,
      requiredScopes: this.required,
      excessiveScopes: excessive,
      warnings,
    };
  }
}

export class SlackScopeValidator implements ScopeValidator {
  private readonly required = ['chat:write', 'channels:read'];

  async validate(token: string): Promise<ScopeValidationResult> {
    const response = await fetch('https://slack.com/api/auth.test', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    if (!data.ok) {
      return {
        valid: false,
        currentScopes: [],
        requiredScopes: this.required,
        excessiveScopes: [],
        warnings: [`Slack token validation failed: ${data.error}`],
      };
    }

    // Slack retorna scopes no header response
    const scopes = (response.headers.get('x-oauth-scopes') ?? '')
      .split(',').map((s) => s.trim());

    const warnings: string[] = [];
    if (scopes.includes('admin')) {
      warnings.push('Token has admin scope — not required for Spravio.');
    }

    return {
      valid: this.required.every((r) => scopes.includes(r)),
      currentScopes: scopes,
      requiredScopes: this.required,
      excessiveScopes: scopes.filter((s) => !this.required.includes(s)),
      warnings,
    };
  }
}
```

### 6.2 OAuth Flow (exemplo GitHub)

**Localização:** `apps/api/src/integrations/github/oauth.ts`

```typescript
export async function startGitHubOAuth(organizationId: string): Promise<string> {
  const state = crypto.randomBytes(32).toString('base64url');
  await redis.set(`oauth:github:state:${state}`, organizationId, 'EX', 600);

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GITHUB_OAUTH_CLIENT_ID!);
  url.searchParams.set('redirect_uri', `${process.env.APP_URL}/integrations/github/callback`);
  url.searchParams.set('scope', 'read:org repo:status');  // mínimo!
  url.searchParams.set('state', state);
  return url.toString();
}

export async function handleGitHubCallback(code: string, state: string): Promise<void> {
  const orgId = await redis.get(`oauth:github:state:${state}`);
  if (!orgId) throw new Error('Invalid or expired state');

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
    }),
  });
  const { access_token, refresh_token } = await response.json();

  // Criptografar (spec 023) e salvar
  await organizationSettingsRepo.updateIntegrationToken(orgId, 'github', access_token);

  await auditService.log({
    type: 'integration.connected',
    organizationId: orgId,
    metadata: { source: 'github', method: 'oauth' },
  });
}
```

### 6.3 Documentação Pública

**Localização:** `apps/web/src/app/security/integration-scopes/page.tsx`

Renderizar tabela com dados de `docs/security/integration-scopes.md`:

```markdown
# Integration Scopes

Cada integração solicita o mínimo de permissões necessário.

## Jira Cloud

| Permissão | Por quê |
|-----------|---------|
| Browse projects (read) | Listar projetos disponíveis |
| View issues (read) | Sincronizar tickets |
| View sprints (read) | Sincronizar sprints ativos |

**Nunca solicitado:** administrar Jira, criar/editar/deletar projetos ou issues.

## GitHub

| Scope | Por quê |
|-------|---------|
| `read:org` | Listar repos da org |
| `repo:status` | Ler status de CI em PRs |
| `public_repo` | Ler PRs públicos |

**Nunca solicitado:** `admin:org`, `delete_repo`, `write:*`.

...
```

### 6.4 Connect Endpoint com Validação

```typescript
app.post('/organizations/:id/integrations/github/connect',
  { preHandler: [authGuard, tenantGuard, requireRole('OWNER')] },
  async (req, reply) => {
    const { token, method } = req.body;

    if (method === 'oauth') {
      const url = await startGitHubOAuth(req.organizationId!);
      return reply.send({ redirectUrl: url });
    }

    // PAT flow
    const validator = new GitHubScopeValidator();
    const result = await validator.validate(token);

    if (!result.valid) {
      return reply.code(400).send({
        error: 'Invalid scopes',
        message: `Missing required scopes: ${result.requiredScopes.join(', ')}`,
        currentScopes: result.currentScopes,
      });
    }

    // Salvar criptografado
    await orgSettingsRepo.updateIntegrationToken(req.organizationId!, 'github', token);

    await auditService.log({
      type: 'integration.connected',
      organizationId: req.organizationId!,
      actorId: req.userId!,
      metadata: {
        source: 'github',
        method: 'pat',
        scopes: result.currentScopes,
        warnings: result.warnings,
      },
    });

    return reply.send({
      success: true,
      warnings: result.warnings,
      excessiveScopes: result.excessiveScopes,
    });
  },
);
```

---

## 7. UI/UX

```
┌────────────────────────────────────────────────────────┐
│ Conectar GitHub                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ○ OAuth (recomendado)                                  │
│   Autorize pelo GitHub. Pode revogar a qualquer        │
│   momento em github.com/settings/applications.         │
│   [Conectar via OAuth]                                 │
│                                                        │
│ ○ Personal Access Token (avançado)                     │
│   Cole um PAT com scopes: read:org, repo:status        │
│   ┌──────────────────────────────────────────┐         │
│   │ ghp_...                                  │         │
│   └──────────────────────────────────────────┘         │
│   ⓘ Como criar um PAT com scope mínimo? [link]         │
│                                                        │
│   [Validar e Conectar]                                 │
│                                                        │
│ ⚠️ Detectamos que seu token tem scopes além do         │
│   necessário: `admin:org`. Recomendamos recriar com    │
│   apenas `read:org` e `repo:status`.                   │
└────────────────────────────────────────────────────────┘
```

---

## 8. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| Token sem scope requerido | 400 com mensagem clara |
| Token com scope excessivo | 200 + warning visível |
| API não retorna scopes no header | Confiar no user + documentação |
| OAuth redirect falha | Erro claro, fallback para PAT |
| Refresh token expira | Prompt para re-auth, mantém dados |

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Features quebram com scope reduzido | Média | Médio | Auditoria de endpoints reais antes de restringir |
| User ignora warnings de scope | Alta | Baixo | Info + link para docs, não bloquear |
| OAuth callback exposto a CSRF | Baixa | Alto | State token obrigatório, TTL curto |
| Migração quebra clientes existentes | Baixa | Alto | PAT continua como fallback, OAuth opt-in |

---

## 10. Fora de Escopo

- OAuth para fontes que não suportam (Azure PAT, Jira PAT Cloud) — manter documentação
- Service Accounts / bots dedicados — enterprise feature futura
- Automatic scope discovery — alguns providers não expõem

---

## 11. Dependências

### Dependências de Features
- **023** (Token Encryption) — tokens OAuth também criptografados
- **027** (Disconnect Flow) — revogação usa credenciais OAuth também

### Dependências Técnicas
- [ ] Apps OAuth registrados em GitHub, GitLab, Slack
- [ ] Variáveis de ambiente para client_id/secret
- [ ] URL de callback configurada em produção

---

## 12. Definition of Done

- [ ] Auditoria de endpoints reais usados por integração
- [ ] Tabela de escopo mínimo documentada por integração
- [ ] `ScopeValidator` implementado para GitHub, Slack
- [ ] Connect flow valida scope antes de salvar
- [ ] Warnings visíveis na UI quando scope é excessivo
- [ ] OAuth flow funcionando para GitHub, GitLab, Slack
- [ ] PAT continua como fallback
- [ ] Página `/security/integration-scopes` publicada
- [ ] Documentação "Como criar PAT com scope mínimo" por provider
- [ ] Audit log registra scopes no connect
- [ ] Testes: connect com scope insuficiente falha
- [ ] Testes: connect com scope excessivo passa com warning
- [ ] CLAUDE.md atualizado
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings

---

## 13. Estimativa

| Fase | Tempo |
|------|-------|
| Auditoria de endpoints usados | 1h |
| `ScopeValidator` para 3 providers | 1.5h |
| OAuth flow GitHub | 1.5h |
| Documentação pública | 1h |
| UI warnings + connect flow | 1h |
| **Total** | ~6h |
