FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/admin/package.json apps/admin/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm rebuild esbuild

FROM deps AS builder
COPY . .
# Standalone container: build with BASE_PATH=/ so assets resolve from the
# container root. If your reverse proxy serves this app at /admin/, set
# BASE_PATH=/admin/ instead (and configure nginx to rewrite paths accordingly).
ARG BASE_PATH=/
ARG VITE_API_URL=http://localhost:3001
ENV BASE_PATH=$BASE_PATH
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @cphub/admin run build

FROM node:22-alpine AS runner
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/apps/admin/dist/public ./public
EXPOSE 5173
# --single enables SPA fallback so client-side routes like /posts, /team etc. work
CMD ["serve", "-s", "public", "-l", "5173", "--single"]
