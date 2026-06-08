# ─── BASE ─────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ─── DEPS ─────────────────────────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN pnpm install --frozen-lockfile

# ─── BUILD ────────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules
COPY . .

# Generate Prisma client for linux-musl (Alpine)
RUN pnpm --filter @spravio/api prisma generate

# Build workspace packages then API
RUN pnpm --filter @spravio/types build && \
    pnpm --filter @spravio/utils build && \
    pnpm --filter @spravio/api build

# Rewrite package exports for production runtime (Node.js cannot load .ts)
RUN sed -i 's|./src/index.ts|./dist/index.js|g' packages/types/package.json packages/utils/package.json

# Replace workspace symlinks with real directories so Docker COPY works
# (pnpm symlinks point outside node_modules/ to ../../packages/*)
RUN for pkg in types utils; do \
      rm -f node_modules/@spravio/$pkg 2>/dev/null; \
      mkdir -p node_modules/@spravio/$pkg/dist; \
      cp packages/$pkg/package.json node_modules/@spravio/$pkg/; \
      cp -r packages/$pkg/dist/* node_modules/@spravio/$pkg/dist/; \
    done

# ─── PRODUCTION ───────────────────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production

LABEL org.opencontainers.image.source="https://github.com/your-org/spravio"
LABEL org.opencontainers.image.description="Spravio API"
LABEL org.opencontainers.image.licenses="MIT"

# All dependencies from build stage (includes generated Prisma client in the
# correct .pnpm store path and resolved workspace packages)
COPY --from=build /app/node_modules ./node_modules

# Compiled API
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY apps/api/package.json ./apps/api/
COPY package.json pnpm-workspace.yaml ./

WORKDIR /app/apps/api
EXPOSE 3010
CMD ["node", "dist/server.js"]
