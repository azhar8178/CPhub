-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'viewer');

CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "password_hash" text,
  "role" "user_role" DEFAULT 'editor' NOT NULL,
  "reset_password_token" text,
  "reset_password_token_expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ─── CPHub CMS ──────────────────────────────────────────────────────────────
CREATE TYPE "public"."cphub_page_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."cphub_post_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."cphub_lead_status" AS ENUM('new', 'in_progress', 'won', 'lost', 'archived');
CREATE TYPE "public"."cphub_subscriber_status" AS ENUM('subscribed', 'unsubscribed', 'bounced');
CREATE TYPE "public"."cphub_campaign_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'failed');

CREATE TABLE "cphub_pages" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "subtitle" text,
  "hero_image" text,
  "sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "seo_title" text,
  "seo_description" text,
  "seo_keywords" text,
  "og_image" text,
  "status" "cphub_page_status" DEFAULT 'draft' NOT NULL,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cphub_posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "excerpt" text,
  "body" text DEFAULT '' NOT NULL,
  "cover_image" text,
  "author" text DEFAULT 'Cloud Partner Hub' NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "seo_title" text,
  "seo_description" text,
  "status" "cphub_post_status" DEFAULT 'draft' NOT NULL,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cphub_leads" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "company" text,
  "phone" text,
  "subject" text,
  "message" text NOT NULL,
  "source" text DEFAULT 'contact_form' NOT NULL,
  "status" "cphub_lead_status" DEFAULT 'new' NOT NULL,
  "notes" text,
  "meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cphub_email_templates" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "subject" text NOT NULL,
  "body_html" text NOT NULL,
  "body_text" text,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cphub_email_campaigns" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "subject" text NOT NULL,
  "body_html" text NOT NULL,
  "from_name" text,
  "from_email" text,
  "status" "cphub_campaign_status" DEFAULT 'draft' NOT NULL,
  "scheduled_for" timestamp with time zone,
  "sent_at" timestamp with time zone,
  "recipients_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cphub_subscribers" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "name" text,
  "status" "cphub_subscriber_status" DEFAULT 'subscribed' NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "source" text DEFAULT 'website' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cphub_media" (
  "id" serial PRIMARY KEY NOT NULL,
  "filename" text NOT NULL,
  "original_name" text NOT NULL,
  "url" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" integer DEFAULT 0 NOT NULL,
  "width" integer,
  "height" integer,
  "alt" text,
  "folder" text DEFAULT 'uploads' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "cphub_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" text NOT NULL UNIQUE,
  "value" jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
