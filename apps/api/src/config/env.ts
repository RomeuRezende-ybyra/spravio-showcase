import { z } from 'zod'

/** Treat empty strings as undefined for optional env vars */
const emptyToUndefined = (v: unknown) => (v === '' ? undefined : v)
const optStr = z.preprocess(emptyToUndefined, z.string().optional())
const optUrl = z.preprocess(emptyToUndefined, z.string().url().optional())
const optEmail = z.preprocess(emptyToUndefined, z.string().email().optional())

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32).regex(
    /^[A-Za-z0-9+/=]{32,}$/,
    'JWT_SECRET must be a strong base64 string (32+ chars)'
  ),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // CORS - Allowed origins (comma-separated)
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .default('http://localhost:3000,http://localhost:3011')
    .transform((val) => val.split(',').map((v) => v.trim())),

  // Jira (optional during foundation phase)
  JIRA_BASE_URL: optUrl,
  JIRA_EMAIL: optEmail,
  JIRA_API_TOKEN: optStr,
  JIRA_CLOUD_ID: optStr,

  // GitHub (optional during foundation phase)
  GITHUB_TOKEN: optStr,
  GITHUB_ORG: optStr,
  GITHUB_CLIENT_ID: optStr,
  GITHUB_CLIENT_SECRET: optStr,

  // GitLab (optional — alternative to GitHub)
  GITLAB_URL: optUrl, // defaults to https://gitlab.com in client
  GITLAB_TOKEN: optStr,
  GITLAB_GROUP: optStr,

  // Stripe (optional — billing disabled if not set)
  STRIPE_SECRET_KEY: optStr,
  STRIPE_WEBHOOK_SECRET: optStr,
  STRIPE_PRICE_STARTER: optStr,
  STRIPE_PRICE_GROWTH: optStr,
  STRIPE_PRICE_SCALE: optStr,

  // Azure DevOps (optional)
  AZURE_ORG: optStr,
  AZURE_PROJECT: optStr,
  AZURE_PAT: optStr,
  AZURE_BASE_URL: optUrl,

  // Slack (optional)
  SLACK_BOT_TOKEN: optStr,
  SLACK_DEFAULT_CHANNEL: optStr,

  // Sentry (optional)
  SENTRY_DSN_API: optUrl,

  // Portal
  PORTAL_SECRET: z.string().min(32).regex(
    /^[A-Za-z0-9+/=]{32,}$/,
    'PORTAL_SECRET must be a strong base64 string (32+ chars)'
  ).default('portal-dev-secret-change-me-use-strong-in-prod'),

  // Encryption (for sensitive tokens in database)
  ENCRYPTION_KEY: z.string().min(64).regex(
    /^[A-Za-z0-9+/=]{64,}$/,
    'ENCRYPTION_KEY must be a strong base64 string (64+ bytes)'
  ).optional().default('dev-only-encryption-key-change-in-production-use-64-bytes'),

  // Secret rotation support (optional - used during rotation period)
  JWT_SECRET_OLD: z.string().min(32).regex(/^[A-Za-z0-9+/=]{32,}$/).optional(),
  ENCRYPTION_KEY_OLD: z.string().min(64).regex(/^[A-Za-z0-9+/=]{64,}$/).optional(),

  // Anthropic (AI forecasting)
  ANTHROPIC_API_KEY: optStr,

  // Trello
  TRELLO_API_KEY: optStr,
  TRELLO_TOKEN: optStr,

  // ClickUp
  CLICKUP_API_TOKEN: optStr,

  // Linear
  LINEAR_API_KEY: optStr,

  // Asana
  ASANA_TOKEN: optStr,

  // Monday.com
  MONDAY_API_TOKEN: optStr,
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('Invalid environment variables:')
    console.error(result.error.flatten().fieldErrors)
    process.exit(1)
  }

  return result.data
}

export const env = loadEnv()
