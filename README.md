# Cloud Partner Hub

Modern marketing site + headless CMS for [cloudpartnerhub.com](https://cloudpartnerhub.com).

## Stack

- **Frontend**: React 19, Vite 7, Tailwind v4, Wouter, TanStack Query
- **Backend**: Express 5, Drizzle ORM, PostgreSQL, JWT auth
- **Monorepo**: pnpm workspaces, Node.js 22

## Repository layout

```
apps/
  api/      # Express API — auth, CMS routes, static file serving in production
  web/      # Public marketing site
  admin/    # CMS admin panel (served at /admin/ in production)
packages/
  db/       # Drizzle schema + migrations (shared)
```

## Local development

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET at minimum

# 3. Start all services
pnpm dev
```

| Service | URL |
|---|---|
| Public site | http://localhost:5000 |
| Admin panel | http://localhost:5000/admin/ |
| API | http://localhost:3001 |

Default admin login (created on first boot): **admin@example.com / Admin1234!**
Change it immediately after first login.

## Production deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete guide, including:

- Bare metal / VPS with PM2 + nginx (recommended)
- Docker Compose
- TLS with Certbot
- Full environment variable reference
- Upgrade procedure
- Troubleshooting common issues

## Key environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `JWT_SECRET` | yes | Random string ≥ 32 chars |
| `NODE_ENV` | prod only | Set to `production` to serve built static files |
| `VITE_SITE_URL` | prod only | Your public domain — **set before building** |
| `PORT` | no | API port (default: 3001) |
| `SMTP_HOST` | no | Email for password resets + campaigns |
| `SMTP_PORT` | no | Default: 587 |
| `SMTP_USER` | no | SMTP username |
| `SMTP_PASS` | no | SMTP password |
| `MAIL_FROM` | no | Outgoing From address |

## Building for production

```bash
export VITE_SITE_URL=https://yourdomain.com   # must be set before building

pnpm --filter @cphub/web run build    # → apps/web/dist/public
pnpm --filter @cphub/admin run build  # → apps/admin/dist/public
NODE_ENV=production pnpm --filter @cphub/api run start
```

## Migrations

Migrations run automatically on API startup. To apply manually:

```bash
pnpm --filter @cphub/db run migrate
```
