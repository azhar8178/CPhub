import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { logger } from "./lib/logger";
import apiRouter from "./routes";
import { db, cphubPagesTable, cphubPostsTable } from "@cphub/db";
import { eq } from "drizzle-orm";

const app: Express = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(pinoHttp({ logger }));

app.use("/api", apiRouter);

app.get("/sitemap.xml", async (req, res) => {
  try {
    const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
    const host = (req.headers["x-forwarded-host"] as string) ?? req.headers.host ?? "localhost";
    const base = `${proto}://${host}`;

    const [pages, posts] = await Promise.all([
      db
        .select({ slug: cphubPagesTable.slug, updatedAt: cphubPagesTable.updatedAt })
        .from(cphubPagesTable)
        .where(eq(cphubPagesTable.status, "published")),
      db
        .select({ slug: cphubPostsTable.slug, updatedAt: cphubPostsTable.updatedAt, publishedAt: cphubPostsTable.publishedAt })
        .from(cphubPostsTable)
        .where(eq(cphubPostsTable.status, "published")),
    ]);

    const staticRoutes = [
      { url: "/", priority: "1.0", changefreq: "weekly" },
      { url: "/services", priority: "0.9", changefreq: "monthly" },
      { url: "/case-studies", priority: "0.9", changefreq: "monthly" },
      { url: "/about", priority: "0.8", changefreq: "monthly" },
      { url: "/contact", priority: "0.7", changefreq: "monthly" },
      { url: "/blog", priority: "0.8", changefreq: "weekly" },
    ];

    const knownSlugs = new Set(["home", "services", "case-studies", "about"]);
    const dynamicPageEntries = pages
      .filter((p) => !knownSlugs.has(p.slug))
      .map((p) => ({
        loc: `${base}/p/${p.slug}`,
        lastmod: p.updatedAt.toISOString().slice(0, 10),
        changefreq: "monthly",
        priority: "0.6",
      }));

    const postEntries = posts.map((p) => ({
      loc: `${base}/blog/${p.slug}`,
      lastmod: (p.updatedAt ?? p.publishedAt ?? new Date()).toISOString().slice(0, 10),
      changefreq: "never",
      priority: "0.7",
    }));

    const urlEntry = (e: { loc: string; lastmod?: string; changefreq: string; priority: string }) =>
      `  <url>\n    <loc>${e.loc}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`;

    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...staticRoutes.map((r) => urlEntry({ loc: `${base}${r.url}`, changefreq: r.changefreq, priority: r.priority })),
      ...dynamicPageEntries.map(urlEntry),
      ...postEntries.map(urlEntry),
      `</urlset>`,
    ].join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    logger.error({ err }, "Failed to generate sitemap");
    res.status(500).send("Error generating sitemap");
  }
});

// ── Production static file serving ───────────────────────────────────────────
// In development the Vite dev servers handle /admin and the web SPA.
// In production (NODE_ENV=production) the built files are served here.
if (process.env.NODE_ENV === "production") {
  const webDist = path.resolve(import.meta.dirname, "../../web/dist/public");
  const adminDist = path.resolve(import.meta.dirname, "../../admin/dist/public");

  const webExists = fs.existsSync(webDist);
  const adminExists = fs.existsSync(adminDist);

  if (adminExists) {
    // Serve admin static assets (JS/CSS chunks have /admin/ prefix from Vite base)
    app.use("/admin", express.static(adminDist, { index: false }));
    // SPA fallback — any /admin/* path returns admin's index.html
    app.get("/admin", (_req, res) => res.sendFile(path.join(adminDist, "index.html")));
    app.get("/admin/*path", (_req, res) => res.sendFile(path.join(adminDist, "index.html")));
    logger.info({ adminDist }, "Serving admin static files");
  } else {
    logger.warn({ adminDist }, "Admin build not found — run: pnpm --filter @cphub/admin run build");
  }

  if (webExists) {
    // Serve web static assets
    app.use(express.static(webDist, { index: false }));
    // SPA fallback — everything else returns the web app's index.html
    app.get("*path", (_req, res) => res.sendFile(path.join(webDist, "index.html")));
    logger.info({ webDist }, "Serving web static files");
  } else {
    logger.warn({ webDist }, "Web build not found — run: pnpm --filter @cphub/web run build");
    app.get("/", (_req, res) => res.json({ name: "cphub-api", status: "ok" }));
  }
} else {
  app.get("/", (_req, res) => res.json({ name: "cphub-api", status: "ok" }));
}

export default app;
