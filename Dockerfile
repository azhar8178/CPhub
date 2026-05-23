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
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild esbuild

# ── Build web ─────────────────────────────────────────────────────────────────
FROM deps AS build-web
COPY . .
ARG VITE_SITE_URL=https://cloudpartnerhub.com
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN pnpm --filter @cphub/web run build

# ── Build admin ───────────────────────────────────────────────────────────────
FROM deps AS build-admin
COPY . .
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @cphub/admin run build

# ── Production image ──────────────────────────────────────────────────────────
# TARGET_APP controls which service this container runs:
#   api   → runs the Express API on port 3001 (default)
#   web   → serves the web SPA with `serve` on port 3000
#   admin → serves the admin SPA with `serve` on port 5173
FROM deps AS runner
RUN npm install -g serve
ENV NODE_ENV=production

ARG TARGET_APP=api
ENV TARGET_APP=$TARGET_APP

COPY apps/api ./apps/api
COPY packages/db ./packages/db
COPY package.json pnpm-workspace.yaml ./

COPY --from=build-web /app/apps/web/dist/public ./apps/web/dist/public
COPY --from=build-admin /app/apps/admin/dist/public ./apps/admin/dist/public

# Port is set by the CMD/serve command — Dockyard should use the port
# configured in its app settings (3001 for api, 3000 for web, 5173 for admin)
CMD ["sh", "-c", "\
  if [ \"$TARGET_APP\" = \"web\" ]; then \
    exec serve -s apps/web/dist/public -l 3000 --single; \
  elif [ \"$TARGET_APP\" = \"admin\" ]; then \
    exec serve -s apps/admin/dist/public -l 5173 --single; \
  else \
    pnpm --filter @cphub/db run migrate && exec pnpm --filter @cphub/api run start; \
  fi"]
