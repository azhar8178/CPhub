const BASE = "/api/cphub/public";

export type CphubPage = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  heroImage: string | null;
  sections: PageSection[];
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CphubPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  coverImage: string | null;
  author: string;
  tags: string[];
  publishedAt: string | null;
};

export type CtaSpec = { label: string; href: string };
export type PageSection =
  | { type: "hero"; eyebrow?: string; headline: string; sub?: string; ctaPrimary?: CtaSpec; ctaSecondary?: CtaSpec }
  | { type: "stats"; headline?: string; items: { value: string; label: string }[] }
  | { type: "services"; headline?: string; sub?: string; items: { icon?: string; title: string; body: string }[] }
  | { type: "process"; headline?: string; items: { step: string; title: string; body: string }[] }
  | { type: "logos"; headline?: string; items: string[] }
  | { type: "values"; headline?: string; items: { title: string; body: string }[] }
  | { type: "cases"; items: { client: string; industry: string; headline: string; body: string; metrics: { value: string; label: string }[] }[] }
  | { type: "cta"; headline: string; sub?: string; cta: CtaSpec };

export type SiteSettings = {
  branding?: { siteName?: string; tagline?: string; logoText?: string; primaryColor?: string; accentColor?: string };
  contact?: { email?: string; phone?: string; address?: string; social?: Record<string, string> };
  navigation?: { primary?: { label: string; href: string }[] };
};

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

export const api = {
  pages: () => get<CphubPage[]>("/pages"),
  page: (slug: string) => get<CphubPage>(`/pages/${slug}`),
  posts: () => get<CphubPost[]>("/posts"),
  post: (slug: string) => get<CphubPost>(`/posts/${slug}`),
  settings: () => get<SiteSettings>("/settings"),
  submitLead: async (data: {
    name: string; email: string; company?: string; phone?: string;
    subject?: string; message: string; source?: string;
  }) => {
    const r = await fetch(`${BASE}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error("Failed to submit");
    return r.json();
  },
  subscribe: async (email: string, name?: string) => {
    const r = await fetch(`${BASE}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    if (!r.ok) throw new Error("Failed to subscribe");
    return r.json();
  },
};
