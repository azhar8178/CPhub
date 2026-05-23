FROM node:20-alpine
RUN npm install -g pnpm serve
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json apps/admin/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @cphub/admin run build
EXPOSE 5173
CMD ["serve", "-s", "apps/admin/dist", "-l", "5173"]
