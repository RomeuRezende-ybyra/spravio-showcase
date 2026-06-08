# Specification-Driven Development (SDD) — Padrao de Workflow

> Documento de referencia para replicar o workflow de desenvolvimento do WebScola em outros projetos.

---

## 1. Visao Geral

O SDD (Specification-Driven Development) organiza todo o ciclo de vida do produto em torno de **especificacoes tecnicas** (specs) que servem como fonte unica de verdade. Cada funcionalidade e descrita, rastreada e validada atraves de uma spec, que conecta:

- **Codigo** (o que esta implementado)
- **Board de gestao** (Trello — status, prioridade, pontuacao)
- **Pull Requests** (historico de implementacao)
- **Testes** (criterios de aceitacao verificaveis)

### Principios

1. **Spec-first**: Nenhuma funcionalidade e implementada sem spec escrita e aprovada.
2. **Rastreabilidade bidirecional**: Spec → Card Trello → Branch → PR → Commit → Spec atualizada.
3. **Spec como documentacao viva**: A spec sempre reflete o estado real do codigo, nao o estado planejado.
4. **Sync obrigatorio**: Apos cada commit/PR que implementa funcionalidade, as specs afetadas sao atualizadas.
5. **Board como espelho**: O Trello reflete exatamente o estado das specs (nunca o contrario).

---

## 2. Estrutura de Projeto

### 2.1 Monorepo

```
projeto/
├── projeto-api/           # Backend (NestJS)
├── projeto-web/           # Frontend (Next.js)
├── docs/                  # Documentacao de projeto
├── specs/                 # Especificacoes tecnicas (SDD)
│   ├── concluido/         # Funcionalidades implementadas
│   ├── em-andamento/      # Funcionalidades parcialmente implementadas
│   └── a-fazer/           # Funcionalidades planejadas
│       ├── essencial/     # MVP / prioridade maxima
│       ├── importante/    # Proximo ciclo
│       └── crescimento/   # Futuro
├── docker-compose.yml     # Ambiente local
├── docker-compose.prod.yml
└── .github/workflows/     # CI/CD
```

### 2.2 Backend (NestJS)

```
projeto-api/src/
├── main.ts                     # Entry point, globals (prefix, pipes, cors, helmet)
├── app.module.ts               # Root module
├── core/                       # Infraestrutura compartilhada
│   ├── database/               # PrismaService, PrismaModule
│   ├── security/               # Guards (JWT, Roles, Throttler)
│   ├── decorators/             # @CurrentUser, @CurrentTenant, @Roles
│   ├── filters/                # HttpExceptionFilter
│   ├── interceptors/           # LoggingInterceptor
│   ├── services/               # EmailService, etc.
│   └── scheduler/              # Cron jobs (SchedulerService)
├── modules/                    # Feature modules
│   ├── auth/                   # Autenticacao (JWT, refresh)
│   ├── users/                  # CRUD usuarios
│   ├── schools/                # Multi-tenancy
│   ├── [feature]/              # Cada feature em seu module
│   │   ├── [feature].module.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   └── entities/
└── prisma/
    ├── schema.prisma           # Schema do banco
    └── seed.ts                 # Dados iniciais
```

**Padroes obrigatorios do backend:**

| Padrao | Implementacao |
|--------|--------------|
| Autenticacao | JWT com httpOnly cookies, access + refresh token |
| Multi-tenancy | `@CurrentTenant()` extrai schoolId do JWT |
| Autorizacao | `@Roles('admin_escola', 'secretaria', ...)` + RolesGuard |
| Validacao | `ValidationPipe` global com whitelist + forbidNonWhitelisted |
| Seguranca | Helmet, CORS, ThrottlerGuard, rate limiting |
| API Prefix | `/api` global |
| Documentacao | Swagger/OpenAPI (nao em producao) |
| Erro handling | HttpExceptionFilter global |

### 2.3 Frontend (Next.js)

```
projeto-web/src/
├── app/                        # App Router
│   ├── (admin)/                # Rotas admin (layout com sidebar)
│   │   ├── dashboard/
│   │   ├── [feature]/
│   │   └── configuracoes/
│   ├── (portal)/               # Rotas portal (usuario final)
│   ├── (auth)/                 # Login, registro, recuperacao
│   └── api/                    # BFF routes (proxy para backend)
├── components/
│   ├── layout/                 # Sidebar, Header, Breadcrumb
│   └── ui/                     # Componentes reutilizaveis
├── hooks/                      # useApiQuery, useApiMutation, useAuth, useBreadcrumb
├── lib/                        # Utilitarios (api client, formatters)
├── stores/                     # Zustand (auth store, etc.)
├── types/                      # Tipos TypeScript
└── middleware.ts               # Auth middleware
```

**Padroes obrigatorios do frontend:**

| Padrao | Implementacao |
|--------|--------------|
| Data fetching | TanStack Query via `useApiQuery` / `useApiMutation` |
| State management | Zustand para estado global (auth, UI) |
| Styling | Tailwind CSS |
| API pattern | BFF: Next.js API routes proxy para NestJS backend |
| Auth guard | `enabled: !!user && isAuthenticated && !!accessToken` em queries |
| Hooks rule | TODOS os hooks antes de qualquer return condicional |

---

## 3. Especificacoes Tecnicas (Specs)

### 3.1 Formato da Spec

Cada spec e um arquivo Markdown com frontmatter YAML:

```markdown
---
id: SPEC-XXX
title: "Nome da Feature"
status: concluido | em-andamento | a-fazer
prioridade: essencial | importante | crescimento
categoria: academico | financeiro | infraestrutura | legal | ux | comunicacao | plataforma
trello_card_id: "id_do_card_no_trello"
ultima_atualizacao: "YYYY-MM-DD"
pr_referencia: "#N - titulo do PR"
---

# Nome da Feature

## Resumo
Descricao breve da funcionalidade (2-3 linhas).

## Status Atual
**X% implementado.** Resumo do progresso.

## O que Ja Existe
### Backend
- **ServiceName** (`path/to/file.ts`): Descricao
- Listar todos os services, controllers, modules criados

### Frontend
- **Pagina /rota** (`path/to/page.tsx`): Descricao

### Modelos de Dados
```prisma
model NomeDoModelo {
  // campos relevantes
}
```

### Endpoints API
| Metodo | Rota | Descricao | Roles |
|--------|------|-----------|-------|

## Regras de Negocio
- RN-01: Regra de negocio
- RN-02: Regra de negocio

## O que Falta Implementar
(apenas para status: em-andamento)
- [ ] Item pendente
- [ ] Item pendente

## Criterios de Aceitacao
- [ ] Criterio verificavel 1
- [ ] Criterio verificavel 2

## Dependencias
- **Depende de**: SPEC-XXX
- **Bloqueia**: SPEC-YYY
- **Relacionado**: SPEC-ZZZ
```

### 3.2 Indice (specs/README.md)

O `specs/README.md` mantem um indice atualizado com todas as specs, organizadas por status:

```markdown
### Concluido (N)
| ID | Spec | Categoria |
|----|------|-----------|

### Em Andamento (N)
| ID | Spec | Categoria | O que falta |
|----|------|-----------|-------------|

### A Fazer - Essencial (N)
| ID | Spec | Categoria |
|----|------|-----------|
```

### 3.3 Ciclo de Vida da Spec

```
a-fazer/ ──→ em-andamento/ ──→ concluido/
  (plan)       (building)       (reference)
```

1. **a-fazer**: Spec descreve a funcionalidade completa a ser construida.
2. **em-andamento**: Implementacao parcial. Spec documenta "O que Ja Existe" + "O que Falta".
3. **concluido**: Todos os criterios atendidos. Spec serve como documentacao de referencia.

### 3.4 Pontuacao (Fibonacci)

Cada spec recebe pontos em escala Fibonacci (1, 2, 3, 5, 8, 13, 21) que refletem complexidade.

Agrupar por fase:
- **MVP**: soma dos pontos de specs essenciais
- **Total**: soma de todas as specs

Progresso: `MVP X% (pts_done/pts_total), Total Y% (pts_done/pts_total_geral)`

---

## 4. Board de Gestao (Trello)

### 4.1 Estrutura do Board

| Lista Trello | Diretorio specs | Quando |
|-------------|----------------|--------|
| Backlog | `specs/a-fazer/` | Spec criada, nao iniciada |
| Doing | `specs/em-andamento/` | Branch criada, em desenvolvimento |
| Review | — | PR aberto, aguardando review |
| Done | `specs/concluido/` | Todos criterios atendidos, PR merged |

### 4.2 Formato dos Cards

**Titulo**: `SPEC-XXX (pts): Nome da Feature`

**Descricao**: Checklist com criterios de aceitacao + status atual.

**Labels**: `MVP` (verde), `Pos-MVP` (roxo), ou categorias do projeto.

### 4.3 Mapeamento Spec → Card

Cada spec tem `trello_card_id` no frontmatter. O mapeamento completo fica no arquivo de configuracao do workflow (ex: `spec-sync-workflow.md` no diretorio de memoria do agente).

### 4.4 API do Trello

Credenciais armazenadas em arquivo de configuracao (NUNCA no repositorio).

**Operacoes principais:**

```bash
KEY="<api_key>"
TK="<api_token>"
CARD="<card_id>"

# Atualizar descricao do card
curl -s -X PUT "https://api.trello.com/1/cards/$CARD?key=$KEY&token=$TK" \
  -H "Content-Type: application/json" \
  -d '{"desc": "nova descricao"}'

# Adicionar comentario (historico)
curl -s -X POST "https://api.trello.com/1/cards/$CARD/actions/comments?key=$KEY&token=$TK" \
  -H "Content-Type: application/json" \
  -d '{"text": "**PR #N merged** - titulo\n\nItens implementados:\n- item 1\n- item 2"}'

# Mover card para outra lista
curl -s -X PUT "https://api.trello.com/1/cards/$CARD?key=$KEY&token=$TK" \
  -H "Content-Type: application/json" \
  -d '{"idList": "<list_id>"}'
```

---

## 5. Branching e Pull Requests

### 5.1 Estrategia de Branches

```
main (producao)
├── feat/nome-da-feature      # Nova funcionalidade
├── fix/descricao-do-bug       # Correcao de bug
├── refactor/descricao         # Refatoracao
└── chore/descricao            # Infra, config, deps
```

- `main` e protegida — merge apenas via PR.
- Branch nomeada conforme o tipo de mudanca.
- Uma branch por spec (ou grupo de specs relacionadas).

### 5.2 Fluxo de PR

```
1. Criar branch a partir de main
2. Implementar (commits atomicos com mensagens claras)
3. Lint + testes (npm run lint && npm run test)
4. Push + criar PR via gh cli
5. Review + merge
6. Spec sync (obrigatorio!)
```

### 5.3 Formato do PR

```markdown
## Summary
- Bullet points concisos do que foi implementado
- Referencia a spec(s) afetada(s): SPEC-XXX

## Test plan
- [ ] Unit tests passando (npm run test)
- [ ] Lint sem erros (npm run lint)
- [ ] Build sem erros (npm run build)
- [ ] Funcionalidade testada manualmente
```

### 5.4 Formato de Commit

```
<tipo>: <descricao concisa>

<corpo opcional com detalhes>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Tipos: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`

---

## 6. Spec Sync Workflow (Obrigatorio)

### Quando executar

**SEMPRE** que um commit ou PR implementar funcionalidade que afeta uma ou mais specs.

### Passo a passo

#### 6.1 Identificar specs afetadas

Analisar arquivos alterados no commit/PR e mapear para specs via `specs/README.md`.

#### 6.2 Atualizar cada spec (arquivo .md)

**No frontmatter:**
- `ultima_atualizacao: "YYYY-MM-DD"`
- `pr_referencia: "#N - titulo do PR"`

**Na secao "O que Ja Existe":**
- Adicionar novos services, controllers, componentes com paths completos
- Listar endpoints novos

**Na secao "O que Falta Implementar":**
- Remover itens implementados
- Atualizar itens parciais

**Na secao "Criterios de Aceitacao":**
- Marcar `[x]` nos criterios atendidos

#### 6.3 Atualizar specs/README.md

- Coluna "O que falta" para specs em-andamento
- Mover spec para secao correta se mudou de status

#### 6.4 Atualizar card do Trello (API)

- Atualizar descricao do card com checklist atualizado
- Adicionar comentario com referencia ao PR e itens implementados
- Mover card para lista correta se spec mudou de status

#### 6.5 Mover spec se concluida

Se todos os criterios marcados:
1. Mover arquivo de `em-andamento/` para `concluido/`
2. Alterar `status: concluido` no frontmatter
3. Atualizar README.md (contagem e tabela)
4. Mover card do Trello para lista "Done"

#### 6.6 Atualizar progresso

Recalcular: `MVP X% (pts_done/pts_mvp), Total Y% (pts_done/pts_total)`

---

## 7. Testes

### 7.1 Backend (Jest)

```json
{
  "testRegex": ".*\\.spec\\.ts$",
  "collectCoverageFrom": ["**/*.service.ts"],
  "coverageThreshold": {
    "global": {
      "branches": 40,
      "functions": 50,
      "lines": 50,
      "statements": 50
    }
  }
}
```

**Estrutura de testes:**
- Unit tests: `*.spec.ts` ao lado do service
- E2E tests: `test/*.e2e-spec.ts`
- Mocks do Prisma via `jest.fn()` para isolar services

**Padrao de unit test:**

```typescript
describe('NomeService', () => {
  let service: NomeService;
  let prisma: { model: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { model: { findMany: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [
        NomeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(NomeService);
  });

  it('should do X', async () => {
    prisma.model.findMany.mockResolvedValue([...]);
    const result = await service.method(args);
    expect(result.field).toBe(expected);
  });
});
```

### 7.2 Frontend (Playwright)

E2E tests para fluxos criticos:
- Autenticacao (login, logout, refresh)
- CRUD principal de cada feature
- Permissoes por role

### 7.3 Quando rodar testes

- **Antes de cada commit**: `npm run lint` + `npm run test`
- **Antes de abrir PR**: `npm run test:e2e`
- **CI/CD**: Testes automaticos no pipeline

---

## 8. CI/CD e Deploy

### 8.1 Pipeline (GitHub Actions)

```yaml
on:
  push:
    branches: [main]

jobs:
  build-api:     # Build Docker image da API → push para GHCR
  build-web:     # Build Docker image do Web → push para GHCR
  deploy:        # SSH para VPS → pull images → docker compose up
    needs: [build-api, build-web]
```

**Boas praticas:**
- Build com cache (`cache-from: type=gha`)
- Tag com `latest` + SHA do commit
- Pull antes de parar containers (minimiza downtime)
- Health check apos deploy
- Prune de imagens antigas

### 8.2 Docker

```yaml
# docker-compose.yml (local)
services:
  postgres:    # PostgreSQL 16
  api:         # NestJS backend
  web:         # Next.js frontend (output: standalone)

# docker-compose.prod.yml (producao)
services:
  webscola-db:     # PostgreSQL com volume persistente
  webscola-redis:  # Redis para cache/sessions
  webscola-api:    # API com health check
  webscola-web:    # Web com proxy reverso
```

### 8.3 Ambientes

| Ambiente | Proposito | Deploy |
|----------|----------|--------|
| Local | Desenvolvimento | `docker compose up` |
| Producao | Usuarios finais | Automatico via merge em main |

---

## 9. Arquitetura de Comunicacao

### 9.1 BFF Pattern

```
Browser → Next.js (Web) → Next.js API Routes → NestJS (API) → PostgreSQL
                BFF Layer                    Backend
```

- **Externo**: `NEXT_PUBLIC_API_URL` (browser → API direta para requests client-side)
- **Interno**: `API_INTERNAL_URL` (Next.js server → API via rede Docker)

### 9.2 Autenticacao

```
1. Login → POST /auth/login → JWT access + refresh token (httpOnly cookies)
2. Request → Authorization: Bearer <access_token>
3. Token expirado → POST /auth/refresh → Novo access token
4. Logout → POST /auth/logout → Limpa cookies
```

### 9.3 Multi-tenancy

- Cada usuario pertence a uma escola (schoolId no JWT)
- `@CurrentTenant()` decorator extrai schoolId automaticamente
- Todas as queries filtram por schoolId
- Isolamento total entre escolas

---

## 10. Configuracao de Ferramentas

### 10.1 TypeScript

```json
// Backend (NestJS)
{
  "module": "nodenext",
  "target": "ES2023",
  "strict": true,
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}

// Frontend (Next.js)
{
  "module": "esnext",
  "target": "ES2017",
  "strict": true,
  "jsx": "react-jsx",
  "paths": { "@/*": ["./src/*"] }
}
```

### 10.2 ESLint + Prettier

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

ESLint: typescript-eslint + prettier plugin. `@typescript-eslint/no-explicit-any: off` (pragmatico).

### 10.3 Prisma

- Schema em `projeto-api/prisma/schema.prisma`
- Seed em `projeto-api/prisma/seed.ts`
- Migrations: `npx prisma migrate dev --name descricao`
- Deploy: `npx prisma migrate deploy` (producao)

---

## 11. Checklist para Novo Projeto SDD

### Setup inicial

- [ ] Criar monorepo com `projeto-api/` e `projeto-web/`
- [ ] Configurar NestJS com Prisma, JWT, Guards, Decorators
- [ ] Configurar Next.js com TanStack Query, Zustand, Tailwind
- [ ] Docker compose local com PostgreSQL
- [ ] CI/CD com GitHub Actions
- [ ] ESLint + Prettier em ambos

### Setup de specs

- [ ] Criar `specs/` com subdiretorios (`concluido`, `em-andamento`, `a-fazer`)
- [ ] Criar `specs/README.md` com indice
- [ ] Definir specs iniciais com pontuacao Fibonacci
- [ ] Criar board Trello com listas (Backlog, Doing, Review, Done)
- [ ] Criar cards 1:1 com specs
- [ ] Mapear card IDs no frontmatter das specs

### Setup de agente (Claude Code)

- [ ] Criar `.claude/` com memory files
- [ ] Documentar: spec-sync-workflow, Trello API credentials/IDs, padroes do projeto
- [ ] MEMORY.md com: workflow obrigatorio, padroes tecnicos, preferencias

### Por feature

- [ ] Escrever spec completa (status: a-fazer)
- [ ] Criar card no Trello
- [ ] Criar branch `feat/nome`
- [ ] Implementar backend (service → controller → module → test)
- [ ] Implementar frontend (page → components → hooks)
- [ ] `npm run lint && npm run test`
- [ ] Commit + Push + PR
- [ ] Spec sync (spec → README → Trello)
- [ ] Merge → Deploy automatico

---

## 12. Erros Comuns e Solucoes

| Erro | Causa | Solucao |
|------|-------|---------|
| React Error #310 | Hooks chamados condicionalmente (apos early return) | Mover TODOS hooks para antes de qualquer `if/return` |
| `archiver` import erro | `import * as archiver` com `module: "nodenext"` | Usar `import archiver from 'archiver'` (default import) |
| Recharts `labelFormatter` tipo | `(label: ReactNode) => ReactNode` incompativel com `string` | Parametro como `unknown`, usar `String(d)` |
| Prisma pool exhaustion (E2E) | Muitas conexoes em testes paralelos | `--runInBand` para E2E, cleanup apos cada teste |
| useEffect deps instavel | Array criado inline (`data?.items ?? []`) muda a cada render | Envolver em `useMemo()` |

---

## 13. Metricas de Progresso

### Formula

```
Progresso MVP = (soma pts specs concluidas que sao MVP) / (soma pts todas specs MVP) × 100
Progresso Total = (soma pts specs concluidas) / (soma pts todas specs) × 100
```

### Onde registrar

- `spec-sync-workflow.md` (memoria do agente)
- Card de overview no Trello (opcional)
- Comentario no PR com progresso atualizado

### Exemplo

```
Antes:  MVP 64.3% (108/168), Total 42.0% (108/257)
Depois: MVP 76.8% (129/168), Total 50.2% (129/257)
Delta:  +21pts (SPEC-013: 8pts + SPEC-014: 13pts)
```

---

## Apendice A: Stack Tecnologica de Referencia

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Backend | NestJS | 10+ |
| ORM | Prisma | 6+ |
| Banco | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Frontend | Next.js | 15+ |
| React | React | 19 |
| Data fetching | TanStack Query | 5 |
| State | Zustand | 5 |
| Styling | Tailwind CSS | 4 |
| Charts | Recharts | 2 |
| PDF | Puppeteer/Chromium | — |
| Templates | Handlebars | — |
| Email | Nodemailer + Resend | — |
| CI/CD | GitHub Actions | — |
| Container | Docker + Docker Compose | — |
| Registry | GitHub Container Registry | — |
| Board | Trello (API) | — |
| Tests (unit) | Jest | — |
| Tests (e2e) | Playwright | — |

## Apendice B: Comandos Essenciais

```bash
# Backend
cd projeto-api
npm run lint          # Lint
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run build         # Build
npx prisma migrate dev --name descricao   # Nova migration
npx prisma db seed    # Seed

# Frontend
cd projeto-web
npm run lint          # Lint
npm run build         # Build
npm run test:e2e      # Playwright E2E

# Docker
docker compose up -d              # Start local
docker compose down               # Stop
docker compose logs -f api        # Logs

# Git + PR
git checkout -b feat/nome-feature
git add <files> && git commit -m "feat: descricao"
git push -u origin feat/nome-feature
gh pr create --title "titulo" --body "descricao"
```
