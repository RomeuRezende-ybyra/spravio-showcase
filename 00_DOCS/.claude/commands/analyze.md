# /speckit-analyze

Analisa spec, plan e tasks para garantir consistência e compliance.

## Instruções

1. Leia `.specify/memory/constitution.md`
2. Leia os documentos da feature:
   - `specs/[###-feature-name]/spec.md`
   - `specs/[###-feature-name]/plan.md`
   - `specs/[###-feature-name]/tasks.md`

## Checklist de Análise

### Constitution Compliance

- [ ] Tech stack correto (Fastify, Next.js 14, Prisma, etc.)
- [ ] Estrutura de módulos correta (`route.ts | service.ts | repository.ts`)
- [ ] Estrutura de integrations correta (`client.ts | endpoints.ts | mappers.ts`)
- [ ] Redis cache planejado para chamadas externas
- [ ] BullMQ para jobs assíncronos
- [ ] Zod validation em inputs E outputs
- [ ] TypeScript strict (sem `any`)
- [ ] pnpm workspaces (não npm/yarn)

### Spec ↔ Plan Consistency

- [ ] Todos requisitos funcionais têm implementação planejada
- [ ] Todos requisitos não-funcionais têm solução
- [ ] API design no plan corresponde à spec
- [ ] Data model no plan corresponde à spec

### Plan ↔ Tasks Consistency

- [ ] Todos componentes do plan têm tasks
- [ ] Ordem de tasks respeita dependências
- [ ] Nenhuma task órfã (sem correspondência no plan)
- [ ] Tasks cobrem: backend, frontend, types, docs

### Quality Gates

- [ ] Definition of Done claro
- [ ] Testing strategy definida
- [ ] Rollback plan existe
- [ ] Monitoring planejado

## Output

Relatório de análise com:
1. **✅ Compliant** — Itens OK
2. **⚠️ Warnings** — Sugestões de melhoria
3. **❌ Issues** — Problemas que precisam correção

## Exemplo de Uso

```
/speckit-analyze specs/017-shortcut-integration
```

## Ações Corretivas

Se encontrar issues:
1. Liste cada problema
2. Sugira correção
3. Pergunte se deve aplicar automaticamente

## Template de Relatório

```markdown
# Análise: [###-feature-name]

## ✅ Compliant (X itens)
- Constitution tech stack
- Module structure
- ...

## ⚠️ Warnings (X itens)
- [ ] Considerar adicionar rate limit em endpoint X
- [ ] Missing error state em component Y

## ❌ Issues (X itens)
- [ ] **CRÍTICO**: Sem Redis cache em integration call (line Z)
- [ ] Plan menciona endpoint não especificado na spec

## Recomendações
1. ...
2. ...
```
