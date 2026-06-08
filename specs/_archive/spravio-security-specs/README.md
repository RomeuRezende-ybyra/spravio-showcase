# Spravio — Security & LGPD Compliance Specs

> Pacote de 8 specs no padrão SDD para endereçar conformidade LGPD e segurança de dados de clientes.
> Data: 2026-04-21
> Status: Ready for Implementation

---

## Contexto

O Spravio é uma plataforma SaaS B2B que consolida dados de 14 ferramentas externas (Jira, GitHub, Azure DevOps, GitLab, Slack, Teams, Tempo, Clockify, Trello, ClickUp, Linear, Asana, Monday) para gerentes de agências monitorarem entregas.

Como plataforma multi-tenant que armazena:
- **Tokens/PATs** de integrações (acesso amplo a sistemas externos)
- **Conteúdo de projeto** (títulos, descrições de issues, PRs)
- **Dados pessoais** de desenvolvedores (nomes, e-mails, avatares)
- **Dados financeiros** (budget, horas, custos)

...precisamos garantir conformidade com a **LGPD (Lei 13.709/2018)** e melhores práticas de segurança antes de escalar vendas B2B.

---

## Ordem de Implementação

As specs devem ser implementadas nesta ordem, respeitando dependências:

| Ordem | Spec | Prioridade | Esforço | Dependências |
|-------|------|------------|---------|--------------|
| 1 | **023** — Token Encryption at Rest | 🔴 Crítica | ~8h | — |
| 2 | **024** — Log Sanitization | 🔴 Crítica | ~5h | — |
| 3 | **025** — Tenant Isolation Audit | 🔴 Crítica | ~10h | — |
| 4 | **026** — Data Retention & Deletion | 🟠 Alta | ~12h | 023 |
| 5 | **027** — Integration Disconnect Flow | 🟠 Alta | ~8h | 023, 026 |
| 6 | **028** — Audit Log | 🟠 Alta | ~10h | 025 |
| 7 | **029** — Scope Minimization | 🟡 Média | ~6h | 023, 027 |
| 8 | **030** — Data Export (Portabilidade) | 🟡 Média | ~8h | 026, 028 |

**Total estimado:** ~67 horas (~2 sprints)

---

## Mapeamento LGPD

| Artigo LGPD | Spec que Endereça |
|-------------|-------------------|
| Art. 6º (segurança, prevenção) | 023, 024, 025, 028 |
| Art. 15 (término do tratamento) | 026, 027 |
| Art. 16 (eliminação dos dados) | 026, 027 |
| Art. 18 (direitos do titular) | 030 |
| Art. 46 (segurança técnica) | 023, 024, 025 |
| Art. 48 (comunicação de incidentes) | 028 |
| Art. 50 (boas práticas e governança) | todas |

---

## Como Usar com Claude CLI

1. Copie a pasta `specs/` para o seu projeto Spravio
2. Para cada spec, rode:
   ```bash
   cd spravio
   claude code
   ```
3. No Claude CLI: `Implemente a spec em specs/023-token-encryption/spec.md`
4. Após implementação, marque Definition of Done e passe para a próxima

---

## Checklist Geral de Conformidade

Após implementar todas as specs, você deve conseguir responder **sim** a cada pergunta:

- [ ] Tokens de integração estão criptografados em repouso (AES-256-GCM)
- [ ] Chave de criptografia está em KMS ou variável separada do banco
- [ ] Logs não contêm tokens, payloads sensíveis ou headers Authorization
- [ ] Todas as queries Prisma têm escopo de `organizationId`
- [ ] Existe endpoint para cliente solicitar exclusão total de dados
- [ ] Ao desconectar integração, credenciais são purgadas e dados relacionados marcados
- [ ] Existe trilha de auditoria para acessos e ações sensíveis
- [ ] Scopes OAuth são mínimos e documentados por integração
- [ ] Cliente consegue exportar todos os seus dados em JSON
- [ ] Existem testes automatizados validando cada um dos pontos acima

---

## Fora de Escopo (deste pacote)

Estes itens são importantes mas serão tratados em pacotes separados:

- Documentos jurídicos (Política de Privacidade, Termos de Uso, DPA) — serão redigidos **após** a implementação destas specs, refletindo a realidade do código
- Plano de Resposta a Incidentes (documento operacional, não código)
- Página pública de Security/Trust Center
- Certificações (ISO 27001, SOC 2) — roadmap separado
- Pen testing externo — após implementação completa
