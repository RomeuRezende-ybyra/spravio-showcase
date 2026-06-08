# ─── BASE ─────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ─── DEPS ─────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile

# ─── BUILD ────────────────────────────────────────────────────────────────────
FROM base AS build

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .

RUN pnpm --filter @spravio/web build

# ─── PRODUCTION ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

LABEL org.opencontainers.image.source="https://github.com/your-org/spravio"
LABEL org.opencontainers.image.description="Spravio Web"
LABEL org.opencontainers.image.licenses="MIT"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=build /app/apps/web/public ./public
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
