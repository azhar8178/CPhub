const KEY = "cphub_admin_token";

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function getToken(): string | null {
  return localStorage.getItem(KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(KEY, t);
  else localStorage.removeItem(KEY);
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (r.status === 401) {
    setToken(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!r.ok) {
    const e = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(e.error || `HTTP ${r.status}`);
  }
  if (r.status === 204) return undefined as T;
  return r.json();
}

export const api = {
  login: async (email: string, password: string) => {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({ error: "Login failed" }));
      throw new Error(e.error || "Login failed");
    }
    const data = (await r.json()) as { token: string; user: { id: number; email: string; name: string; role: string } };
    setToken(data.token);
    return data;
  },
  me: () => req<{ id: number; email: string; name: string; role: string }>("GET", "/auth/me"),

  pages: {
    list: () => req<Page[]>("GET", "/cphub/admin/pages"),
    get: (id: number) => req<Page>("GET", `/cphub/admin/pages/${id}`),
    create: (data: Partial<Page>) => req<Page>("POST", "/cphub/admin/pages", data),
    update: (id: number, data: Partial<Page>) => req<Page>("PUT", `/cphub/admin/pages/${id}`, data),
    delete: (id: number) => req<{ ok: true }>("DELETE", `/cphub/admin/pages/${id}`),
  },
  posts: {
    list: () => req<Post[]>("GET", "/cphub/admin/posts"),
    get: (id: number) => req<Post>("GET", `/cphub/admin/posts/${id}`),
    create: (data: Partial<Post>) => req<Post>("POST", "/cphub/admin/posts", data),
    update: (id: number, data: Partial<Post>) => req<Post>("PUT", `/cphub/admin/posts/${id}`, data),
    delete: (id: number) => req<{ ok: true }>("DELETE", `/cphub/admin/posts/${id}`),
  },
  leads: {
    list: () => req<Lead[]>("GET", "/cphub/admin/leads"),
    update: (id: number, data: Partial<Lead>) => req<Lead>("PUT", `/cphub/admin/leads/${id}`, data),
    delete: (id: number) => req<{ ok: true }>("DELETE", `/cphub/admin/leads/${id}`),
  },
  subscribers: {
    list: () => req<Subscriber[]>("GET", "/cphub/admin/subscribers"),
    create: (data: Partial<Subscriber>) => req<Subscriber>("POST", "/cphub/admin/subscribers", data),
    delete: (id: number) => req<{ ok: true }>("DELETE", `/cphub/admin/subscribers/${id}`),
  },
  templates: {
    list: () => req<EmailTemplate[]>("GET", "/cphub/admin/email-templates"),
    create: (data: Partial<EmailTemplate>) => req<EmailTemplate>("POST", "/cphub/admin/email-templates", data),
    update: (id: number, data: Partial<EmailTemplate>) =>
      req<EmailTemplate>("PUT", `/cphub/admin/email-templates/${id}`, data),
    delete: (id: number) => req<{ ok: true }>("DELETE", `/cphub/admin/email-templates/${id}`),
  },
  campaigns: {
    list: () => req<Campaign[]>("GET", "/cphub/admin/campaigns"),
    create: (data: Partial<Campaign>) => req<Campaign>("POST", "/cphub/admin/campaigns", data),
    update: (id: number, data: Partial<Campaign>) => req<Campaign>("PUT", `/cphub/admin/campaigns/${id}`, data),
    send: (id: number) => req<{ ok: true; note: string }>("POST", `/cphub/admin/campaigns/${id}/send`),
    delete: (id: number) => req<{ ok: true }>("DELETE", `/cphub/admin/campaigns/${id}`),
  },
  media: {
    list: () => req<Media[]>("GET", "/cphub/admin/media"),
    create: (data: Partial<Media>) => req<Media>("POST", "/cphub/admin/media", data),
    delete: (id: number) => req<{ ok: true }>("DELETE", `/cphub/admin/media/${id}`),
  },
  settings: {
    get: () => req<Record<string, unknown>>("GET", "/cphub/admin/settings"),
    save: (data: Record<string, unknown>) => req<{ ok: true }>("PUT", "/cphub/admin/settings", data),
  },
  users: {
    list: () => req<User[]>("GET", "/users"),
  },
};

export type Page = {
  id: number; slug: string; title: string; subtitle: string | null;
  heroImage: string | null;
  sections: unknown[];
  seoTitle: string | null; seoDescription: string | null; seoKeywords: string | null;
  ogImage: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string; updatedAt: string;
};
export type Post = {
  id: number; slug: string; title: string; excerpt: string | null;
  body: string; coverImage: string | null; author: string; tags: string[];
  seoTitle: string | null; seoDescription: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string; updatedAt: string;
};
export type Lead = {
  id: number; name: string; email: string; company: string | null;
  phone: string | null; subject: string | null; message: string;
  source: string; status: "new" | "in_progress" | "won" | "lost" | "archived";
  notes: string | null;
  createdAt: string; updatedAt: string;
};
export type Subscriber = {
  id: number; email: string; name: string | null;
  status: "subscribed" | "unsubscribed" | "bounced";
  tags: string[]; source: string | null;
  createdAt: string;
};
export type EmailTemplate = {
  id: number; slug: string; name: string; subject: string;
  bodyHtml: string; bodyText: string | null; description: string | null;
  createdAt: string; updatedAt: string;
};
export type Campaign = {
  id: number; name: string; subject: string; bodyHtml: string;
  fromName: string | null; fromEmail: string | null;
  status: string; scheduledFor: string | null; sentAt: string | null;
  recipientsCount: number;
  createdAt: string; updatedAt: string;
};
export type Media = {
  id: number; filename: string; originalName: string; url: string;
  mimeType: string; sizeBytes: number; width: number | null; height: number | null;
  alt: string | null; folder: string;
  createdAt: string;
};
export type User = { id: number; email: string; name: string; role: string };
