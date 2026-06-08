# Feature Specification: Log Sanitization

> 🔴 CRÍTICA: Remover dados sensíveis dos logs da aplicação e ferramentas de observabilidade

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 024-log-sanitization |
| **Branch** | `feat/024-log-sanitization` |
| **Prioridade** | 🔴 Crítica |
| **Data** | 2026-04-21 |
| **Status** | Ready for Implementation |
| **LGPD** | Art. 6º VII, Art. 46 |

---

## 1. Resumo

Logs da aplicação (Pino), logs de integrações HTTP, e ferramentas de observabilidade (Sentry/APM) podem estar capturando dados sensíveis: tokens no header `Authorization`, payloads de Jira/GitHub com títulos de issues/PRs, mensagens de Slack, e-mails e nomes de usuários.

Esta spec implementa sanitização sistemática via:
- Redact patterns no Pino logger
- Interceptor HTTP que filtra headers e bodies
- Scrubbing no Sentry `beforeSend`
- Validação via testes

---

## 2. Motivação

### Problema
- Request logs incluem header `Authorization: Bearer xxx`
- Response logs de integrações incluem títulos/descrições de issues
- Sentry captura request bodies em erros (pode ter tokens em payload)
- Logs ficam acessíveis a qualquer dev com acesso à ferramenta de observabilidade
- Um dev malicioso (ou conta comprometida) pode exfiltrar tokens/dados dos clientes

### Impacto
- **Vazamento lateral**: mesmo com token encryption (spec 023), logs vazam credenciais
- **Compliance**: Art. 46 LGPD exige medidas técnicas para prevenir acesso não autorizado
- **Contrato B2B**: clientes enterprise auditam práticas de logging antes de assinar

### Métricas de Sucesso
- [ ] Zero tokens/secrets nos logs de produção
- [ ] Zero conteúdo de issues/PRs nos logs (apenas IDs)
- [ ] Testes automatizados validam sanitização
- [ ] Sentry events passam por scrubber antes de enviar

---

## 3. User Stories

### Story 1: Segurança de logs de produção
**Como** engenheiro de segurança do Spravio
**Eu quero** ter certeza de que logs de produção não contêm credenciais ou PII
**Para que** um incidente de acesso a logs não se transforme em vazamento de dados

#### Critérios de Aceite
- [ ] `grep -i "bearer\|token\|api.key" logs/` retorna zero matches com valores reais
- [ ] Testes automatizados verificam que payloads de Jira/GitHub são redactados
- [ ] Headers `Authorization`, `Cookie`, `X-API-Key` sempre aparecem como `[REDACTED]`

### Story 2: Debugging sem comprometer dados
**Como** desenvolvedor investigando um bug
**Eu quero** ter contexto suficiente para diagnosticar
**Para que** eu não precise remover sanitização para debugar

#### Critérios de Aceite
- [ ] IDs de issues/PRs aparecem nos logs (para correlação)
- [ ] Mensagens de erro da integração aparecem (status code, tipo de erro)
- [ ] Bodies completos ficam disponíveis apenas em `LOG_LEVEL=trace` em dev

---

## 4. Requisitos Funcionais

### 4.1 Redaction no Pino
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Campos a redactar: `*.password`, `*.token`, `*.apiKey`, `*.apiToken`, `*.pat`, `*.secret`, `*.authorization`, `*.cookie` | Must Have |
| RF-02 | Path recursivo — funciona em qualquer profundidade do objeto | Must Have |
| RF-03 | Valor substituído por `[REDACTED]` (não `undefined`) | Must Have |

### 4.2 Sanitização de HTTP
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-04 | Headers sensíveis removidos antes de logar: Authorization, Cookie, Set-Cookie, X-API-Key | Must Have |
| RF-05 | Request/Response bodies de integrações: logar apenas URL + status + IDs (não body completo) | Must Have |
| RF-06 | Em erros de integração, logar apenas código de erro + mensagem do provider | Must Have |

### 4.3 Sentry Scrubbing
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-07 | `beforeSend` hook remove headers e cookies de eventos | Must Have |
| RF-08 | Request bodies >1KB são truncados | Should Have |
| RF-09 | Campos `password`, `token` em `extra`/`contexts` são redactados | Must Have |

### 4.4 Ambientes
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-10 | Produção: LOG_LEVEL=info, sanitização obrigatória | Must Have |
| RF-11 | Staging: mesma sanitização que produção | Must Have |
| RF-12 | Dev: sanitização ativa mas possível ativar trace via env | Should Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Overhead de logging | < 5% do tempo total da request |
| RNF-02 | Testes de redação | 100% de cobertura dos paths sensíveis |
| RNF-03 | Zero bypass | Mesmo logs diretos (não estruturados) passam pelo filtro |

---

## 6. Implementação

### 6.1 Configuração do Pino

**Localização:** `apps/api/src/shared/logger/logger.ts`

```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',

  redact: {
    paths: [
      // Campos comuns
      'password',
      'passwordHash',
      'token',
      'apiToken',
      'apiKey',
      'api_key',
      'pat',
      'secret',
      'authorization',
      'cookie',

      // Paths aninhados (qualquer profundidade)
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.apiToken',
      '*.apiKey',
      '*.api_key',
      '*.pat',
      '*.secret',

      // Headers HTTP
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      'req.headers["x-auth-token"]',
      'res.headers["set-cookie"]',
      'headers.authorization',
      'headers.cookie',

      // Prisma/DB fields
      '*.jiraApiToken',
      '*.jiraApiTokenCiphertext',
      '*.githubToken',
      '*.githubTokenCiphertext',
      '*.azurePat',
      '*.azurePatCiphertext',
      '*.webhookUrl',
      '*.webhookUrlCiphertext',
      '*.slackBotToken',
      '*.passwordHash',

      // Bodies de integração
      'integration.request.body',
      'integration.response.body',
    ],
    censor: '[REDACTED]',
    remove: false,
  },

  // Serializers customizados
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      // headers omitidos intencionalmente (vão para redact)
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});
```

### 6.2 Interceptor HTTP para Integrações

**Localização:** `apps/api/src/integrations/_shared/http-logger.ts`

```typescript
import { logger } from '../../shared/logger/logger';

interface IntegrationLogContext {
  source: string;           // 'jira' | 'github' | ...
  organizationId: string;
  operation: string;        // 'list_issues' | 'get_pr' | ...
}

export function logIntegrationCall(
  ctx: IntegrationLogContext,
  req: { method: string; url: string },
  res: { status: number; durationMs: number; error?: string },
) {
  // Log SEM body completo, SEM headers, SEM auth
  logger.info({
    integration: {
      source: ctx.source,
      organizationId: ctx.organizationId,
      operation: ctx.operation,
      request: {
        method: req.method,
        // URL sanitizada — remove query strings com tokens
        url: sanitizeUrl(req.url),
      },
      response: {
        status: res.status,
        durationMs: res.durationMs,
        // Apenas mensagem de erro do provider, sem body completo
        error: res.error,
      },
    },
  }, `${ctx.source}.${ctx.operation}`);
}

function sanitizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Remove query params sensíveis
    const sensitive = ['token', 'key', 'api_key', 'access_token'];
    for (const p of sensitive) {
      if (u.searchParams.has(p)) {
        u.searchParams.set(p, '[REDACTED]');
      }
    }
    return u.toString();
  } catch {
    return '[INVALID_URL]';
  }
}
```

### 6.3 Sentry beforeSend

**Localização:** `apps/api/src/shared/observability/sentry.ts`

```typescript
import * as Sentry from '@sentry/node';

const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
];

const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'token',
  'apiToken',
  'apiKey',
  'pat',
  'secret',
];

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  beforeSend(event) {
    // Scrub headers
    if (event.request?.headers) {
      for (const key of Object.keys(event.request.headers)) {
        if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
          event.request.headers[key] = '[REDACTED]';
        }
      }
    }

    // Scrub cookies
    if (event.request?.cookies) {
      event.request.cookies = '[REDACTED]';
    }

    // Scrub request body
    if (event.request?.data && typeof event.request.data === 'object') {
      event.request.data = scrubObject(event.request.data);
    }

    // Scrub extra/contexts
    if (event.extra) event.extra = scrubObject(event.extra);
    if (event.contexts) {
      for (const ctxName of Object.keys(event.contexts)) {
        event.contexts[ctxName] = scrubObject(event.contexts[ctxName]);
      }
    }

    return event;
  },
});

function scrubObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const scrubbed: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => keyLower.includes(s.toLowerCase()))) {
      scrubbed[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      scrubbed[key] = scrubObject(value);
    } else {
      scrubbed[key] = value;
    }
  }
  return scrubbed;
}
```

### 6.4 Testes Automatizados

**Localização:** `apps/api/src/shared/logger/logger.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { logger } from './logger';

describe('Logger Sanitization', () => {
  it('redacts password field', () => {
    const spy = vi.spyOn(process.stdout, 'write');
    logger.info({ password: 'secret123' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[REDACTED]'));
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('secret123'));
  });

  it('redacts authorization header', () => {
    const spy = vi.spyOn(process.stdout, 'write');
    logger.info({
      req: {
        headers: { authorization: 'Bearer abc123xyz' },
      },
    });
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('abc123xyz'));
  });

  it('redacts nested tokens in integration config', () => {
    const spy = vi.spyOn(process.stdout, 'write');
    logger.info({
      org: {
        settings: {
          jiraApiToken: 'ATATT3x...',
          githubToken: 'ghp_xxx',
        },
      },
    });
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('ATATT3x'));
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('ghp_xxx'));
  });

  it('preserves non-sensitive fields', () => {
    const spy = vi.spyOn(process.stdout, 'write');
    logger.info({ userId: 'user_123', operation: 'sync' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('user_123'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('sync'));
  });
});
```

### 6.5 Migração de Logs Existentes

Auditoria inicial a ser executada:

```bash
# Buscar todos os console.log / console.error
grep -rn "console\.\(log\|error\|warn\|info\)" apps/api/src/ apps/web/src/

# Buscar logger.info sem sanitização conhecida
grep -rn "logger\.\(info\|error\|warn\)" apps/api/src/ | grep -v "redact"

# Buscar onde tokens/credenciais são manipulados
grep -rn "apiToken\|apiKey\|\.token\b" apps/api/src/ | grep -v test
```

Para cada ocorrência, garantir que:
1. Não está logando o valor direto
2. Se faz parte de um objeto, os campos sensíveis estão cobertos pelo redact

---

## 7. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| Dev loga `console.log(token)` diretamente | Banido por ESLint rule + PR review |
| Erro não-capturado lança payload no Sentry | `beforeSend` scrub antes do envio |
| Logger chamado com string crua | Redact não aplica (impossível detectar) — banir via lint |
| Stack trace contém valor sensível | Scrubar via `errors.substitutePatterns` do Pino |
| Logs de request de webhook (bodies grandes) | Logar apenas metadata, não body |
| Header case-insensitive (Authorization vs authorization) | Pino redact normaliza |

---

## 8. ESLint Rule Custom

Adicionar regra para impedir `console.log` de variáveis suspeitas:

**Localização:** `.eslintrc.js`

```javascript
module.exports = {
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],

    // Impede console.log de variáveis com nomes suspeitos
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='console'][arguments.0.name=/token|password|secret|apiKey|pat/i]",
        message: 'Never log tokens/passwords/secrets directly',
      },
    ],
  },
};
```

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Dev adiciona log sem sanitização | Alta | Alto | ESLint rule + PR review + treinamento |
| Lib de terceiros loga sem passar pelo logger | Média | Médio | Audit + wrap libs suspeitas |
| Payloads de erro em stacktrace vazam | Média | Alto | Sentry `beforeSend` robusto + testes |
| Logs de dev caírem em staging | Baixa | Médio | LOG_LEVEL forçado por env, CI check |
| Sanitização quebra performance | Baixa | Baixo | Benchmark + amostragem no caminho quente |

---

## 10. Fora de Escopo

- Log retention policy (quanto tempo guardar logs) — fará parte da spec 026
- Centralização de logs (ELK, Datadog) — infra separada
- SIEM para correlação de eventos — enterprise tier
- Logs de acesso a dados específicos (quem viu o quê) — spec 028

---

## 11. Dependências

### Dependências de Features
- Nenhuma — pode ser implementada em paralelo à spec 023

### Dependências Técnicas
- [ ] Pino >= 8.x (já em uso)
- [ ] Sentry SDK configurado
- [ ] Vitest configurado (spec 022 já estabeleceu)

---

## 12. Definition of Done

- [ ] Logger configurado com redact paths completos
- [ ] Serializers customizados para req/res
- [ ] Integration HTTP logger com sanitização de URL
- [ ] Sentry `beforeSend` com scrub de headers/cookies/bodies
- [ ] ESLint rule custom para prevenir console.log de secrets
- [ ] Testes unitários para cada categoria de campo sensível
- [ ] Grep em produção: zero matches de tokens reais
- [ ] Grep em produção: zero matches de `passwordHash` values
- [ ] Documentação em `docs/security/logging.md`
- [ ] CLAUDE.md atualizado com regras de logging
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings

---

## 13. Estimativa

| Fase | Tempo |
|------|-------|
| Configurar Pino redact + serializers | 1h |
| Integration HTTP logger + sanitização | 1h |
| Sentry beforeSend + testes | 1h |
| ESLint custom rule | 0.5h |
| Auditoria de logs existentes + fixes | 1h |
| Testes automatizados | 0.5h |
| **Total** | ~5h |
