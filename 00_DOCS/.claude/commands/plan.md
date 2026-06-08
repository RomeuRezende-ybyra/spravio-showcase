# /speckit-plan

Cria um plano técnico de implementação baseado em uma spec aprovada.

## Pré-requisitos

- Spec existe em `specs/[###-feature-name]/spec.md`
- Spec foi revisada e está aprovada

## Instruções

1. Leia `.specify/memory/constitution.md` — princípios inegociáveis
2. Leia `.specify/memory/research.md` — estado atual do codebase
3. Leia `specs/[###-feature-name]/spec.md` — especificação da feature
4. Leia `.specify/templates/plan-template.md` — formato esperado

## Workflow

1. **Analise** a spec e identifique:
   - Componentes backend necessários (modules, integrations, jobs)
   - Componentes frontend necessários (pages, components)
   - Mudanças de schema (Prisma models)
   - Integrações externas

2. **Pesquise** se necessário:
   - APIs externas (documentação)
   - Bibliotecas recomendadas
   - Padrões existentes no codebase

3. **Decida** arquitetura:
   - Estrutura de arquivos
   - Estratégia de cache
   - Error handling
   - Testing strategy

4. **Gere** o documento `plan.md` baseado no template

## Output

Arquivos gerados:
- `specs/[###-feature-name]/plan.md` — Plano técnico principal
- `specs/[###-feature-name]/research.md` — Pesquisa técnica (se necessário)
- `specs/[###-feature-name]/data-model.md` — Schema detalhado (se complexo)

## Verificação

Antes de finalizar, verifique:
- [ ] Segue estrutura `route.ts | service.ts | repository.ts`
- [ ] Segue estrutura de integrations `client.ts | endpoints.ts | mappers.ts`
- [ ] Redis cache em todas chamadas externas
- [ ] BullMQ para jobs assíncronos
- [ ] Zod validation em inputs E outputs
- [ ] Loading/error states planejados
- [ ] Migration path claro
- [ ] Rollback plan definido

## Exemplo de Uso

```
/speckit-plan specs/017-shortcut-integration
```

Gera: `specs/017-shortcut-integration/plan.md`
