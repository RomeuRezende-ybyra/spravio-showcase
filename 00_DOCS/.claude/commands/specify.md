# /speckit-specify

Cria uma especificação estruturada para uma nova feature.

## Instruções

1. Leia `.specify/memory/constitution.md` para entender os princípios do projeto
2. Leia `.specify/memory/research.md` para contexto do codebase atual
3. Leia `.specify/templates/spec-template.md` para o formato esperado

## Workflow

1. **Analise** o pedido do usuário e identifique:
   - Qual problema está sendo resolvido
   - Quem são os usuários afetados
   - Quais são os requisitos funcionais
   - Quais são os requisitos não-funcionais

2. **Crie** a estrutura de feature:
   ```bash
   mkdir -p specs/[###-feature-name]
   ```
   
3. **Gere** o documento `spec.md` baseado no template

4. **Faça perguntas** se houver ambiguidades:
   - Escopo não claro
   - Comportamentos de edge case
   - Prioridades conflitantes

## Output

Arquivo: `specs/[###-feature-name]/spec.md`

## Verificação

Antes de finalizar, verifique:
- [ ] Constitution compliance (princípios respeitados)
- [ ] User stories claras e testáveis
- [ ] Requisitos específicos e mensuráveis
- [ ] API design consistente com padrões existentes
- [ ] Data model compatível com schema atual

## Exemplo de Uso

```
/speckit-specify Adicionar suporte a Shortcut (formerly Clubhouse) como nova fonte de PM
```

Gera: `specs/017-shortcut-integration/spec.md`
