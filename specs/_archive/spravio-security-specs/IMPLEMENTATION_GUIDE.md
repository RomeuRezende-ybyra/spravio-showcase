# Guia de Implementação — Spravio Security & LGPD

Este guia traduz as 8 specs em um roteiro prático para você executar com o Claude CLI.

---

## Pré-Auditoria (antes de começar)

Rode estes comandos no repositório Spravio para mapear o estado atual:

```bash
# 1. Ver se há tokens em plaintext no banco
psql $DATABASE_URL -c "\d \"OrganizationSettings\"" | grep -i "token\|key\|pat"

# 2. Buscar logs que podem vazar secrets
grep -rn "console\.log\|logger\.info.*token\|logger\.info.*password" apps/api/src/

# 3. Buscar queries Prisma sem escopo de org
grep -rnE "prisma\.(project|issue|sprint|developer)\.(findMany|findFirst|update|delete)" apps/api/src/ | grep -v organizationId

# 4. Ver quantos models têm deletedAt
grep -A 20 "^model " apps/api/prisma/schema.prisma | grep -B 1 "deletedAt"
```

O resultado destes 4 comandos vai confirmar quais specs têm o problema mais agudo.

---

## Semana 1 — Críticas (impede vazamento)

### Dia 1-2: Spec 023 — Token Encryption
```bash
cd spravio
git checkout -b feat/023-token-encryption
claude code

# No CLI:
# > Implemente a spec em specs/023-token-encryption/spec.md.
# > Gere primeiro a chave mestra, atualize o schema, depois CryptoService e migração.
```

**Ponto de atenção:** gere a chave ANTES e faça backup offline. Perder a chave = perder todos os tokens criptografados.

### Dia 3: Spec 024 — Log Sanitization
```bash
git checkout -b feat/024-log-sanitization
# > Implemente spec 024. Depois rode o grep de auditoria para validar.
```

### Dia 4-5: Spec 025 — Tenant Isolation
```bash
git checkout -b feat/025-tenant-isolation-audit
# > Rode primeiro o script de auditoria em scripts/audit-tenant-isolation.ts.
# > Corrija todos os findings HIGH antes de aplicar o middleware.
```

**Não faça deploy do middleware sem corrigir HIGH findings primeiro** — vai quebrar produção.

---

## Semana 2 — Altas (direitos do titular)

### Dia 6-8: Spec 026 — Data Retention & Deletion
Depende de 023. Sem token encryption, `executeOrgDeletion` não consegue revogar tokens corretamente.

### Dia 9-10: Spec 027 — Integration Disconnect
Depende de 023 e 026. Finaliza o fluxo de "cliente desconectou Jira, o que acontece?".

---

## Semana 3 — Observabilidade e compliance

### Dia 11-13: Spec 028 — Audit Log
Depende de 025 (usa organizationId em todos os eventos).

### Dia 14-15: Spec 029 — Scope Minimization
Depende de 023 e 027.

---

## Semana 4 — Portabilidade

### Dia 16-18: Spec 030 — Data Export
Depende de 026 e 028.

---

## Checkpoints

### Após Semana 1 (specs 023-025)
Você consegue responder:
- ✅ "Tokens são criptografados?" → Sim, AES-256-GCM
- ✅ "Logs vazam dados?" → Não, redact + Sentry scrub
- ✅ "Clientes podem ver dados de outros?" → Não, middleware + testes

### Após Semana 2 (specs 026-027)
- ✅ "Como exclusão funciona?" → Soft delete 30d + hard delete + request-deletion endpoint
- ✅ "O que acontece ao desconectar Jira?" → Revogação na fonte + purga/preserve à escolha

### Após Semana 3 (specs 028-029)
- ✅ "Quem acessou o quê?" → Audit log consultável por 5 anos
- ✅ "Vocês pedem scope mínimo?" → Sim, documentado publicamente

### Após Semana 4 (spec 030)
- ✅ "Posso levar meus dados embora?" → Sim, export ZIP em < 5min

---

## Após a implementação — Documentos jurídicos

Com o código alinhado à realidade, agora escreva:

1. **Política de Privacidade** — refletindo que tokens são criptografados, dados têm retenção definida, há portabilidade
2. **Termos de Uso** — menciona janela de 30 dias após cancelamento
3. **DPA (Data Processing Agreement)** — descreve medidas técnicas (AES-256-GCM, tenant isolation, audit log 5 anos)
4. **Página Security/Trust Center** em `spravio.com.br/security` — lista subprocessadores, scopes por integração, processo de incidente

**Regra:** cada afirmação nos docs precisa ter implementação correspondente no código.

---

## Métricas para monitorar após deploy

| Métrica | Alvo | Alerta |
|---------|------|--------|
| Queries sem escopo (violações) | 0/dia | > 0 |
| Tokens em plaintext em logs | 0 | > 0 (grep periódico) |
| Jobs de retention falhando | 0 | > 0/dia |
| Exports com falha | < 5% | > 20% |
| Tempo p95 audit log write | < 50ms | > 200ms |
| Login failed (mesmo email) | Variável | > 5 em 5min = alerta |

---

## Suporte para executar com Claude CLI

Para cada spec, o prompt sugerido é:

```
Leia specs/NNN-nome-da-spec/spec.md e implemente exatamente conforme descrito.

Regras:
1. Siga o padrão existente do projeto (apps/api/src/modules/*/route.ts, service.ts, repository.ts, types.ts).
2. Use Zod para validação.
3. Todas as queries Prisma DEVEM ter escopo por organizationId.
4. Nunca loge tokens, senhas ou bodies completos.
5. Adicione testes Vitest para cada cenário da spec.
6. Ao terminar, rode pnpm typecheck && pnpm lint e me mostre o output.
7. Marque o Definition of Done da spec conforme for completando.
```

---

## Roll-out em produção

Para cada spec, antes de mergear:

- [ ] Review de código por segundo dev
- [ ] Testes passando em CI
- [ ] Migration testada em banco clonado de produção
- [ ] Rollback documentado
- [ ] Monitoring configurado
- [ ] Canary deploy se possível
- [ ] Alertas Sentry revisados

---

## Em caso de incidente durante a implementação

Se algo quebrar em produção durante essa migração:

1. **Não entre em pânico** — tokens ainda funcionam mesmo se CryptoService falhar (fallback leitura plaintext)
2. **Rollback imediato** do deploy
3. **Não delete a chave mestra**, mesmo se parecer que não está sendo usada
4. **Notifique** a equipe e registre no audit log
5. **Revise** o que deu errado antes de tentar de novo

A spec 028 (Audit Log) vai ajudar muito aqui — mas só depois de implementada.
