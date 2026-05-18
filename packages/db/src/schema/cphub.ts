import {
  pgTable,
  text,
  serial,
  timestamp,
  pgEnum,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cphubPageStatusEnum = pgEnum("cphub_page_status", [
  "draft",
  "published",
]);
export const cphubPostStatusEnum = pgEnum("cphub_post_status", [
  "draft",
  "published",
]);
export const cphubLeadStatusEnum = pgEnum("cphub_lead_status", [
  "new",
  "in_progress",
  "won",
  "lost",
  "archived",
]);
export const cphubSubscriberStatusEnum = pgEnum("cphub_subscriber_status", [
  "subscribed",
  "unsubscribed",
  "bounced",
]);

export const cphubPagesTable = pgTable(
  "cphub_pages",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    heroImage: text("hero_image"),
    sections: jsonb("sections").notNull().default([]),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoKeywords: text("seo_keywords"),
    ogImage: text("og_image"),
    status: cphubPageStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("cphub_pages_slug_idx").on(t.slug),
  }),
);

export const cphubPostsTable = pgTable(
  "cphub_posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull().default(""),
    coverImage: text("cover_image"),
    author: text("author").notNull().default("Cloud Partner Hub"),
    tags: jsonb("tags").notNull().default([]),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    status: cphubPostStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("cphub_posts_slug_idx").on(t.slug),
    statusIdx: index("cphub_posts_status_idx").on(t.status),
  }),
);

export const cphubLeadsTable = pgTable("cphub_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  source: text("source").notNull().default("contact_form"),
  status: cphubLeadStatusEnum("status").notNull().default("new"),
  notes: text("notes"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cphubEmailTemplatesTable = pgTable(
  "cphub_email_templates",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    bodyHtml: text("body_html").notNull(),
    bodyText: text("body_text"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("cphub_email_templates_slug_idx").on(t.slug),
  }),
);

export const cphubEmailCampaignsTable = pgTable("cphub_email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  fromName: text("from_name"),
  fromEmail: text("from_email"),
  status: text("status").notNull().default("draft"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  recipientsCount: integer("recipients_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cphubSubscribersTable = pgTable(
  "cphub_subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    status: cphubSubscriberStatusEnum("status").notNull().default("subscribed"),
    tags: jsonb("tags").notNull().default([]),
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("cphub_subscribers_email_idx").on(t.email),
  }),
);

export const cphubMediaTable = pgTable("cphub_media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  folder: text("folder").notNull().default("uploads"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cphubSettingsTable = pgTable(
  "cphub_settings",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    keyIdx: uniqueIndex("cphub_settings_key_idx").on(t.key),
  }),
);

export const insertCphubPageSchema = createInsertSchema(cphubPagesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectCphubPageSchema = createSelectSchema(cphubPagesTable);
export type CphubPage = typeof cphubPagesTable.$inferSelect;
export type InsertCphubPage = z.infer<typeof insertCphubPageSchema>;

export const insertCphubPostSchema = createInsertSchema(cphubPostsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CphubPost = typeof cphubPostsTable.$inferSelect;
export type InsertCphubPost = z.infer<typeof insertCphubPostSchema>;

export const insertCphubLeadSchema = createInsertSchema(cphubLeadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CphubLead = typeof cphubLeadsTable.$inferSelect;
export type InsertCphubLead = z.infer<typeof insertCphubLeadSchema>;

export const insertCphubEmailTemplateSchema = createInsertSchema(
  cphubEmailTemplatesTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type CphubEmailTemplate = typeof cphubEmailTemplatesTable.$inferSelect;
export type InsertCphubEmailTemplate = z.infer<typeof insertCphubEmailTemplateSchema>;

export const insertCphubEmailCampaignSchema = createInsertSchema(
  cphubEmailCampaignsTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type CphubEmailCampaign = typeof cphubEmailCampaignsTable.$inferSelect;
export type InsertCphubEmailCampaign = z.infer<typeof insertCphubEmailCampaignSchema>;

export const insertCphubSubscriberSchema = createInsertSchema(
  cphubSubscribersTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type CphubSubscriber = typeof cphubSubscribersTable.$inferSelect;
export type InsertCphubSubscriber = z.infer<typeof insertCphubSubscriberSchema>;

export const insertCphubMediaSchema = createInsertSchema(cphubMediaTable).omit({
  id: true,
  createdAt: true,
});
export type CphubMedia = typeof cphubMediaTable.$inferSelect;
export type InsertCphubMedia = z.infer<typeof insertCphubMediaSchema>;

export type CphubSetting = typeof cphubSettingsTable.$inferSelect;
