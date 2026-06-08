# /speckit-implement

Implementa as tarefas definidas em tasks.md, uma por uma.

## Pré-requisitos

- Tasks existe em `specs/[###-feature-name]/tasks.md`
- Você está na branch correta: `git checkout [###-feature-name]`

## Instruções

1. Leia `.specify/memory/constitution.md` — princípios obrigatórios
2. Leia `specs/[###-feature-name]/spec.md` — requisitos
3. Leia `specs/[###-feature-name]/plan.md` — arquitetura
4. Leia `specs/[###-feature-name]/tasks.md` — lista de tarefas

## Workflow

1. **Identifique** a próxima task pendente (⬜)

2. **Verifique** dependências:
   - Todas tasks `[B]` anteriores estão ✅?
   - Tasks `[S]` anteriores na mesma fase estão ✅?

3. **Implemente** a task:
   - Crie/modifique os arquivos especificados
   - Siga os padrões da Constitution
   - Sem `any`, sem `console.log`

4. **Verifique**:
   ```bash
   pnpm typecheck
   pnpm lint
   ```

5. **Atualize** tasks.md:
   - Mude `⬜` para `✅`

6. **Commit**:
   ```bash
   git add .
   git commit -m "feat([feature]): T0XX - [descrição]"
   ```

7. **Repita** até todas tasks ✅

## Regras de Implementação

### Backend
```typescript
// SEMPRE validar input com Zod
const parsed = InputSchema.parse(request.body);

// SEMPRE tipar output
const result: OutputType = await service.method(parsed);

// NUNCA usar any
// NUNCA usar console.log (usar logger)
// SEMPRE cache em chamadas externas
```

### Frontend
```typescript
// Server Components por padrão
// "use client" só quando necessário

// SEMPRE ter loading.tsx
// SEMPRE ter error.tsx

// NUNCA fetch no client se pode ser server
```

### Integrations
```typescript
// SEMPRE seguir pattern:
// client.ts → endpoints.ts → mappers.ts

// SEMPRE rate limit
const limiter = pLimit(10);

// SEMPRE cache Redis TTL 300s
const cached = await redis.get(key);
```

## Exemplo de Uso

```
/speckit-implement specs/017-shortcut-integration
```

Implementa próxima task pendente.

```
/speckit-implement specs/017-shortcut-integration T005
```

Implementa task específica T005.

## Verificação Final

Após todas tasks ✅:

```bash
pnpm typecheck        # 0 errors
pnpm lint            # 0 warnings
pnpm test            # (se existir)
```

## Atualização CLAUDE.md

Ao final, atualize CLAUDE.md:
- Marque a fase como COMPLETE
- Adicione novas env vars
- Atualize lista de models/routes
