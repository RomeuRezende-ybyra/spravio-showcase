# Spec: Password Security (bcrypt)

> ID: 017-password-security
> Status: Approved
> Autor: Claude
> Data: 2026-04-04

---

## Problema

Senhas de usuários são armazenadas e comparadas em **plaintext** no campo `passwordHash` do model `User`. Isso é uma vulnerabilidade de segurança **crítica** — qualquer acesso ao banco de dados (leak, backup, SQL injection) expõe todas as senhas.

**Localização atual:**
- Login: `apps/api/src/modules/auth/route.ts:40` — comparação direta `user.passwordHash !== password`
- Registro: `apps/api/src/modules/auth/route.ts:92` — armazena `passwordHash: password` (plaintext)

**Impacto**: Crítico. Afeta todos os usuários existentes e novos registros.

---

## Solução Proposta

Substituir o armazenamento e comparação de senhas plaintext por **bcrypt** hashing:
- Novos registros: hash com bcrypt antes de salvar
- Login: usar `bcrypt.compare()` em vez de comparação direta
- Usuários existentes: migração transparente no próximo login (re-hash)

---

## Escopo

### Incluído
- Instalar `bcrypt` (ou `bcryptjs` para compatibilidade)
- Alterar registro para fazer hash da senha
- Alterar login para usar `bcrypt.compare()`
- Migração transparente de senhas existentes (re-hash no login)
- Enforcement de senha forte via Zod (min 8 chars, já é min 6)

### Excluído
- Reset de senha / forgot password (feature separada)
- 2FA / MFA (feature separada)
- Rate limiting no login (feature separada)
- Migração forçada de todos os usuários (re-hash é no login)

---

## Requisitos

### Funcionais
1. **[RF-01]** Novos registros DEVEM armazenar senha como bcrypt hash (cost factor 12)
2. **[RF-02]** Login DEVE usar `bcrypt.compare()` para validar senha
3. **[RF-03]** Senhas plaintext existentes DEVEM ser re-hashed transparentemente no próximo login bem-sucedido
4. **[RF-04]** Senha DEVE ter mínimo 8 caracteres (upgrade de 6)
5. **[RF-05]** O campo `passwordHash` no frontend NUNCA deve receber a senha raw — apenas o backend processa

### Não-funcionais
1. **[RNF-01]** bcrypt hash não deve adicionar mais que 300ms ao login
2. **[RNF-02]** A migração de senhas existentes deve ser transparente (sem downtime, sem ação do usuário)
3. **[RNF-03]** Nenhuma senha plaintext deve permanecer após o usuário fazer login pela primeira vez pós-deploy

---

## Arquivos Impactados

| Arquivo | Tipo de mudança |
|---------|----------------|
| `apps/api/src/modules/auth/route.ts` | Modificação — login + register |
| `apps/api/package.json` | Modificação — adicionar bcryptjs |
| `apps/web/src/app/(auth)/register/page.tsx` | Modificação — validação min 8 chars |
| `packages/types/src/index.ts` | Possível — schema de registro se existir |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Usuários existentes não conseguem fazer login após deploy | Login detecta plaintext vs hash e faz re-hash transparente |
| bcrypt é lento em CI/testes | Usar cost factor 12 (prod) — aceitável ~250ms |
| bcryptjs vs bcrypt nativo (binding issues no Windows/Docker) | Usar `bcryptjs` (JavaScript puro, sem native bindings) |
| Campo `passwordHash` pode ser null (OAuth users) | Já tratado — `if (!user.passwordHash)` existe no login |

---

## Definition of Done

- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm lint` — 0 warnings
- [ ] Registro salva bcrypt hash (não plaintext)
- [ ] Login usa `bcrypt.compare()`
- [ ] Senhas plaintext existentes são re-hashed no login
- [ ] Validação de senha: mínimo 8 caracteres
- [ ] Comentário "Dev: plaintext comparison" removido
- [ ] Nenhuma senha raw transita além do handler de auth

---

## Notas

- bcrypt hash começa com `$2a$` ou `$2b$` — usado para detectar se o valor é plaintext ou hash
- Cost factor 12 = ~250ms por hash — bom trade-off segurança/performance
- `bcryptjs` é preferível a `bcrypt` nativo para evitar problemas com native bindings no Windows e Docker Alpine
- Seed data (owner@spravio.dev, pm@spravio.dev, viewer@spravio.dev) também precisa ser atualizado se existir em fixtures/seeds
