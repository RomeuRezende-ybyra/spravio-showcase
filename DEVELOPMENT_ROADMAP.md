# 🚀 Spravio - Development Roadmap

> **Status**: In Progress
> **Última atualização**: 2026-04-23

---

## ✅ Fase 1: Limpeza e Organização (CONCLUÍDA)

### 1.1 Correção de Lint
- [x] Corrigir erro crítico em `audit-tenant-isolation.ts`
- [x] Reduzir warnings de 47 para 44
- [x] CI passando com sucesso

### 1.2 Limpeza de Dados Mock
- [x] Resetar banco de dados (DROP SCHEMA)
- [x] Remover dados hardcoded de Settings/Notifications
- [x] Remover dados hardcoded de Settings/Security
- [x] Remover dados hardcoded de Settings/Webhooks
- [x] Remover dados hardcoded de Settings/API Keys
- [x] Adicionar TODOs para carregar dados reais

### 1.3 Validação de Checkboxes
- [x] Verificar Login "Keep logged in" = checked
- [x] Verificar Register "Accept terms" = checked
- [x] Verificar Integration webhooks = defaultChecked
- [x] Verificar Slack alerts = unchecked
- [x] Verificar API scopes = unchecked

**Commits**:
- `663e5d6` - fix(lint): resolve critical lint error
- `a5416f2` - feat(cleanup): remove mock data and clean database

---

## 📋 Fase 2: Implementação de APIs Reais

### 2.1 Notification Settings API
**Backend** (`apps/api`):
- [ ] Criar model `NotificationSetting` no Prisma schema
  - userId (FK)
  - event (string)
  - emailEnabled (boolean)
  - slackEnabled (boolean)
  - inAppEnabled (boolean)
- [ ] Criar model `NotificationChannel` no Prisma schema
  - userId (FK)
  - email (string)
  - emailVerified (boolean)
  - slackWebhook (string, encrypted)
  - slackChannel (string)
  - slackConnected (boolean)
- [ ] Rodar migração: `pnpm db:migrate`
- [ ] Criar módulo `src/modules/notifications/`
  - [ ] `service.ts` - Lógica de negócio
  - [ ] `routes.ts` - Endpoints
  - [ ] `types.ts` - Tipos/schemas
- [ ] Implementar endpoints:
  - [ ] `GET /user/notification-settings` - Lista preferências
  - [ ] `PUT /user/notification-settings` - Atualiza preferências
  - [ ] `GET /user/notification-channels` - Lista canais configurados
  - [ ] `PUT /user/notification-channels/email` - Configura email
  - [ ] `PUT /user/notification-channels/slack` - Configura Slack
  - [ ] `POST /user/notification-channels/slack/test` - Testa Slack
- [ ] Adicionar autenticação (JWT middleware)
- [ ] Validação com Zod
- [ ] Testes unitários

**Frontend** (`apps/web`):
- [ ] Criar hook `useNotificationSettings()`
- [ ] Criar hook `useNotificationChannels()`
- [ ] Atualizar `settings/notifications/page.tsx`:
  - [ ] Fetch dados reais da API
  - [ ] Loading states
  - [ ] Error states
  - [ ] Empty states
  - [ ] Handler para salvar preferências
  - [ ] Handler para configurar canais
  - [ ] Feedback visual (toast/alert)
- [ ] Adicionar tipos em `@spravio/types`

**Estimativa**: 1-2 dias

---

### 2.2 Security API (Sessions & Audit Log)
**Backend** (`apps/api`):
- [ ] Criar model `UserSession` no Prisma schema
  - userId (FK)
  - sessionToken (unique)
  - device (string)
  - ipAddress (string)
  - location (string) - geolocation opcional
  - userAgent (string)
  - lastActive (DateTime)
  - expiresAt (DateTime)
- [ ] Criar model `AuditLog` no Prisma schema
  - userId (FK)
  - event (string)
  - ipAddress (string)
  - userAgent (string)
  - metadata (JSON)
  - createdAt (DateTime)
- [ ] Atualizar login para registrar sessões
- [ ] Criar módulo `src/modules/security/`
- [ ] Implementar endpoints:
  - [ ] `GET /user/sessions` - Lista sessões ativas
  - [ ] `DELETE /user/sessions/:id` - Revoga sessão específica
  - [ ] `DELETE /user/sessions` - Revoga todas exceto atual
  - [ ] `GET /user/audit-log` - Lista histórico (paginado)
  - [ ] `GET /user/2fa/status` - Status do 2FA
  - [ ] `POST /user/2fa/enable` - Habilita 2FA
  - [ ] `POST /user/2fa/disable` - Desabilita 2FA
  - [ ] `POST /user/2fa/verify` - Verifica código TOTP
- [ ] Middleware para logging automático de eventos
- [ ] Testes unitários

**Frontend** (`apps/web`):
- [ ] Criar hook `useSessions()`
- [ ] Criar hook `useAuditLog()`
- [ ] Criar hook `use2FA()`
- [ ] Atualizar `settings/security/page.tsx`:
  - [ ] Fetch sessões reais
  - [ ] Handler para revogar sessões
  - [ ] Fetch audit log real (paginado)
  - [ ] Modal para configurar 2FA
  - [ ] QR code para TOTP
  - [ ] Input para backup codes
- [ ] Adicionar tipos em `@spravio/types`

**Estimativa**: 2-3 dias

---

### 2.3 Webhooks API
**Backend** (`apps/api`):
- [ ] Criar model `Webhook` no Prisma schema
  - organizationId (FK)
  - name (string)
  - url (string)
  - secret (string, encrypted)
  - events (string[])
  - isActive (boolean)
  - lastDeliveryAt (DateTime)
  - lastDeliveryStatus (string)
  - successRate (float)
  - deliveryCount (int)
  - failureCount (int)
  - createdAt (DateTime)
- [ ] Criar model `WebhookDelivery` no Prisma schema
  - webhookId (FK)
  - event (string)
  - payload (JSON)
  - responseStatus (int)
  - responseBody (string)
  - deliveredAt (DateTime)
  - success (boolean)
- [ ] Criar módulo `src/modules/webhooks/`
- [ ] Implementar endpoints:
  - [ ] `GET /webhooks` - Lista webhooks
  - [ ] `POST /webhooks` - Cria webhook
  - [ ] `GET /webhooks/:id` - Detalhes do webhook
  - [ ] `PUT /webhooks/:id` - Atualiza webhook
  - [ ] `DELETE /webhooks/:id` - Deleta webhook
  - [ ] `POST /webhooks/:id/test` - Envia teste
  - [ ] `GET /webhooks/:id/deliveries` - Histórico de entregas
- [ ] Criar serviço de dispatch de webhooks
- [ ] Assinatura HMAC para segurança
- [ ] Retry logic com backoff exponencial
- [ ] Testes unitários

**Frontend** (`apps/web`):
- [ ] Criar hook `useWebhooks()`
- [ ] Criar hook `useWebhookDeliveries()`
- [ ] Atualizar `settings/webhooks/page.tsx`:
  - [ ] Fetch webhooks reais
  - [ ] Modal para criar/editar webhook
  - [ ] Form com validação de URL
  - [ ] Seleção de eventos
  - [ ] Handler para testar webhook
  - [ ] Mostrar histórico de deliveries
  - [ ] Estatísticas de success rate
- [ ] Adicionar tipos em `@spravio/types`

**Estimativa**: 2-3 dias

---

### 2.4 API Keys
**Backend** (`apps/api`):
- [ ] Criar model `ApiKey` no Prisma schema
  - organizationId (FK)
  - name (string)
  - keyPrefix (string) - "spv_live_" ou "spv_test_"
  - keyHash (string) - bcrypt hash
  - scopes (string[]) - ["read", "write", "admin"]
  - lastUsedAt (DateTime)
  - expiresAt (DateTime)
  - isActive (boolean)
  - createdAt (DateTime)
- [ ] Criar módulo `src/modules/api-keys/`
- [ ] Implementar endpoints:
  - [ ] `GET /api-keys` - Lista keys
  - [ ] `POST /api-keys` - Cria key (retorna key completa apenas 1x)
  - [ ] `PUT /api-keys/:id` - Atualiza scopes
  - [ ] `DELETE /api-keys/:id` - Revoga key
- [ ] Criar middleware de autenticação por API key
- [ ] Gerar keys seguras (crypto.randomBytes)
- [ ] Rate limiting por API key
- [ ] Logging de uso de API keys
- [ ] Testes unitários

**Frontend** (`apps/web`):
- [ ] Criar hook `useApiKeys()`
- [ ] Atualizar `settings/api/page.tsx`:
  - [ ] Fetch API keys reais
  - [ ] Modal para criar key
  - [ ] Form com nome e seleção de scopes
  - [ ] Mostrar key completa apenas na criação
  - [ ] Copy to clipboard
  - [ ] Warning sobre não poder ver key novamente
  - [ ] Handler para revogar keys
  - [ ] Mostrar last used timestamp
- [ ] Adicionar tipos em `@spravio/types`

**Estimativa**: 1-2 dias

---

## 📦 Fase 3: Integração e Polimento

### 3.1 Testes E2E
- [ ] Criar testes Playwright para flows críticos
- [ ] Teste: Registro → Login → Configurar notificações
- [ ] Teste: Criar projeto → Configurar webhook → Receber evento
- [ ] Teste: Criar API key → Fazer request autenticado

### 3.2 Documentação
- [ ] Documentar API endpoints (Swagger/OpenAPI)
- [ ] Atualizar README com novas features
- [ ] Criar guia de configuração de webhooks
- [ ] Criar guia de uso de API keys

### 3.3 Deploy e Monitoramento
- [ ] Configurar alertas para falhas de webhook
- [ ] Dashboard de métricas de API keys
- [ ] Logs estruturados com contexto
- [ ] Health checks

---

## 🎯 Critérios de Aceitação

Cada feature deve atender:
- [ ] Backend: Todos os endpoints implementados e testados
- [ ] Frontend: UI funcional com loading/error/empty states
- [ ] Tipos: Types compartilhados em `@spravio/types`
- [ ] Segurança: Validação, autenticação, autorização
- [ ] Testes: Cobertura mínima de 80%
- [ ] Lint: 0 erros
- [ ] TypeCheck: 0 erros
- [ ] CI: Passing
- [ ] Deploy: Sem quebrar produção

---

## 📝 Notas

### Estratégia de Deploy
1. Fazer commit incremental após cada feature completa
2. Rodar CI/CD para validar
3. Deploy automático em produção
4. Monitorar por 24h antes da próxima feature
5. Rollback imediato se houver problemas

### Priorização
- **P0 (Crítico)**: Notification Settings, Security/Sessions
- **P1 (Alta)**: Webhooks
- **P2 (Média)**: API Keys

### Riscos
- **Migração de dados**: Schemas novos podem afetar queries existentes
- **Breaking changes**: Remover mock data pode quebrar frontend temporariamente
- **Performance**: Webhooks com retry podem sobrecarregar sistema

---

## 🔄 Changelog

### 2026-04-23
- ✅ Fase 1 concluída: Limpeza de mock data e correção de lint
- ✅ Database resetado com schema limpo
- ✅ CI/CD funcionando perfeitamente
- 📝 Roadmap criado para Fase 2
