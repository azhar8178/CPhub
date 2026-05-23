FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3001
CMD ["sh", "-c", "pnpm --filter @cphub/db run migrate && pnpm --filter @cphub/api run start"]
