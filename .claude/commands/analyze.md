# /speckit-analyze — Validar Consistência

## Instrução

Valide a consistência entre spec, plan e tasks de uma feature.

### Input
- Caminho da feature: `specs/[###-feature-name]` (argumento do comando)

### Passos

1. **Leia todos os artefatos**:
   - `.specify/memory/constitution.md` — Princípios inegociáveis
   - `specs/[###-feature-name]/spec.md`
   - `specs/[###-feature-name]/plan.md`
   - `specs/[###-feature-name]/tasks.md`

2. **Valide spec → plan**:
   - Todo requisito da spec tem implementação no plano?
   - O plano respeita os princípios da constitution?
   - Decisões de arquitetura são justificadas?
   - Dependências externas são necessárias?

3. **Valide plan → tasks**:
   - Toda fase do plano tem tarefas correspondentes?
   - As tarefas cobrem todas as mudanças do plano?
   - Dependências entre tarefas são corretas?
   - Estimativas são razoáveis?

4. **Valide contra codebase**:
   - Arquivos referenciados existem?
   - Imports e tipos referenciados são válidos?
   - Não há conflitos com trabalho recente?

5. **Gere relatório**:
   - Lista de issues encontrados (BLOCKER / WARNING / INFO)
   - Sugestões de melhoria
   - Aprovação ou rejeição com motivo

### Output
- Relatório de análise no terminal
- Status: APPROVED / NEEDS_REVISION

### Regras
- Seja rigoroso mas justo
- BLOCKERs impedem implementação
- WARNINGs devem ser revisados mas não bloqueiam
- SEMPRE verifique o codebase real, não assuma
