# Feature Specification: Password Security

> 🔴 CRÍTICO: Implementar hash de senhas com bcrypt

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 017-password-security |
| **Branch** | `fix/017-password-security` |
| **Prioridade** | 🔴 CRÍTICA |
| **Data** | 2026-04-04 |
| **Status** | Ready for Implementation |

---

## 1. Resumo

Senhas estão armazenadas em plaintext no banco de dados (`modules/auth/route.ts:40`). Esta feature implementa hash seguro com bcrypt, validação de força de senha, e migração transparente de senhas existentes.

---

## 2. Motivação

### Problema
Senhas em plaintext representam risco crítico de segurança. Se o banco for comprometido, todas as credenciais são expostas imediatamente.

### Impacto
- **Todos os usuários** estão em risco
- **Compliance** violado (LGPD, SOC2, etc.)
- **Reputação** em risco se houver vazamento

### Métricas de Sucesso
- [ ] 100% das senhas hasheadas com bcrypt (cost factor 12)
- [ ] Nenhuma senha plaintext no banco
- [ ] Tempo de login < 500ms (incluindo hash verification)
- [ ] Zero downtime na migração

---

## 3. User Stories

### Story 1: Login Seguro
**Como** usuário autenticado
**Eu quero** que minha senha seja armazenada de forma segura
**Para que** minha conta esteja protegida mesmo em caso de vazamento de dados

#### Critérios de Aceite
- [ ] Senha hasheada com bcrypt antes de salvar
- [ ] Hash verification no login
- [ ] Não é possível recuperar senha original do hash

### Story 2: Registro com Senha Forte
**Como** novo usuário
**Eu quero** feedback sobre a força da minha senha
**Para que** eu crie uma senha segura

#### Critérios de Aceite
- [ ] Mínimo 8 caracteres
- [ ] Pelo menos 1 maiúscula, 1 minúscula, 1 número
- [ ] Feedback visual de força (fraca/média/forte)
- [ ] Mensagem de erro clara se não atender requisitos

### Story 3: Migração Transparente
**Como** usuário existente
**Eu quero** continuar logando normalmente após a migração
**Para que** eu não precise redefinir minha senha

#### Critérios de Aceite
- [ ] Migração automática no próximo login
- [ ] Nenhuma ação requerida do usuário
- [ ] Fallback: verificar plaintext → hashear → login

---

## 4. Requisitos Funcionais

### 4.1 Hash de Senha
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Usar bcrypt com cost factor 12 | Must Have |
| RF-02 | Hash no registro antes de salvar | Must Have |
| RF-03 | Verificação de hash no login | Must Have |
| RF-04 | Migração de senhas plaintext existentes | Must Have |

### 4.2 Validação de Força
| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-05 | Mínimo 8 caracteres | Must Have |
| RF-06 | Mix de maiúsculas/minúsculas/números | Should Have |
| RF-07 | Indicador visual de força | Should Have |
| RF-08 | Bloquear senhas comuns (top 1000) | Could Have |

---

## 5. Requisitos Não-Funcionais

| ID | Requisito | Métrica |
|----|-----------|---------|
| RNF-01 | Performance | Hash < 300ms, verify < 300ms |
| RNF-02 | Segurança | bcrypt cost 12 (resistente a brute force) |
| RNF-03 | Migração | Zero downtime, backwards compatible |
| RNF-04 | Auditoria | Log de migração (sem expor senhas) |

---

## 6. API Design

### Endpoints Afetados (não novos)

#### `POST /auth/register`
**Mudança**: Hash senha antes de salvar

**Request** (sem mudança):
```typescript
{
  email: string;
  password: string;
  name: string;
}
```

**Response** (sem mudança):
```typescript
{
  token: string;
  user: { id, email, name }
}
```

#### `POST /auth/login`
**Mudança**: Verificar hash (com fallback para migração)

**Request** (sem mudança):
```typescript
{
  email: string;
  password: string;
}
```

---

## 7. Data Model

### Alterações em Models Existentes

```prisma
model User {
  // Existente (será hasheado):
  passwordHash String  // Renomear de 'password' para clareza
  
  // Novo campo para tracking de migração:
  passwordMigrated Boolean @default(false)
}
```

**Migration necessária**: Rename column + add boolean field

---

## 8. Lógica de Migração

```
Login Request
     │
     ▼
┌────────────────┐
│ User exists?   │──No──▶ 401 Unauthorized
└───────┬────────┘
        │ Yes
        ▼
┌────────────────┐
│ passwordMigrated │──Yes──▶ bcrypt.compare()
└───────┬────────┘
        │ No (legacy)
        ▼
┌────────────────┐
│ plaintext ==   │──No──▶ 401 Unauthorized
│ passwordHash?  │
└───────┬────────┘
        │ Yes (legacy match)
        ▼
┌────────────────┐
│ Hash + Update  │
│ Set migrated   │
└───────┬────────┘
        │
        ▼
    Return JWT
```

---

## 9. UI/UX

### Componentes Necessários
- [ ] `PasswordStrengthIndicator` — barra visual de força
- [ ] `PasswordInput` — input com toggle show/hide

### Estados
- Força: weak (red) / medium (yellow) / strong (green)
- Validação: mensagens inline específicas

---

## 10. Casos de Borda

| Cenário | Comportamento Esperado |
|---------|----------------------|
| Senha plaintext existente | Migrar silenciosamente no login |
| Usuário nunca loga após deploy | Senha permanece plaintext até próximo login |
| Hash corrompido | Log error + 401 (usuário usa "esqueci senha") |
| bcrypt failure | Log error + 500 + alert Sentry |

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Performance degradada | Baixa | Médio | bcrypt async, cost factor testado |
| Migração falha | Baixa | Alto | Fallback plaintext, rollback plan |
| Senhas fracas passam | Média | Médio | Validação server-side obrigatória |

---

## 12. Fora de Escopo

- [ ] Reset de senha por email (feature separada)
- [ ] 2FA / MFA (feature separada)
- [ ] Password manager integration
- [ ] Breach detection (HaveIBeenPwned)

---

## 13. Dependências

### Dependências Técnicas
- [ ] `bcrypt` ou `bcryptjs` library

---

## 14. Checklist de Aprovação

- [x] Constitution revisada — usa libs permitidas
- [x] User stories claras e testáveis
- [x] API design compatível (sem breaking changes)
- [x] Data model migration path claro
- [ ] Security review — **PENDENTE**

---

## Aprovações

| Papel | Nome | Data | Status |
|-------|------|------|--------|
| Product Owner | | | Pending |
| Tech Lead | | | Pending |
| Security | | | **Required** |
