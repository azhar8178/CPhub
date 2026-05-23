FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
# VITE_SITE_URL — your public domain, baked into the bundle for canonical URLs,
# OG tags, and sitemaps. Required for production.
ARG VITE_SITE_URL=https://cloudpartnerhub.com
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN pnpm --filter @cphub/web run build

FROM node:22-alpine AS runner
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/apps/web/dist/public ./public
EXPOSE 3000
# --single enables SPA fallback for client-side routing (blog/[slug], /services, etc.)
CMD ["serve", "-s", "public", "-l", "3000", "--single"]
