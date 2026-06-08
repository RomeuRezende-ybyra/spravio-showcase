# Feature Specification: Test Foundation

> 🟡 BAIXO: Estabelecer infraestrutura de testes automatizados

---

## Metadata

| Campo | Valor |
|-------|-------|
| **Feature ID** | 022-test-foundation |
| **Branch** | `feat/022-test-foundation` |
| **Prioridade** | 🟡 Baixa |
| **Data** | 2026-04-04 |
| **Status** | Ready for Implementation |

---

## 1. Resumo

O codebase do Spravio não possui nenhum teste automatizado. Esta feature estabelece a infraestrutura de testes com Vitest (backend) e Jest/Testing Library (frontend), incluindo testes iniciais para os módulos mais críticos.

---

## 2. Motivação

### Problema
- **0 testes** no codebase inteiro
- Refatorações são arriscadas
- Bugs escapam para produção
- Regressões não são detectadas
- Confiança baixa em deploys

### Impacto
- **Qualidade** — bugs frequentes
- **Velocidade** — medo de mudar código
- **Onboarding** — novos devs não sabem se quebraram algo

### Métricas de Sucesso
- [ ] Infraestrutura de teste configurada
- [ ] CI executando testes em PRs
- [ ] Cobertura inicial em módulos críticos (auth, billing, sync)
- [ ] Documentação de como rodar/escrever testes

---

## 3. User Stories

### Story 1: Dev Confiante
**Como** desenvolvedor  
**Eu quero** rodar testes antes de commit  
**Para que** eu saiba se quebrei algo

#### Critérios de Aceite
- [ ] `pnpm test` roda todos os testes
- [ ] `pnpm test:watch` modo watch funciona
- [ ] Testes rodam em < 30s (sem watch)
- [ ] Output claro de pass/fail

### Story 2: CI Protegido
**Como** reviewer de PR  
**Eu quero** que CI rode testes automaticamente  
**Para que** PRs quebrados não sejam mergeados

#### Critérios de Aceite
- [ ] GitHub Action executa testes
- [ ] PR bloqueado se testes falham
- [ ] Coverage report no PR

### Story 3: Testes Exemplares
**Como** novo desenvolvedor  
**Eu quero** ver exemplos de testes  
**Para que** eu saiba como escrever novos

#### Critérios de Aceite
- [ ] Testes de exemplo para cada tipo (unit, integration)
- [ ] README explicando padrões
- [ ] Fixtures/mocks reutilizáveis

---

## 4. Stack de Testes

| Camada | Ferramenta | Motivo |
|--------|------------|--------|
| **Backend Unit** | Vitest | Rápido, ESM nativo, compat Prisma |
| **Backend Integration** | Vitest + Supertest | Testa rotas HTTP |
| **Frontend Unit** | Vitest | Consistência com backend |
| **Frontend Components** | Testing Library | Padrão React |
| **E2E** | Playwright | (Fase 2 - fora de escopo) |
| **Coverage** | c8 (via Vitest) | Built-in |

---

## 5. Estrutura de Arquivos

```
spravio/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   └── modules/
│   │   │       └── auth/
│   │   │           ├── route.ts
│   │   │           ├── service.ts
│   │   │           └── __tests__/           # NEW
│   │   │               ├── service.test.ts
│   │   │               └── route.test.ts
│   │   ├── vitest.config.ts                 # NEW
│   │   └── test/
│   │       ├── setup.ts                     # Setup global
│   │       ├── fixtures/                    # Dados de teste
│   │       │   ├── users.ts
│   │       │   ├── projects.ts
│   │       │   └── sprints.ts
│   │       └── mocks/                       # Mocks de serviços
│   │           ├── prisma.ts
│   │           ├── redis.ts
│   │           └── integrations/
│   │               ├── jira.ts
│   │               └── github.ts
│   └── web/
│       ├── src/
│       │   └── components/
│       │       └── DeveloperCard/
│       │           ├── index.tsx
│       │           └── __tests__/           # NEW
│       │               └── DeveloperCard.test.tsx
│       └── vitest.config.ts                 # NEW
├── packages/
│   └── types/
│       └── src/
│           └── __tests__/                   # NEW
│               └── schemas.test.ts
└── vitest.workspace.ts                      # NEW: workspace config
```

---

## 6. Configuração

### vitest.workspace.ts (root)
```typescript
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/api/vitest.config.ts',
  'apps/web/vitest.config.ts',
  'packages/types/vitest.config.ts',
]);
```

### apps/api/vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'test', '**/*.d.ts'],
    },
    testTimeout: 10000,
  },
});
```

### apps/web/vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

---

## 7. Testes Iniciais (Módulos Críticos)

### 7.1 Auth Service (Unit)

```typescript
// apps/api/src/modules/auth/__tests__/service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../service';
import { prismaMock } from '../../../test/mocks/prisma';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        passwordMigrated: true,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
    });

    it('should throw for invalid password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
      });

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should migrate plaintext password on login', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        passwordHash: 'plaintext123', // Legacy!
        passwordMigrated: false,
      });

      await authService.login({
        email: 'test@example.com',
        password: 'plaintext123',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          passwordMigrated: true,
          passwordHash: expect.stringMatching(/^\$2[aby]?\$/),
        }),
      });
    });
  });
});
```

### 7.2 Budget Service (Unit)

```typescript
// apps/api/src/modules/budget/__tests__/service.test.ts

describe('budgetService', () => {
  describe('calculateBudgetHealth', () => {
    it('should return GREEN when consumed < 70%', () => {
      const result = calculateBudgetHealth(6000, 10000);
      expect(result).toBe('GREEN');
    });

    it('should return YELLOW when consumed 70-85%', () => {
      const result = calculateBudgetHealth(7500, 10000);
      expect(result).toBe('YELLOW');
    });

    it('should return RED when consumed > 85%', () => {
      const result = calculateBudgetHealth(9000, 10000);
      expect(result).toBe('RED');
    });
  });

  describe('calculateBurnRate', () => {
    it('should calculate daily burn rate', () => {
      const result = calculateBurnRate(10000, 20); // $10k em 20 dias
      expect(result).toBe(500); // $500/dia
    });
  });
});
```

### 7.3 Zod Schemas (Unit)

```typescript
// packages/types/src/__tests__/schemas.test.ts

describe('PasswordSchema', () => {
  it('should accept valid password', () => {
    expect(() => PasswordSchema.parse('Test1234')).not.toThrow();
  });

  it('should reject short password', () => {
    expect(() => PasswordSchema.parse('Test1')).toThrow();
  });

  it('should reject without uppercase', () => {
    expect(() => PasswordSchema.parse('test1234')).toThrow();
  });

  it('should reject without number', () => {
    expect(() => PasswordSchema.parse('Testtest')).toThrow();
  });
});
```

### 7.4 API Route (Integration)

```typescript
// apps/api/src/modules/auth/__tests__/route.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../../app';
import supertest from 'supertest';

describe('POST /auth/login', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 400 for missing email', async () => {
    const response = await supertest(app.server)
      .post('/auth/login')
      .send({ password: 'test123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await supertest(app.server)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(response.status).toBe(401);
  });
});
```

### 7.5 React Component (Frontend)

```typescript
// apps/web/src/components/DeveloperCard/__tests__/DeveloperCard.test.tsx

import { render, screen } from '@testing-library/react';
import { DeveloperCard } from '../';

describe('DeveloperCard', () => {
  const mockDeveloper = {
    id: '1',
    name: 'John Doe',
    avatar: '/avatar.png',
    rating: 4.5,
    deliveryRate: 95,
    returnRate: 5,
    points: 42,
  };

  it('should render developer name', () => {
    render(<DeveloperCard developer={mockDeveloper} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display rating stars', () => {
    render(<DeveloperCard developer={mockDeveloper} />);
    expect(screen.getByLabelText('Rating: 4.5')).toBeInTheDocument();
  });

  it('should show delivery rate percentage', () => {
    render(<DeveloperCard developer={mockDeveloper} />);
    expect(screen.getByText('95%')).toBeInTheDocument();
  });
});
```

---

## 8. Scripts package.json

```json
// Root package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}

// apps/api/package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-c8": "^1.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^2.0.0"
  }
}

// apps/web/package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jsdom": "^22.0.0"
  }
}
```

---

## 9. GitHub Action

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: spravio_test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - run: pnpm install
      
      - run: pnpm --filter api prisma generate
      
      - run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/spravio_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 10. Mocks Reutilizáveis

```typescript
// apps/api/test/mocks/prisma.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const prismaMock = mockDeep<PrismaClient>();

vi.mock('../../src/lib/prisma', () => ({
  prisma: prismaMock,
}));
```

```typescript
// apps/api/test/mocks/redis.ts
export const redisMock = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
};

vi.mock('../../src/lib/redis', () => ({
  redis: redisMock,
}));
```

---

## 11. Definition of Done

- [ ] `pnpm test` roda sem erros
- [ ] Vitest configurado em api, web, types
- [ ] Mocks de Prisma e Redis funcionando
- [ ] Pelo menos 1 teste em cada categoria:
  - [ ] Unit test (service)
  - [ ] Integration test (route)
  - [ ] Schema test (types)
  - [ ] Component test (web)
- [ ] GitHub Action configurada
- [ ] README de testes documentado
- [ ] CLAUDE.md atualizado

---

## 12. Fora de Escopo (Fase 2)

- E2E tests com Playwright
- Visual regression tests
- Performance tests
- Contract tests
- Cobertura > 80%

---

## 13. Estimativa

| Fase | Tempo |
|------|-------|
| Setup Vitest (config, mocks) | 2h |
| Testes auth module | 1.5h |
| Testes budget module | 1h |
| Testes schemas | 30min |
| Testes frontend (1 component) | 1h |
| GitHub Action | 1h |
| Documentação | 30min |
| **Total** | ~7.5h |
