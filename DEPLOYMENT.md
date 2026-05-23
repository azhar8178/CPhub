# Deployment Guide — Cloud Partner Hub

This is a pnpm monorepo with three deployable apps, each with its own Dockerfile:

| App | Dockerfile | Default port |
|---|---|---|
| API (Express) | `apps/api/Dockerfile` | 3001 |
| Web (public site) | `apps/web/Dockerfile` | 3000 |
| Admin (CMS panel) | `apps/admin/Dockerfile` | 5173 |

A single-container option (all three apps in one process) is also available using the root `Dockerfile`.

---

## Option 1 — PaaS / multi-container (current setup)

Each app is deployed as a separate service. The PaaS (e.g. Coolify) builds one container per app using its respective Dockerfile.

### Step 1 — Set the Dockerfile path per service

This is the most common misconfiguration. By default many PaaS platforms pick the root `Dockerfile`. You must explicitly point each service to its own file:

| Service | Dockerfile path to set in PaaS |
|---|---|
| cph-api | `apps/api/Dockerfile` |
| cph-web | `apps/web/Dockerfile` |
| cph-admin | `apps/admin/Dockerfile` |

**In Coolify:** go to the service → Configuration → Build → "Dockerfile location" → enter the path above.

### Step 2 — Set build arguments per service

Build args are baked into the frontend bundle at build time. Set them in the PaaS service configuration (not as runtime env vars).

**cph-web build args:**
```
VITE_SITE_URL=https://cloudpartnerhub.com
```

**cph-admin build args:**
```
BASE_PATH=/
VITE_API_URL=https://cph-api.your-paas-domain.com
```
> `BASE_PATH=/` because the admin runs at its own hostname, not a sub-path.
> `VITE_API_URL` must point to the public URL of your cph-api service.

**cph-api build args:** none needed.

### Step 3 — Set runtime environment variables

Runtime vars are set in the PaaS service environment settings (not build args).

**cph-api environment:**
```
DATABASE_URL=postgres://cphub:yourpassword@your-db-host:5432/cphub
JWT_SECRET=your-long-random-secret
PORT=3001
SMTP_HOST=smtp.yourmailprovider.com   # optional
SMTP_PORT=587                          # optional
SMTP_USER=your-smtp-user              # optional
SMTP_PASS=your-smtp-pass              # optional
MAIL_FROM=hello@cloudpartnerhub.com  # optional
```

**cph-web environment:** none required at runtime (everything is baked in at build).

**cph-admin environment:** none required at runtime (everything is baked in at build).

### Step 4 — Reverse proxy / ingress

The web frontend makes API calls to relative paths (`/api/...`, `/sitemap.xml`). When web and API run on separate hostnames, your ingress or nginx must proxy those paths from the web domain to the API service.

**Example nginx ingress for the web domain:**
```nginx
server {
    listen 443 ssl http2;
    server_name cloudpartnerhub.com www.cloudpartnerhub.com;

    # ssl_certificate / ssl_certificate_key ...

    # Proxy API calls and sitemap to the API service
    location /api/ {
        proxy_pass         http://cph-api-service:3001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   X-Forwarded-Host $host;
    }

    location = /sitemap.xml {
        proxy_pass         http://cph-api-service:3001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   X-Forwarded-Host $host;
    }

    # Everything else → web container
    location / {
        proxy_pass         http://cph-web-service:3000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

If your PaaS (Coolify/Traefik) handles routing automatically, ensure these path prefixes are routed to the correct service.

### Step 5 — First-time database setup

On its first start, the `cph-api` container automatically:
1. Runs all database migrations
2. Creates the default admin user
3. Seeds sample pages, blog posts, and settings

**Default credentials** (change immediately):
- Email: `admin@example.com`
- Password: `Admin1234!`

Log in at `https://your-admin-hostname/` and go to Settings → Change password.

---

## Option 2 — Single container (VPS / Docker Compose)

All three apps run inside one Node.js process. Simpler to operate on a single server.

Uses the root `Dockerfile` and `docker-compose.single.yml`.

```bash
cp .env.example .env
# Set JWT_SECRET, POSTGRES_PASSWORD, VITE_SITE_URL

docker compose -f docker-compose.single.yml up -d --build
```

The app serves everything on port 3001:
```
GET /api/*        → Express API
GET /sitemap.xml  → Dynamic XML from DB
GET /admin/*      → Admin SPA
GET /*            → Web SPA
```

Put nginx in front for TLS. See `nginx.conf.example` for a ready-to-use config.

---

## Local development (multi-container simulation)

To test the PaaS setup locally using `docker-compose.yml`:

```bash
cp .env.example .env
# Set JWT_SECRET and POSTGRES_PASSWORD at minimum

docker compose up -d --build
```

Services will be available at:
- Web: http://localhost:3000
- Admin: http://localhost:5173
- API: http://localhost:3001

---

## Environment variable reference

### Runtime (set in PaaS env / .env file)

| Variable | Service | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | api | yes | Postgres connection string |
| `JWT_SECRET` | api | yes | Random string ≥ 32 chars |
| `PORT` | api | no | API port (default: `3001`) |
| `SMTP_HOST` | api | no | SMTP server for email |
| `SMTP_PORT` | api | no | Default: `587` |
| `SMTP_USER` | api | no | SMTP username |
| `SMTP_PASS` | api | no | SMTP password |
| `MAIL_FROM` | api | no | Outgoing From address |

### Build-time (set as PaaS build args — baked into bundle)

| Variable | Service | Required | Description |
|---|---|---|---|
| `VITE_SITE_URL` | web | yes | Public domain for canonical URLs + sitemap |
| `BASE_PATH` | admin | yes | URL base path. Use `/` for own hostname, `/admin/` for sub-path |
| `VITE_API_URL` | admin | yes | Full URL of the API service |

---

## Upgrading

Push a new commit to your repo and trigger a redeploy in your PaaS for each service (api → web → admin, in that order so migrations run first).

If you changed environment variables or build args, update them in the PaaS config before redeploying.

---

## Troubleshooting

### Build fails: `ERR_PNPM_IGNORED_BUILDS` / esbuild

pnpm v10 blocks dependency build scripts by default. This is fixed in the repo via `package.json`:
```json
"pnpm": { "onlyBuiltDependencies": ["esbuild"] }
```
If you're still seeing this, make sure you have the latest code pulled before redeploying.

### PaaS builds the wrong app (e.g. admin builds the full monorepo)

**Cause:** The PaaS is using the root `Dockerfile` instead of the per-app one.

**Fix:** In your PaaS service settings, set the Dockerfile location to the per-app path (e.g. `apps/admin/Dockerfile`). See Step 1 above.

### Admin panel is blank (white screen, no errors)

**Cause:** Admin was built with `BASE_PATH=/admin/` but is being served from a different path, causing all assets to 404.

**Fix:** Set `BASE_PATH=/` as a build arg if the admin runs at its own hostname. Only use `BASE_PATH=/admin/` if it's served as a sub-path of another domain.

### API calls fail from the web frontend (404 / network error)

**Cause:** The web app makes relative `/api/...` calls, which only work when the API is on the same origin OR your ingress proxies `/api/` to the API service.

**Fix:** Configure your ingress/nginx to proxy `/api/` and `/sitemap.xml` from the web domain to the API service. See the nginx example in Step 4 above.

### Sitemap shows wrong domain

**Cause:** The API reads the `X-Forwarded-Host` header to build sitemap URLs. If your proxy doesn't forward this header, it falls back to `localhost`.

**Fix:** Ensure your ingress sends `proxy_set_header X-Forwarded-Host $host;` and `proxy_set_header X-Forwarded-Proto $scheme;`.

### Database migration errors on first boot

**Cause:** `DATABASE_URL` is wrong or the database user lacks permissions.

**Fix:**
```bash
psql "$DATABASE_URL" -c "SELECT 1;"  # test connectivity
psql "$DATABASE_URL" -c "\du"        # check user permissions
```

### Emails not sending

Email is optional. Set `SMTP_HOST` and related vars in the API service environment. Without them, password resets and campaigns are silently skipped.
