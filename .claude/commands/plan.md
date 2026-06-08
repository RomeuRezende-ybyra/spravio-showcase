# /speckit-plan — Criar Plano Técnico

## Instrução

Crie um plano técnico de implementação para uma feature já especificada.

### Input
- Caminho da feature: `specs/[###-feature-name]` (argumento do comando)

### Passos

1. **Leia os arquivos de contexto**:
   - `.specify/memory/constitution.md` — Princípios inegociáveis
   - `.specify/memory/research.md` — Estado atual do codebase
   - `.specify/templates/plan-template.md` — Template do plano
   - `specs/[###-feature-name]/spec.md` — Spec da feature

2. **Analise o código existente**:
   - Leia TODOS os arquivos listados em "Arquivos Impactados" na spec
   - Entenda a arquitetura atual antes de propor mudanças
   - Identifique dependências entre componentes

3. **Crie o plano**:
   - Crie `specs/[###-feature-name]/plan.md` usando o template
   - Defina fases de implementação com ordem lógica
   - Documente decisões de arquitetura com justificativas
   - Liste mudanças de schema, API, e dependências
   - Inclua plano de rollback

4. **Valide**:
   - O plano deve seguir os princípios da constitution.md
   - Cada mudança deve ser rastreável a um requisito da spec
   - Fases devem ser incrementais e testáveis

### Output
- Arquivo `specs/[###-feature-name]/plan.md` criado
- Resumo das decisões técnicas principais

### Regras
- SEMPRE leia a spec completa antes de planejar
- SEMPRE leia o código existente antes de propor mudanças
- NUNCA proponha tecnologias fora da stack aprovada
- NUNCA ignore a Definition of Done
- Prefira mudanças incrementais a reescritas
