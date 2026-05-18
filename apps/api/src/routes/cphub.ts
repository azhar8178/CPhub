import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  db,
  cphubPagesTable,
  cphubPostsTable,
  cphubLeadsTable,
  cphubEmailTemplatesTable,
  cphubEmailCampaignsTable,
  cphubSubscribersTable,
  cphubMediaTable,
  cphubSettingsTable,
} from "@cphub/db";
import { requireRole } from "../middlewares/auth";

const router: IRouter = Router();
const adminOnly = requireRole("admin", "supervisor");

// ─────────────────────────── PUBLIC ROUTES ───────────────────────────────────

// Public: list published pages
router.get("/cphub/public/pages", async (_req, res) => {
  const rows = await db
    .select()
    .from(cphubPagesTable)
    .where(eq(cphubPagesTable.status, "published"))
    .orderBy(desc(cphubPagesTable.updatedAt));
  res.json(rows);
});

// Public: get one page by slug
router.get("/cphub/public/pages/:slug", async (req, res) => {
  const row = await db
    .select()
    .from(cphubPagesTable)
    .where(
      and(
        eq(cphubPagesTable.slug, req.params.slug),
        eq(cphubPagesTable.status, "published"),
      ),
    )
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!row) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  res.json(row);
});

// Public: list published posts
router.get("/cphub/public/posts", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const rows = await db
    .select()
    .from(cphubPostsTable)
    .where(eq(cphubPostsTable.status, "published"))
    .orderBy(desc(cphubPostsTable.publishedAt))
    .limit(limit);
  res.json(rows);
});

// Public: get one post by slug
router.get("/cphub/public/posts/:slug", async (req, res) => {
  const row = await db
    .select()
    .from(cphubPostsTable)
    .where(
      and(
        eq(cphubPostsTable.slug, req.params.slug),
        eq(cphubPostsTable.status, "published"),
      ),
    )
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(row);
});

// Public: get site settings (branding, contact info, etc.)
router.get("/cphub/public/settings", async (_req, res) => {
  const rows = await db.select().from(cphubSettingsTable);
  const obj: Record<string, unknown> = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

// Public: submit contact form
router.post("/cphub/public/leads", async (req: Request, res: Response) => {
  const body = req.body ?? {};
  if (!body.name || !body.email || !body.message) {
    res.status(400).json({ error: "name, email, and message are required" });
    return;
  }
  const honeypot = (body._hp ?? "").toString();
  if (honeypot.length > 0) {
    res.json({ ok: true });
    return;
  }
  const [row] = await db
    .insert(cphubLeadsTable)
    .values({
      name: String(body.name).slice(0, 200),
      email: String(body.email).slice(0, 200),
      company: body.company ? String(body.company).slice(0, 200) : null,
      phone: body.phone ? String(body.phone).slice(0, 50) : null,
      subject: body.subject ? String(body.subject).slice(0, 200) : null,
      message: String(body.message).slice(0, 5000),
      source: body.source ? String(body.source).slice(0, 100) : "contact_form",
      meta: { ip: req.ip, userAgent: req.headers["user-agent"] },
    })
    .returning();
  res.json({ ok: true, id: row.id });
});

// Public: subscribe to newsletter
router.post("/cphub/public/subscribe", async (req: Request, res: Response) => {
  const body = req.body ?? {};
  if (!body.email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  const email = String(body.email).trim().toLowerCase().slice(0, 200);
  const name = body.name ? String(body.name).slice(0, 200) : null;
  await db
    .insert(cphubSubscribersTable)
    .values({ email, name, source: body.source ?? "website" })
    .onConflictDoNothing();
  res.json({ ok: true });
});

// ─────────────────────────── ADMIN: PAGES ────────────────────────────────────

router.get("/cphub/admin/pages", adminOnly, async (_req, res) => {
  const rows = await db
    .select()
    .from(cphubPagesTable)
    .orderBy(desc(cphubPagesTable.updatedAt));
  res.json(rows);
});

router.get("/cphub/admin/pages/:id", adminOnly, async (req, res) => {
  const row = await db
    .select()
    .from(cphubPagesTable)
    .where(eq(cphubPagesTable.id, Number(req.params.id)))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!row) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  res.json(row);
});

router.post("/cphub/admin/pages", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  if (!b.slug || !b.title) {
    res.status(400).json({ error: "slug and title are required" });
    return;
  }
  const [row] = await db
    .insert(cphubPagesTable)
    .values({
      slug: b.slug,
      title: b.title,
      subtitle: b.subtitle ?? null,
      heroImage: b.heroImage ?? null,
      sections: b.sections ?? [],
      seoTitle: b.seoTitle ?? null,
      seoDescription: b.seoDescription ?? null,
      seoKeywords: b.seoKeywords ?? null,
      ogImage: b.ogImage ?? null,
      status: b.status ?? "draft",
      publishedAt: b.status === "published" ? new Date() : null,
    })
    .returning();
  res.json(row);
});

router.put("/cphub/admin/pages/:id", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  const id = Number(req.params.id);
  const existing = await db
    .select()
    .from(cphubPagesTable)
    .where(eq(cphubPagesTable.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!existing) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  const wasPublished = existing.status === "published";
  const becomingPublished = b.status === "published";
  const [row] = await db
    .update(cphubPagesTable)
    .set({
      slug: b.slug ?? existing.slug,
      title: b.title ?? existing.title,
      subtitle: b.subtitle ?? null,
      heroImage: b.heroImage ?? null,
      sections: b.sections ?? existing.sections,
      seoTitle: b.seoTitle ?? null,
      seoDescription: b.seoDescription ?? null,
      seoKeywords: b.seoKeywords ?? null,
      ogImage: b.ogImage ?? null,
      status: b.status ?? existing.status,
      publishedAt:
        becomingPublished && !wasPublished ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(cphubPagesTable.id, id))
    .returning();
  res.json(row);
});

router.delete("/cphub/admin/pages/:id", adminOnly, async (req, res) => {
  await db
    .delete(cphubPagesTable)
    .where(eq(cphubPagesTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

// ─────────────────────────── ADMIN: POSTS ────────────────────────────────────

router.get("/cphub/admin/posts", adminOnly, async (_req, res) => {
  const rows = await db
    .select()
    .from(cphubPostsTable)
    .orderBy(desc(cphubPostsTable.updatedAt));
  res.json(rows);
});

router.get("/cphub/admin/posts/:id", adminOnly, async (req, res) => {
  const row = await db
    .select()
    .from(cphubPostsTable)
    .where(eq(cphubPostsTable.id, Number(req.params.id)))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(row);
});

router.post("/cphub/admin/posts", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  if (!b.slug || !b.title) {
    res.status(400).json({ error: "slug and title are required" });
    return;
  }
  const [row] = await db
    .insert(cphubPostsTable)
    .values({
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt ?? null,
      body: b.body ?? "",
      coverImage: b.coverImage ?? null,
      author: b.author ?? "Cloud Partner Hub",
      tags: b.tags ?? [],
      seoTitle: b.seoTitle ?? null,
      seoDescription: b.seoDescription ?? null,
      status: b.status ?? "draft",
      publishedAt: b.status === "published" ? new Date() : null,
    })
    .returning();
  res.json(row);
});

router.put("/cphub/admin/posts/:id", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  const id = Number(req.params.id);
  const existing = await db
    .select()
    .from(cphubPostsTable)
    .where(eq(cphubPostsTable.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const wasPublished = existing.status === "published";
  const becomingPublished = b.status === "published";
  const [row] = await db
    .update(cphubPostsTable)
    .set({
      slug: b.slug ?? existing.slug,
      title: b.title ?? existing.title,
      excerpt: b.excerpt ?? null,
      body: b.body ?? existing.body,
      coverImage: b.coverImage ?? null,
      author: b.author ?? existing.author,
      tags: b.tags ?? existing.tags,
      seoTitle: b.seoTitle ?? null,
      seoDescription: b.seoDescription ?? null,
      status: b.status ?? existing.status,
      publishedAt:
        becomingPublished && !wasPublished ? new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(cphubPostsTable.id, id))
    .returning();
  res.json(row);
});

router.delete("/cphub/admin/posts/:id", adminOnly, async (req, res) => {
  await db
    .delete(cphubPostsTable)
    .where(eq(cphubPostsTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

// ─────────────────────────── ADMIN: LEADS ────────────────────────────────────

router.get("/cphub/admin/leads", adminOnly, async (_req, res) => {
  const rows = await db
    .select()
    .from(cphubLeadsTable)
    .orderBy(desc(cphubLeadsTable.createdAt));
  res.json(rows);
});

router.put("/cphub/admin/leads/:id", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  const [row] = await db
    .update(cphubLeadsTable)
    .set({
      status: b.status,
      notes: b.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(cphubLeadsTable.id, Number(req.params.id)))
    .returning();
  res.json(row);
});

router.delete("/cphub/admin/leads/:id", adminOnly, async (req, res) => {
  await db
    .delete(cphubLeadsTable)
    .where(eq(cphubLeadsTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

// ─────────────────────────── ADMIN: SUBSCRIBERS ──────────────────────────────

router.get("/cphub/admin/subscribers", adminOnly, async (_req, res) => {
  const rows = await db
    .select()
    .from(cphubSubscribersTable)
    .orderBy(desc(cphubSubscribersTable.createdAt));
  res.json(rows);
});

router.post("/cphub/admin/subscribers", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  if (!b.email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  const [row] = await db
    .insert(cphubSubscribersTable)
    .values({
      email: String(b.email).trim().toLowerCase(),
      name: b.name ?? null,
      status: b.status ?? "subscribed",
      tags: b.tags ?? [],
      source: b.source ?? "admin",
    })
    .onConflictDoUpdate({
      target: cphubSubscribersTable.email,
      set: { name: b.name ?? null, updatedAt: new Date() },
    })
    .returning();
  res.json(row);
});

router.delete("/cphub/admin/subscribers/:id", adminOnly, async (req, res) => {
  await db
    .delete(cphubSubscribersTable)
    .where(eq(cphubSubscribersTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

// ─────────────────────────── ADMIN: EMAIL TEMPLATES ──────────────────────────

router.get("/cphub/admin/email-templates", adminOnly, async (_req, res) => {
  const rows = await db
    .select()
    .from(cphubEmailTemplatesTable)
    .orderBy(desc(cphubEmailTemplatesTable.updatedAt));
  res.json(rows);
});

router.post("/cphub/admin/email-templates", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  if (!b.slug || !b.name || !b.subject || !b.bodyHtml) {
    res.status(400).json({ error: "slug, name, subject, bodyHtml required" });
    return;
  }
  const [row] = await db
    .insert(cphubEmailTemplatesTable)
    .values({
      slug: b.slug,
      name: b.name,
      subject: b.subject,
      bodyHtml: b.bodyHtml,
      bodyText: b.bodyText ?? null,
      description: b.description ?? null,
    })
    .returning();
  res.json(row);
});

router.put("/cphub/admin/email-templates/:id", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  const [row] = await db
    .update(cphubEmailTemplatesTable)
    .set({
      slug: b.slug,
      name: b.name,
      subject: b.subject,
      bodyHtml: b.bodyHtml,
      bodyText: b.bodyText ?? null,
      description: b.description ?? null,
      updatedAt: new Date(),
    })
    .where(eq(cphubEmailTemplatesTable.id, Number(req.params.id)))
    .returning();
  res.json(row);
});

router.delete("/cphub/admin/email-templates/:id", adminOnly, async (req, res) => {
  await db
    .delete(cphubEmailTemplatesTable)
    .where(eq(cphubEmailTemplatesTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

// ─────────────────────────── ADMIN: EMAIL CAMPAIGNS ──────────────────────────

router.get("/cphub/admin/campaigns", adminOnly, async (_req, res) => {
  const rows = await db
    .select()
    .from(cphubEmailCampaignsTable)
    .orderBy(desc(cphubEmailCampaignsTable.updatedAt));
  res.json(rows);
});

router.post("/cphub/admin/campaigns", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  if (!b.name || !b.subject || !b.bodyHtml) {
    res.status(400).json({ error: "name, subject, bodyHtml required" });
    return;
  }
  const [row] = await db
    .insert(cphubEmailCampaignsTable)
    .values({
      name: b.name,
      subject: b.subject,
      bodyHtml: b.bodyHtml,
      fromName: b.fromName ?? null,
      fromEmail: b.fromEmail ?? null,
      status: b.status ?? "draft",
    })
    .returning();
  res.json(row);
});

router.put("/cphub/admin/campaigns/:id", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  const [row] = await db
    .update(cphubEmailCampaignsTable)
    .set({
      name: b.name,
      subject: b.subject,
      bodyHtml: b.bodyHtml,
      fromName: b.fromName ?? null,
      fromEmail: b.fromEmail ?? null,
      status: b.status,
      updatedAt: new Date(),
    })
    .where(eq(cphubEmailCampaignsTable.id, Number(req.params.id)))
    .returning();
  res.json(row);
});

router.post("/cphub/admin/campaigns/:id/send", adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const subsCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cphubSubscribersTable)
    .where(eq(cphubSubscribersTable.status, "subscribed"))
    .then((r) => r[0]?.count ?? 0);
  const [row] = await db
    .update(cphubEmailCampaignsTable)
    .set({
      status: "sent",
      sentAt: new Date(),
      recipientsCount: subsCount,
      updatedAt: new Date(),
    })
    .where(eq(cphubEmailCampaignsTable.id, id))
    .returning();
  // Note: actual SMTP send needs to be wired with credentials in settings.
  res.json({
    ok: true,
    campaign: row,
    note: "Recorded as sent. Configure SMTP in settings to actually deliver.",
  });
});

router.delete("/cphub/admin/campaigns/:id", adminOnly, async (req, res) => {
  await db
    .delete(cphubEmailCampaignsTable)
    .where(eq(cphubEmailCampaignsTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

// ─────────────────────────── ADMIN: MEDIA ────────────────────────────────────

router.get("/cphub/admin/media", adminOnly, async (_req, res) => {
  const rows = await db
    .select()
    .from(cphubMediaTable)
    .orderBy(desc(cphubMediaTable.createdAt));
  res.json(rows);
});

// Register a URL-based media entry (e.g. external image URL pasted by admin)
router.post("/cphub/admin/media", adminOnly, async (req, res) => {
  const b = req.body ?? {};
  if (!b.url || !b.originalName) {
    res.status(400).json({ error: "url and originalName are required" });
    return;
  }
  const [row] = await db
    .insert(cphubMediaTable)
    .values({
      filename: b.filename ?? b.originalName,
      originalName: b.originalName,
      url: b.url,
      mimeType: b.mimeType ?? "image/jpeg",
      sizeBytes: b.sizeBytes ?? 0,
      width: b.width ?? null,
      height: b.height ?? null,
      alt: b.alt ?? null,
      folder: b.folder ?? "uploads",
    })
    .returning();
  res.json(row);
});

router.delete("/cphub/admin/media/:id", adminOnly, async (req, res) => {
  await db
    .delete(cphubMediaTable)
    .where(eq(cphubMediaTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

// ─────────────────────────── ADMIN: SETTINGS ─────────────────────────────────

router.get("/cphub/admin/settings", adminOnly, async (_req, res) => {
  const rows = await db.select().from(cphubSettingsTable);
  const obj: Record<string, unknown> = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

router.put("/cphub/admin/settings", adminOnly, async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(cphubSettingsTable)
      .values({ key, value: value as object })
      .onConflictDoUpdate({
        target: cphubSettingsTable.key,
        set: { value: value as object, updatedAt: new Date() },
      });
  }
  res.json({ ok: true });
});

export default router;
