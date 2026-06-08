# /speckit-specify — Criar Especificação de Feature

## Instrução

Crie uma especificação de feature seguindo o workflow SDD (Spec-Driven Development).

### Input
- Descrição da feature (argumento do comando)

### Passos

1. **Leia os arquivos de contexto**:
   - `.specify/memory/constitution.md` — Princípios inegociáveis
   - `.specify/memory/research.md` — Estado atual do codebase
   - `.specify/templates/spec-template.md` — Template da spec

2. **Determine o próximo ID de feature**:
   - Liste `specs/` para encontrar o maior número existente
   - Incremente: `[###-feature-name]`

3. **Crie a spec**:
   - Crie `specs/[###-feature-name]/spec.md` usando o template
   - Preencha todos os campos baseado na descrição e no estado do codebase
   - Identifique arquivos impactados lendo o código existente
   - Liste riscos e mitigações reais

4. **Valide**:
   - A spec deve ser completa e acionável
   - Todos os arquivos referenciados devem existir
   - Escopo deve ser claro (incluído vs excluído)

### Output
- Arquivo `specs/[###-feature-name]/spec.md` criado
- Resumo do que foi especificado

### Regras
- SEMPRE leia constitution.md antes de escrever
- SEMPRE verifique o estado atual do código antes de listar impactos
- NUNCA invente funcionalidades que não foram pedidas
- Mantenha o escopo focado e realizável
