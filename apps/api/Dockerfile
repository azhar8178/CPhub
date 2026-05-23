FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild esbuild

FROM deps AS runner
COPY apps/api ./apps/api
COPY packages ./packages
EXPOSE 3001
# Runs DB migrations then starts the API.
# NODE_ENV is intentionally NOT set to production here — the API container
# does not serve web/admin static files (those run in their own containers).
CMD ["sh", "-c", "pnpm --filter @cphub/db run migrate && pnpm --filter @cphub/api run start"]
