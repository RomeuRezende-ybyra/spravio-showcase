# Plan: Password Security (bcrypt)

> Spec: 017-password-security
> Status: Draft
> Data: 2026-04-04

---

## Resumo Técnico

Substituir armazenamento e comparação de senhas plaintext por hashing com **bcryptjs**. O login usa detecção automática de formato (`$2` prefix = hash, caso contrário = plaintext legado) para migrar senhas existentes transparentemente, sem downtime nem ação do usuário.

---

## Decisões de Arquitetura

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Biblioteca | `bcryptjs` (JS puro) | Sem native bindings — funciona em Windows, Docker Alpine e CI sem compilador C |
| Cost factor | 12 | OWASP recomenda 10+. Factor 12 ≈ 250ms — bom trade-off segurança/performance |
| Detecção plaintext/hash | `startsWith('$2')` | bcrypt hashes SEMPRE começam com `$2a$` ou `$2b$`. Nenhuma senha plaintext razoável começa com `$2` |
| Estratégia de migração | Re-hash on login | Sem migration forçada, sem downtime. Plaintext detectado → compara direto → se válido, re-hash e grava |
| Mínimo de senha | 8 chars (era 6) | NIST SP 800-63B recomenda mínimo 8. Só afeta novos registros |
| Localização da lógica | Inline em `route.ts` | Módulo auth tem 1 arquivo, extrair para service.ts seria over-engineering |

---

## Plano de Implementação

### Fase 1: Dependência
**Objetivo**: Adicionar `bcryptjs` ao pacote `@spravio/api`

1. **`apps/api/package.json`**
   - Adicionar `"bcryptjs": "^2.4.3"` em `dependencies`
   - Adicionar `"@types/bcryptjs": "^2.4.6"` em `devDependencies`
   - Executar `pnpm install` na raiz

### Fase 2: Auth route — registro
**Objetivo**: Novos registros salvam hash bcrypt em vez de plaintext

1. **`apps/api/src/modules/auth/route.ts`**
   - Adicionar `import bcrypt from 'bcryptjs'` no topo
   - Alterar `RegisterInput.password` de `.min(6)` para `.min(8)` (linha 16)
   - Substituir `passwordHash: password` (linha 92) por:
     ```typescript
     passwordHash: await bcrypt.hash(password, 12)
     ```
   - Cobre: **RF-01**, **RF-04**

### Fase 3: Auth route — login com migração
**Objetivo**: Login usa bcrypt.compare() com fallback para plaintext + re-hash transparente

1. **`apps/api/src/modules/auth/route.ts`**
   - Remover comentário `// Dev: plaintext comparison. Phase 6 will add bcrypt.` (linha 39)
   - Substituir bloco de comparação plaintext (linhas 39–42) por:
     ```typescript
     const isHashed = user.passwordHash.startsWith('$2')
     let isValid: boolean

     if (isHashed) {
       isValid = await bcrypt.compare(password, user.passwordHash)
     } else {
       isValid = user.passwordHash === password
       if (isValid) {
         const hashed = await bcrypt.hash(password, 12)
         await prisma.user.update({
           where: { id: user.id },
           data: { passwordHash: hashed },
         })
       }
     }

     if (!isValid) {
       throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401)
     }
     ```
   - Cobre: **RF-02**, **RF-03**, **RNF-02**, **RNF-03**

### Fase 4: Frontend — validação de senha
**Objetivo**: Alinhar mínimo de caracteres no formulário de registro

1. **`apps/web/src/app/(auth)/register/page.tsx`**
   - Alterar `minLength={6}` para `minLength={8}` (linha 117)
   - Alterar placeholder `"At least 6 characters"` para `"At least 8 characters"` (linha 119)

### Fase 5: Seed — hashes em vez de plaintext
**Objetivo**: Seed de desenvolvimento usa hashes bcrypt

1. **`apps/api/prisma/seed.ts`**
   - Adicionar `import bcrypt from 'bcryptjs'` no topo
   - Antes dos upserts, gerar os 3 hashes:
     ```typescript
     const ownerHash = await bcrypt.hash('owner123', 12)
     const pmHash = await bcrypt.hash('pm123', 12)
     const viewerHash = await bcrypt.hash('viewer123', 12)
     ```
   - Substituir `passwordHash: 'owner123'` por `passwordHash: ownerHash` (nos campos create e update)
   - Idem para pm (`pmHash`) e viewer (`viewerHash`)
   - As senhas de dev continuam as mesmas (`owner123`, `pm123`, `viewer123`) — só o storage muda

---

## Schema Changes

Nenhuma. O campo `passwordHash String?` no model `User` já comporta tanto plaintext quanto bcrypt hash. A mudança é semântica, não estrutural.

**Migration**: N/A

---

## API Changes

| Método | Rota | Mudança |
|--------|------|---------|
| POST | /auth/register | Zod: `password.min(6)` → `.min(8)`. Storage: plaintext → `bcrypt.hash(password, 12)` |
| POST | /auth/login | Comparação: `!==` → `bcrypt.compare()` com fallback plaintext + re-hash |

**Breaking change**: Novos registros exigem senha com 8+ chars (era 6). Usuários existentes com senhas curtas ainda fazem login normalmente.

---

## Dependências

| Pacote | Versão | Motivo |
|--------|--------|--------|
| `bcryptjs` | ^2.4.3 | Hash e comparação de senhas (JS puro, sem native bindings) |
| `@types/bcryptjs` | ^2.4.6 | TypeScript types |

---

## Testes

| Tipo | Cobertura |
|------|-----------|
| Manual | Registro novo → verificar no DB que `passwordHash` começa com `$2b$` |
| Manual | Login com user existente (plaintext) → verificar re-hash no DB após login |
| Manual | Login com senha errada → 401 |
| Manual | Registro com senha < 8 chars → rejeição (frontend + backend) |
| Manual | Login com user já migrado (hash) → funciona via `bcrypt.compare()` |

---

## Rollback Plan

1. A lógica dual (plaintext + bcrypt) garante backward compatibility total
2. Se preciso, revert do commit funciona **desde que nenhum re-hash tenha ocorrido**
3. Se re-hashes já ocorreram, o rollback precisa manter a lógica dual — não pode simplesmente voltar ao `!==`
4. Recomendação: manter o fallback plaintext por 30 dias pós-deploy antes de remover

---

## Notas

- O `prisma.user.update()` no re-hash é fire-and-forget para o fluxo de login — se falhar, o usuário ainda loga; a migração será retentada no próximo login
- Senhas de dev exibidas no login page (`owner@spravio.dev` etc.) continuam as mesmas — só o armazenamento muda
- O campo `passwordHash` pode ser `null` para users OAuth — já tratado pelo guard `if (!user.passwordHash)` na linha 35
- Cleanup futuro: remover branch plaintext do login quando todos os users tiverem feito login pós-deploy
