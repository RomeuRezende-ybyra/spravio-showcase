# /speckit-tasks — Decompor em Tarefas

## Instrução

Decomponha um plano técnico aprovado em tarefas atômicas e executáveis.

### Input
- Caminho da feature: `specs/[###-feature-name]` (argumento do comando)

### Passos

1. **Leia os arquivos de contexto**:
   - `.specify/memory/constitution.md` — Princípios inegociáveis
   - `specs/[###-feature-name]/spec.md` — Spec da feature
   - `specs/[###-feature-name]/plan.md` — Plano técnico
   - `.specify/templates/tasks-template.md` — Template de tarefas

2. **Decomponha o plano**:
   - Cada fase do plano vira um grupo de tarefas
   - Cada tarefa deve ser atômica (uma mudança, um arquivo)
   - Identifique dependências entre tarefas
   - Estime tamanho (P = < 30 min, M = 30-60 min, G = > 60 min)

3. **Crie o arquivo de tarefas**:
   - Crie `specs/[###-feature-name]/tasks.md` usando o template
   - Numere tarefas sequencialmente (T-01, T-02, ...)
   - Inclua arquivo(s) específicos por tarefa
   - Defina critérios de aceitação globais

4. **Valide**:
   - Toda tarefa deve mapear a algo no plano
   - Dependências devem formar um DAG (sem ciclos)
   - Critérios de aceitação devem ser verificáveis

### Output
- Arquivo `specs/[###-feature-name]/tasks.md` criado
- Contagem total de tarefas por fase

### Regras
- NUNCA crie tarefas vagas ("melhorar X")
- SEMPRE especifique arquivo(s) e mudança concreta
- SEMPRE inclua dependências explícitas
- Tarefas devem ser executáveis por qualquer dev que leia o contexto
