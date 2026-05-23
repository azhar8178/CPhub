FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# ── Install dependencies ──────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile

# ── Build web ─────────────────────────────────────────────────────────────────
FROM deps AS build-web
COPY . .
ARG VITE_SITE_URL=https://cloudpartnerhub.com
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN pnpm --filter @cphub/web run build

# ── Build admin ───────────────────────────────────────────────────────────────
FROM deps AS build-admin
COPY . .
RUN pnpm --filter @cphub/admin run build

# ── Production image ──────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules 2>/dev/null || true

COPY apps/api ./apps/api
COPY packages/db ./packages/db
COPY package.json pnpm-workspace.yaml ./

COPY --from=build-web /app/apps/web/dist/public ./apps/web/dist/public
COPY --from=build-admin /app/apps/admin/dist/public ./apps/admin/dist/public

EXPOSE 3001
CMD ["node", "--loader", "tsx/esm", "apps/api/src/index.ts"]
