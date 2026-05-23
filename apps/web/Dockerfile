FROM node:20-alpine
RUN npm install -g pnpm serve
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_URL=http://cph-api.paas.lovekitchens.ie
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @cphub/web run build
EXPOSE 3000
CMD ["sh", "-c", "unset PORT && serve -s apps/web/dist/public -l 3000"]
