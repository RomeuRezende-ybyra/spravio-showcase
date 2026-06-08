# /speckit-implement — Implementar Tarefas

## Instrução

Implemente as tarefas de uma feature seguindo o plano técnico aprovado.

### Input
- Caminho da feature: `specs/[###-feature-name]` (argumento do comando)

### Passos

1. **Leia todos os artefatos**:
   - `.specify/memory/constitution.md` — Princípios inegociáveis
   - `specs/[###-feature-name]/spec.md`
   - `specs/[###-feature-name]/plan.md`
   - `specs/[###-feature-name]/tasks.md`

2. **Para cada tarefa (em ordem de dependência)**:
   a. Leia o código atual do(s) arquivo(s) alvo
   b. Implemente a mudança descrita na tarefa
   c. Verifique que a mudança está consistente com o plano
   d. Marque a tarefa como completa no `tasks.md`

3. **Após cada fase**:
   - Execute `pnpm typecheck` — deve passar com 0 errors
   - Execute `pnpm lint` — deve passar com 0 warnings
   - Corrija qualquer erro antes de prosseguir

4. **Ao finalizar**:
   - Atualize `tasks.md` com status final
   - Atualize `.specify/memory/research.md` se estado mudou
   - Verifique Definition of Done da spec

### Output
- Código implementado conforme o plano
- `tasks.md` atualizado com progresso
- Relatório final de implementação

### Regras
- NUNCA pule uma tarefa sem motivo documentado
- NUNCA implemente algo fora do escopo das tasks
- SEMPRE siga a ordem de dependência
- SEMPRE execute typecheck/lint entre fases
- Se encontrar um problema, PARE e reporte ao usuário
- NUNCA faça commit automático — aguarde instrução do usuário
