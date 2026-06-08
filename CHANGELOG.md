# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

---

## [Unreleased]

_Nenhuma mudança pendente._

---

## [2026-05-03] — Token Encryption at Rest (SPEC-023)

### Security
- OAuth `Account.access_token` now encrypted with AES-256-GCM before storing in database
- `SlackConfig.webhookUrl` encrypted at rest with transparent decrypt on read
- `TeamsConfig.webhookUrl` encrypted at rest with transparent decrypt on read
- `NotificationChannel.slackWebhookUrl` encrypted at rest with transparent decrypt on read
- Backward compatible: existing plaintext values auto-detected and still functional

---

## [2026-05-03] — Auth Guards (SPEC-018)

### Security
- All 11 unprotected API routes now require authentication
- `DELETE /projects/:id` restricted to OWNER role
- `POST /projects/:projectId/sync/github` restricted to OWNER and PROJECT_MANAGER roles
- 9 GET routes (projects, sprints, developers, overview, pull requests) now return 401 without valid token

---

## [2026-05-03] — Project Creation Completo (SPEC-051)

### Added
- 8 new fields on Project model: `key`, `description`, `tags`, `contractType`, `contractValue`, `estimatedHours`, `startDate`, `deadline`
- Migration `20260503000000_add_project_metadata`
- `GET /organizations/members` endpoint to list org members
- Next.js proxy `GET /api/members`
- Team assignment creation (PM + devs) on project creation via `ProjectAssignment`

### Changed
- `CreateProjectInput` Zod schema now accepts all project metadata fields
- `handleCreateProject` sends all form fields to API (was only sending `name`)
- PM and Devs dropdowns in NewProjectModal populated with real org members

---

## [2026-05-03] — Client Management Fix (SPEC-037)

### Fixed
- Client field no longer blocks project creation (made optional)
- `handleCreateProject` now calls real API instead of `console.log` placeholder
- Project list loads from API (`GET /api/projects` proxy for `/projects/mine`)

### Added
- GET handler in `apps/web/src/app/api/projects/route.ts` (proxy to backend)

**Commit:** `ab30e10`

---

## [2026-05-02] — GitHub OAuth Integration

### Added
- Full GitHub OAuth login (user registration + account linking via `Account` table)
- Organization-level GitHub token management (connect/disconnect/status)
- Automatic webhook registration on org connect (push, pull_request events)
- Webhook receiver with HMAC-SHA256 signature verification (timing-safe)
- Pull request status sync via webhooks (OPEN → MERGED/CLOSED)
- Project-level repo linking (connect/disconnect per project)
- GitHub repo selector component with search
- Background sync job (`sync-github`) for PRs, reviews, contributor stats
- Developer metrics from GitHub: merge rate, cycle time, review contribution
- Jira key extraction from PR title/branch/body for cross-linking
- `GitHubWebhookConfig` and `GitHubWebhookEvent` database models
- Onboarding step for GitHub connection

### Security
- Tokens encrypted at rest via `secureToken()`/`readToken()`
- Webhook secrets stored encrypted per organization
- Tenant isolation enforced on all GitHub queries

**Commit:** `c658813`

---

## [2026-04-30] — Settings & Mock Data Cleanup

### Fixed
- Removed all mock data from production pages (members, billing, workspace)
- Settings pages now use real API data

### Added
- Notification settings API and frontend
- Security settings API (sessions & audit log)
- Webhooks API with delivery tracking
- API keys with secure generation

**Commits:** `82d531d` → `6c15b93`

---

## [2026-04-28] — Production Hardening

### Added
- Consolidation migration for phases 10-16 (`019`)
- Production hardening: health checks, deploy scripts, env validation (`020`)
- GHCR package visibility automation
- Direct build deployment workflow

### Fixed
- TypeScript errors in Web and API
- GHCR credentials in deploy workflow
- Docker image registry paths

### Security
- Replaced plaintext passwords with bcrypt hashing (`017`)

**Commits:** `508d41e` → `1850bca`

---

## [2026-04-20] — Dashboard & UI Overhaul

### Added
- Complete dashboard redesign with OKLCH design system
- Portfolio and Projects pages
- Organization-wide Financials dashboard
- Cross-project Sprints page
- Pull Requests inbox
- Forecast dashboard with advanced analytics
- Integrations management page
- Organization Settings pages (Billing, Webhooks, Notifications, Security)
- Role-based access control (RBAC) system
- Enhanced error boundaries with OKLCH design system
- User profile management
- Database seeder for dev environment

### Fixed
- Proper overflow behavior in scrollable containers
- Null values in user profile optional fields

**Commits:** `82a30fc` → `d1d6cf1`

---

## [2026-04-15] — Landing Page & Auth

### Added
- Complete landing page from design (responsive, animated)
- Multilingual support (EN/PT)
- Mobile app section
- Integrations strip with SVG logos
- Password reset flow with email verification
- Password visibility toggle on login/register

### Security
- Critical vulnerability fixes, Next.js upgrade
- Secret rotation
- ENCRYPTION_KEY added to production env

**Commits:** `d026e79` → `880aded`

---

## [2026-04-10] — VPS Migration & Deployment

### Added
- VPS migration from Vercel to self-hosted (Traefik reverse proxy)
- Comprehensive README with CI/CD info
- Development roadmap
- Sentry error tracking setup
- Product Requirements Document (PRD)

### Fixed
- Multiple Docker build and deploy issues (Prisma client path, health checks, env encoding)
- GHCR image tag fixes
- Deploy script improvements

**Commits:** `beae879` → `da97fa8`

---

## [2026-04-04] — SDD Framework

### Added
- Spec-Driven Development framework (`.specify/`, templates, commands)
- Specs backlog (017–030)
- Constitution document with architectural rules
- CLAUDE.md as AI development guide

**Commit:** `a96ecaa`

---

## [2026-04-01] — Foundation (Phases 1–16)

### Added
- Monorepo setup (pnpm workspaces: `apps/api`, `apps/web`, `packages/types`, `packages/utils`)
- Fastify 5 API with modular architecture
- Next.js 14.2 frontend with App Router
- PostgreSQL + Prisma ORM (23 models)
- Redis caching with ioredis
- BullMQ job queue
- NextAuth.js authentication
- **Integrations (14 services):**
  - PM: Jira, Azure DevOps, Trello, ClickUp, Linear, Asana, Monday
  - Code: GitHub (basic), GitLab
  - Time: Tempo, Clockify
  - Messaging: Slack, Teams
  - AI: Anthropic Claude (Delivery Forecast)
- Docker Compose setup with CI/CD pipeline
- Onboarding wizard
- Sentry monitoring integration

**Commits:** `29329a8` → `00fedc7`

---

_Última atualização: 2026-05-03_
