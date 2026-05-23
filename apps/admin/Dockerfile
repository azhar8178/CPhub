FROM node:20-alpine
RUN npm install -g pnpm serve
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json apps/admin/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY . .
RUN cd /app && pnpm --filter @cphub/admin run build
EXPOSE 5173
CMD ["sh", "-c", "unset PORT && serve -s apps/admin/dist/public -l 5173"]
