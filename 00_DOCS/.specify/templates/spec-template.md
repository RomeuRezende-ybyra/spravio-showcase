# Feature Specification Template

> Use este template para especificar novas features antes de implementar.
> Preencha todas as seções marcadas com `[PREENCHER]`.

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | [###-feature-name] |
| **Branch** | [###-feature-name] |
| **Autor** | [PREENCHER] |
| **Data** | [PREENCHER] |
| **Status** | Draft / In Review / Approved |

---

## 1. Resumo

[PREENCHER: 2-3 frases descrevendo o que esta feature faz e por que é necessária]

---

## 2. Motivação

### Problema
[PREENCHER: Qual problema esta feature resolve?]

### Impacto
[PREENCHER: Quem é afetado e como isso melhora a experiência?]

### Métricas de Sucesso
- [ ] [PREENCHER: Como medimos se foi bem sucedido?]
- [ ] [PREENCHER: KPIs específicos]

---

## 3. User Stories

### Story 1: [Título]
**Como** [tipo de usuário]
**Eu quero** [ação]
**Para que** [benefício]

#### Critérios de Aceite
- [ ] [Critério específico e testável]
- [ ] [Critério específico e testável]

### Story 2: [Título]
**Como** [tipo de usuário]
**Eu quero** [ação]
**Para que** [benefício]

#### Critérios de Aceite
- [ ] [Critério específico e testável]

---

## 4. Requisitos Funcionais

### 4.1 [Área funcional]
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | [Descrição] | Must Have |
| RF-02 | [Descrição] | Should Have |

### 4.2 [Área funcional]
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-03 | [Descrição] | Must Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Performance | [ex: resposta < 200ms p95] |
| RNF-02 | Segurança | [ex: auth required] |
| RNF-03 | Disponibilidade | [ex: 99.9% uptime] |

---

## 6. API Design

### Novos Endpoints

#### `[METHOD] /path/to/endpoint`
**Auth**: [Required role ou Public]

**Request**:
```typescript
{
  field: string;
  optionalField?: number;
}
```

**Response 200**:
```typescript
{
  id: string;
  data: object;
}
```

**Errors**:
| Code | Descrição |
|------|-----------|
| 400 | Validação falhou |
| 401 | Não autenticado |
| 403 | Sem permissão |

---

## 7. Data Model

### Novos Models
```prisma
model NewModel {
  id        String   @id @default(cuid())
  field     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Alterações em Models Existentes
```prisma
model ExistingModel {
  // Adicionar:
  newField String?
}
```

---

## 8. UI/UX

### Wireframes
[PREENCHER: Descrição ou link para wireframes]

### Componentes Necessários
- [ ] `ComponentName` — [descrição]
- [ ] `AnotherComponent` — [descrição]

### Estados da UI
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Success state

---

## 9. Integrações

### APIs Externas
| Serviço | Endpoint | Propósito |
|---------|----------|-----------|
| [Nome] | [URL] | [Para que?] |

### Webhooks
| Evento | Payload | Handler |
|--------|---------|---------|
| [Evento] | [Estrutura] | [Onde processa] |

---

## 10. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| [Cenário edge case] | [O que deve acontecer] |
| [Outro cenário] | [O que deve acontecer] |

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| [Risco] | Alto/Médio/Baixo | Alto/Médio/Baixo | [Como mitigar] |

---

## 12. Fora de Escopo

Explicitamente NÃO será implementado nesta feature:
- [Item fora de escopo]
- [Outro item]

---

## 13. Dependências

### Dependências de Features
- [ ] Feature [ID] deve estar completa

### Dependências Técnicas
- [ ] [Biblioteca/serviço] deve estar configurado

---

## 14. Checklist de Aprovação

- [ ] Constitution revisada e compliance verificado
- [ ] User stories claras e testáveis
- [ ] API design aprovado
- [ ] Data model revisado
- [ ] Security review (se aplicável)
- [ ] UX review (se aplicável)

---

## Aprovações

| Papel | Nome | Data | Status |
|-------|------|------|--------|
| Product Owner | | | Pending |
| Tech Lead | | | Pending |
| Security (se req.) | | | N/A |
