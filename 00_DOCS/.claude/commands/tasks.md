# /speckit-tasks

Decompõe um plano técnico em tarefas executáveis e ordenadas.

## Pré-requisitos

- Plan existe em `specs/[###-feature-name]/plan.md`
- Plan foi revisado

## Instruções

1. Leia `.specify/memory/constitution.md` — regras de Definition of Done
2. Leia `specs/[###-feature-name]/spec.md` — requisitos
3. Leia `specs/[###-feature-name]/plan.md` — arquitetura planejada
4. Leia `.specify/templates/tasks-template.md` — formato esperado

## Workflow

1. **Decomponha** o plan em fases:
   - Fase 1: Infrastructure / Setup (migrations, schemas)
   - Fase 2: Backend — Repository Layer
   - Fase 3: Backend — Service Layer
   - Fase 4: Backend — Integration Layer (se aplicável)
   - Fase 5: Backend — Route Layer
   - Fase 6: Backend — Jobs (se aplicável)
   - Fase 7: Frontend — API Client
   - Fase 8: Frontend — Components
   - Fase 9: Frontend — Pages
   - Fase 10: Quality Assurance
   - Fase 11: Documentation

2. **Marque** dependências:
   - `[P]` — Pode executar em paralelo
   - `[S]` — Sequencial (depende de anteriores)
   - `[B]` — Blocker (outras dependem desta)

3. **Especifique** cada task:
   - Arquivo(s) a criar/modificar
   - O que implementar
   - Verificação de completude

4. **Gere** o documento `tasks.md`

## Output

Arquivo: `specs/[###-feature-name]/tasks.md`

## Formato de Task

```markdown
### T001: [Título]
**Tipo**: Backend/Frontend/Types/Docs
**Arquivo**: `path/to/file.ts`

Implementar:
- [ ] Item 1
- [ ] Item 2

**Verificação**: [Como saber que está completo]
```

## Regras de Ordenação

1. Migrations antes de tudo
2. Types/Schemas antes de implementation
3. Repository antes de Service
4. Service antes de Route
5. Backend antes de Frontend
6. Components antes de Pages
7. Implementation antes de Tests
8. Tests antes de Documentation

## Exemplo de Uso

```
/speckit-tasks specs/017-shortcut-integration
```

Gera: `specs/017-shortcut-integration/tasks.md`
