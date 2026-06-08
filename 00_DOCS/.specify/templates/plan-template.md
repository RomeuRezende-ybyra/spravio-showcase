# Technical Plan Template

> Plano técnico de implementação. Preencher após spec aprovada.
> Referência: specs/[###-feature]/spec.md

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature** | [###-feature-name] |
| **Spec** | [link para spec.md] |
| **Branch** | [###-feature-name] |
| **Data** | [PREENCHER] |

---

## 1. Resumo Técnico

[PREENCHER: Visão geral da abordagem técnica em 2-3 parágrafos]

---

## 2. Arquitetura

### Diagrama de Componentes
```
[Desenhar ou descrever o fluxo de dados entre componentes]

Frontend → API Route → Service → Repository → Database
                    ↓
              Integration → External API
```

### Decisões Arquiteturais

| Decisão | Opções Consideradas | Escolha | Justificativa |
|---------|-------------------|---------|---------------|
| [Decisão] | A, B, C | B | [Por quê?] |

---

## 3. Estrutura de Arquivos

### Backend
```
apps/api/src/
├── modules/
│   └── [feature]/
│       ├── route.ts         # [descrição]
│       ├── service.ts       # [descrição]
│       ├── repository.ts    # [descrição]
│       └── types.ts         # [descrição]
├── integrations/
│   └── [service]/           # (se necessário)
│       ├── client.ts
│       ├── endpoints.ts
│       ├── mappers.ts
│       └── types.ts
└── jobs/
    └── [job].job.ts         # (se necessário)
```

### Frontend
```
apps/web/src/
├── app/
│   └── [route]/
│       ├── page.tsx         # [descrição]
│       ├── loading.tsx      # Loading state
│       └── error.tsx        # Error boundary
├── components/
│   └── [component]/
│       ├── index.tsx
│       └── types.ts
└── lib/
    └── api/
        └── [feature].ts     # API client methods
```

### Packages
```
packages/types/src/
└── [feature].ts             # Zod schemas + types
```

---

## 4. Data Model

### Novas Migrations
```bash
pnpm --filter api prisma migrate dev --name [migration-name]
```

### Schema Changes
```prisma
// [Copiar do spec.md e adicionar detalhes de implementação]
```

### Índices Necessários
```prisma
@@index([field1, field2])
```

---

## 5. API Implementation

### Route: `[METHOD] /path`

#### Handler
```typescript
// route.ts
app.post('/path', {
  schema: {
    body: InputSchema,
    response: { 200: OutputSchema }
  },
  preHandler: [authGuard(['OWNER', 'PROJECT_MANAGER'])],
  handler: async (request, reply) => {
    const result = await service.method(request.body);
    return reply.send(result);
  }
});
```

#### Service
```typescript
// service.ts
export async function method(input: Input): Promise<Output> {
  // 1. Validação de negócio
  // 2. Chamadas a integrations (se necessário)
  // 3. Persistência via repository
  // 4. Retorno tipado
}
```

#### Repository
```typescript
// repository.ts
export async function create(data: CreateInput) {
  return prisma.model.create({ data });
}
```

---

## 6. Integrations (se aplicável)

### External API: [Nome]

#### Client Setup
```typescript
// client.ts
const client = axios.create({
  baseURL: process.env.SERVICE_URL,
  headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` }
});
```

#### Endpoints
| Método | Endpoint | Cache TTL |
|--------|----------|-----------|
| GET | /resource | 300s |
| POST | /resource | No cache |

#### Rate Limiting
```typescript
const limiter = pLimit(10); // [justificativa]
```

---

## 7. Background Jobs (se aplicável)

### Job: [nome].job.ts

| Campo | Valor |
|-------|-------|
| Queue | [queue-name] |
| Trigger | Cron / Event / Manual |
| Retry | [estratégia] |
| Timeout | [tempo] |

```typescript
// Estrutura do processor
const processor = async (job: Job<JobData>) => {
  // 1. Log início
  // 2. Processar
  // 3. Log fim / erro
};
```

---

## 8. Frontend Implementation

### Page: `/route`

| Aspecto | Detalhes |
|---------|----------|
| Type | Server / Client Component |
| Data Fetching | [método] |
| State | [local/global] |

### Components

| Componente | Tipo | Props |
|------------|------|-------|
| [Nome] | Server/Client | [props principais] |

### API Client
```typescript
// lib/api/[feature].ts
export async function fetchData(): Promise<ResponseType> {
  return apiClient.get('/endpoint');
}
```

---

## 9. Caching Strategy

| Recurso | Tipo | TTL | Invalidação |
|---------|------|-----|-------------|
| [Recurso] | Redis | 300s | [Quando invalidar] |

---

## 10. Error Handling

| Erro | Código | Mensagem User | Log Level |
|------|--------|--------------|-----------|
| Validação | 400 | "Invalid input" | warn |
| Auth | 401 | "Please log in" | info |
| Permission | 403 | "Access denied" | warn |
| Not Found | 404 | "Not found" | info |
| Internal | 500 | "Something went wrong" | error |

---

## 11. Testing Strategy

### Unit Tests
- [ ] Service methods
- [ ] Mappers
- [ ] Validators

### Integration Tests
- [ ] API routes
- [ ] Database operations

### E2E Tests
- [ ] Critical user flows

---

## 12. Rollback Plan

| Cenário | Ação |
|---------|------|
| Migration falha | `prisma migrate resolve` |
| Bug crítico | Revert commit, redeploy |
| Performance degradada | Feature flag off |

---

## 13. Monitoring

### Logs
- [ ] Request/response logging
- [ ] Error logging com stack trace
- [ ] Performance metrics

### Alerts
- [ ] Error rate > X%
- [ ] Latency > Yms
- [ ] [Outros alertas específicos]

---

## 14. Checklist Pré-Implementação

- [ ] Constitution compliance verificado
- [ ] Spec aprovada
- [ ] Data model revisado
- [ ] API contracts definidos
- [ ] Dependencies disponíveis
- [ ] Environment variables documentadas

---

## Arquivos de Saída

Após `/speckit.plan`, este documento gera:
- `plan.md` — Este arquivo
- `research.md` — Pesquisa técnica (se necessário)
- `data-model.md` — Schema detalhado (se complex)
- `contracts/` — OpenAPI specs (se necessário)
