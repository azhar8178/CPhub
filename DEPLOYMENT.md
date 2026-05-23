# Deployment Guide — Cloud Partner Hub

This guide covers three deployment paths:

1. **Bare metal / VPS** — Node.js + PM2 + nginx (recommended for most self-hosters)
2. **Docker Compose** — easiest for clean servers
3. **Manual build + serve** — for custom setups

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20 or 22 LTS |
| pnpm | 9+ (`npm i -g pnpm`) |
| PostgreSQL | 15 or 16 |
| nginx | any recent version (for TLS termination) |

---

## Option 1 — Bare metal / VPS (recommended)

### 1. Clone and install

```bash
git clone https://github.com/your-org/cphub.git
cd cphub
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
nano .env
```

Set at minimum:

```env
DATABASE_URL=postgres://cphub:yourpassword@localhost:5432/cphub
JWT_SECRET=a-very-long-random-string-minimum-32-chars
VITE_SITE_URL=https://yourdomain.com
PORT=3001
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Important:** `VITE_SITE_URL` must be set **before** building — it gets baked into the frontend bundle.

### 3. Create the database

```bash
sudo -u postgres psql -c "CREATE USER cphub WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "CREATE DATABASE cphub OWNER cphub;"
```

### 4. Build all apps

```bash
# Build web (public site) — uses VITE_SITE_URL from .env
pnpm --filter @cphub/web run build

# Build admin panel
pnpm --filter @cphub/admin run build
```

Both commands output to `apps/web/dist/public` and `apps/admin/dist/public` respectively.

### 5. Start the API

The API auto-runs database migrations and seeds initial content on first boot.

```bash
# One-off start (for testing)
NODE_ENV=production pnpm --filter @cphub/api run start

# Or source the .env file first
export $(grep -v '^#' .env | xargs) && NODE_ENV=production pnpm --filter @cphub/api run start
```

You should see:
```
API server listening on port 3001
Database migrations complete
```

### 6. Keep it running with PM2

```bash
npm i -g pm2

pm2 start apps/api/src/index.ts \
  --name cphub-api \
  --interpreter "node" \
  --interpreter-args "--loader tsx/esm" \
  --env-file .env \
  -- NODE_ENV=production

pm2 save
pm2 startup   # follow the printed command to enable auto-start on reboot
```

Check it's running:
```bash
pm2 status
pm2 logs cphub-api
```

### 7. Configure nginx

Copy the example config:
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/cloudpartnerhub.com
sudo ln -s /etc/nginx/sites-available/cloudpartnerhub.com /etc/nginx/sites-enabled/
```

Edit it to replace `cloudpartnerhub.com` with your actual domain, then:

```bash
sudo nginx -t        # test config
sudo systemctl reload nginx
```

### 8. TLS with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot auto-updates the nginx config and sets up auto-renewal.

---

## Option 2 — Docker Compose

### 1. Configure environment

```bash
cp .env.example .env
nano .env
```

Set `JWT_SECRET`, `POSTGRES_PASSWORD`, and `VITE_SITE_URL`.

### 2. Build and start

```bash
docker compose up -d --build
```

The app will be available on port `3001` (or whatever `APP_PORT` is set to).
Put nginx in front of it for TLS (same nginx config above, proxy_pass to `http://127.0.0.1:3001`).

### 3. View logs

```bash
docker compose logs -f app
```

### 4. Update to latest

```bash
git pull
docker compose up -d --build
```

---

## Option 3 — Manual build + serve

Use this if you want to serve the static files from a CDN or separate static host.

```bash
# Build with your domain baked in
VITE_SITE_URL=https://yourdomain.com pnpm --filter @cphub/web run build
pnpm --filter @cphub/admin run build

# Run only the API (no static serving)
NODE_ENV=development PORT=3001 pnpm --filter @cphub/api run start
```

Then upload:
- `apps/web/dist/public` → your static host / CDN
- `apps/admin/dist/public` → same host, served at path `/admin/`

Point your domain's root to the web static files. Configure your static host to:
- Serve `/admin/*` from the admin dist folder, with a fallback to `/admin/index.html`
- Serve everything else from the web dist folder, with a fallback to `/index.html`
- Proxy `/api/*` and `/sitemap.xml` to your API process

---

## How the production server works

When `NODE_ENV=production` the single Node.js process serves **everything**:

```
GET /api/*         → Express API routes
GET /sitemap.xml   → Dynamically generated from DB
GET /admin         → apps/admin/dist/public/index.html (SPA)
GET /admin/*       → apps/admin/dist/public/* (static assets + SPA fallback)
GET /*             → apps/web/dist/public/* (static assets + SPA fallback)
```

No separate Vite dev server in production. nginx sits in front only for TLS and connection handling.

---

## First-time setup

On first boot the API automatically:
1. Runs all database migrations
2. Creates the default admin user
3. Seeds sample pages, blog posts, and settings

**Default credentials** (change immediately):
- Email: `admin@example.com`
- Password: `Admin1234!`

Change the password at `/admin/settings` after first login.

---

## Environment variable reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | Full Postgres connection string |
| `JWT_SECRET` | yes | Random string ≥ 32 chars for signing tokens |
| `PORT` | no | API port (default: `3001`) |
| `NODE_ENV` | yes in prod | Set to `production` to enable static file serving |
| `VITE_SITE_URL` | yes in prod | Your public domain — set **before** building the frontend |
| `SMTP_HOST` | no | SMTP server for password resets and email campaigns |
| `SMTP_PORT` | no | SMTP port (default: `587`) |
| `SMTP_USER` | no | SMTP username |
| `SMTP_PASS` | no | SMTP password |
| `MAIL_FROM` | no | From address for outgoing emails |
| `POSTGRES_PASSWORD` | Docker only | Postgres password for the db container |
| `APP_PORT` | Docker only | Host port to bind the app to (default: `3001`) |

---

## Upgrading

```bash
git pull
pnpm install

# Rebuild the frontend (required after any code change)
VITE_SITE_URL=https://yourdomain.com pnpm --filter @cphub/web run build
pnpm --filter @cphub/admin run build

# Restart the API (migrations run automatically on startup)
pm2 restart cphub-api   # if using PM2
# or: docker compose up -d --build   # if using Docker
```

---

## Troubleshooting

### Admin panel returns 404 or blank page

**Cause:** The admin was not built before starting in production mode, or `NODE_ENV` is not set to `production`.

**Fix:**
```bash
pnpm --filter @cphub/admin run build
NODE_ENV=production pm2 restart cphub-api
```

### Site shows API JSON instead of the web app

**Cause:** The web app was not built.

**Fix:**
```bash
VITE_SITE_URL=https://yourdomain.com pnpm --filter @cphub/web run build
pm2 restart cphub-api
```

### Database migration errors on startup

**Cause:** `DATABASE_URL` is wrong, or the database/user does not exist.

**Fix:** Check the connection string and confirm the DB user has full access:
```bash
psql "$DATABASE_URL" -c "SELECT 1;"
```

### Emails are not sending

Email delivery is optional. If `SMTP_HOST` is not set, password reset and campaign emails are silently skipped. Add your SMTP credentials to `.env` and restart.

### API returns CORS errors

The API allows all origins in production. If you're seeing CORS errors, check that nginx is forwarding `Host` and `X-Forwarded-*` headers correctly (the example config does this).

### Sitemap shows `localhost` URLs instead of your domain

**Cause:** `VITE_SITE_URL` or the `X-Forwarded-Host` header is not set.

**Fix:** Ensure nginx sends `proxy_set_header X-Forwarded-Host $host;` (the example config does this).
