FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/admin/package.json apps/admin/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @cphub/web run build
RUN npm install -g serve concurrently
EXPOSE 3001
CMD ["concurrently", "pnpm --filter @cphub/api run start", "serve -s apps/web/dist/public -l 5000"]
