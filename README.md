# Cloud Partner Hub

Modern marketing site + headless CMS for [cloudpartnerhub.com](https://cloudpartnerhub.com).

## Stack

- **Frontend**: React 19, Vite 7, Tailwind v4, wouter, @tanstack/react-query
- **Backend**: Express 5, Drizzle ORM, PostgreSQL, JWT auth
- **Monorepo**: pnpm workspaces

## Layout

```
apps/
  api/      # Express API (port 3001) — auth + cphub routes
  web/      # Public marketing site (port 5000)
  admin/    # CMS admin panel (port 5173, served at /admin/)
packages/
  db/       # Drizzle schema + migrations
```

## Quick start

```bash
pnpm install
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET
pnpm dev
```

Then open:

- Public site: <http://localhost:5000>
- Admin panel: <http://localhost:5173/admin/>
- API: <http://localhost:3001/api/healthz>

Default admin login (created on first boot): **admin@example.com / Admin1234!** — change it immediately in production.

## Environment

| Variable        | Required | Notes                                              |
| --------------- | -------- | -------------------------------------------------- |
| `DATABASE_URL`  | yes      | Postgres connection string                         |
| `JWT_SECRET`    | yes      | Long random string used to sign auth tokens        |
| `PORT`          | no       | API port (default 3001)                            |
| `SMTP_HOST`     | no       | Email host for password resets & campaigns         |
| `SMTP_PORT`     | no       | Email port (default 587)                           |
| `SMTP_USER`     | no       | SMTP username                                      |
| `SMTP_PASS`     | no       | SMTP password                                      |
| `MAIL_FROM`     | no       | Default From address                               |

## Migrations

Migrations run automatically on API startup. To apply manually:

```bash
pnpm --filter @cphub/db run migrate
```
