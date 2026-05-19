import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Page } from "@/lib/api";
import { Button, Card, Input, Textarea, Select, PageHeader, Badge, EmptyState } from "@/components/ui";
import { Plus, Save, Trash2, ExternalLink, ArrowLeft } from "lucide-react";

export default function Pages() {
  const qc = useQueryClient();
  const { data: pages, isLoading } = useQuery({ queryKey: ["pages"], queryFn: api.pages.list });
  const [editing, setEditing] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);

  if (editing || creating) {
    return (
      <PageEditor
        initial={editing}
        onClose={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["pages"] }); }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Pages"
        subtitle="Edit the marketing pages on your site."
        actions={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" />New page</Button>}
      />
      <div className="p-8">
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : !pages || pages.length === 0 ? (
          <Card><EmptyState title="No pages yet" hint="Create your first page." action={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4"/>New page</Button>} /></Card>
        ) : (
          <Card>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{p.title}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">/{p.slug === "home" ? "" : p.slug}</td>
                    <td className="px-5 py-3"><Badge color={p.status === "published" ? "green" : "amber"}>{p.status}</Badge></td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{new Date(p.updatedAt).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>Edit</Button>
                      <a href={p.slug === "home" ? "/" : `/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 ml-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-800">
                        <ExternalLink className="w-3 h-3"/>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

function PageEditor({ initial, onClose }: { initial: Page | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Page>>(initial ?? {
    slug: "", title: "", subtitle: "", status: "draft", sections: [],
    seoTitle: "", seoDescription: "", seoKeywords: "", ogImage: "", heroImage: "",
  });
  const [sectionsJson, setSectionsJson] = useState(JSON.stringify(form.sections ?? [], null, 2));
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      let sections: unknown[];
      try { sections = JSON.parse(sectionsJson); }
      catch { throw new Error("Sections is not valid JSON"); }
      const payload = { ...form, sections };
      if (initial) return api.pages.update(initial.id, payload);
      return api.pages.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); onClose(); },
    onError: (e) => setErr((e as Error).message),
  });

  const del = useMutation({
    mutationFn: () => api.pages.delete(initial!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pages"] }); onClose(); },
  });

  function update<K extends keyof Page>(k: K, v: Page[K]) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div>
      <PageHeader
        title={initial ? `Edit · ${initial.title}` : "New page"}
        subtitle={initial ? `/${initial.slug}` : "Create a new marketing page."}
        actions={
          <>
            <Button variant="secondary" onClick={onClose}><ArrowLeft className="w-4 h-4"/>Back</Button>
            {initial && (
              <Button variant="danger" onClick={() => confirm("Delete this page?") && del.mutate()}><Trash2 className="w-4 h-4"/>Delete</Button>
            )}
            <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4"/>{save.isPending ? "Saving…" : "Save"}</Button>
          </>
        }
      />
      <div className="p-8 grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Title" value={form.title ?? ""} onChange={(e) => update("title", e.target.value)} />
            <Input label="Slug (URL)" value={form.slug ?? ""} onChange={(e) => update("slug", e.target.value)} />
          </div>
          <Input label="Subtitle" value={form.subtitle ?? ""} onChange={(e) => update("subtitle", e.target.value)} />
          <Textarea label="Sections (JSON)" rows={20} value={sectionsJson} onChange={(e) => setSectionsJson(e.target.value)} />
          <p className="text-xs text-slate-500">
            Sections are an array of typed blocks. Supported types: <code className="font-mono">hero, stats, services, process, logos, values, team, cases, cta</code>. Use the <strong>Team</strong> page in the sidebar to edit team members visually.
          </p>
          {err && <div className="text-sm text-red-600">{err}</div>}
        </Card>

        <div className="space-y-5">
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Publishing</h3>
            <Select label="Status" value={form.status ?? "draft"} onChange={(e) => update("status", e.target.value as "draft" | "published")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
            <Input label="Hero image URL" value={form.heroImage ?? ""} onChange={(e) => update("heroImage", e.target.value)} />
          </Card>
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">SEO</h3>
            <Input label="SEO title" value={form.seoTitle ?? ""} onChange={(e) => update("seoTitle", e.target.value)} />
            <Textarea label="SEO description" rows={3} value={form.seoDescription ?? ""} onChange={(e) => update("seoDescription", e.target.value)} />
            <Input label="SEO keywords" value={form.seoKeywords ?? ""} onChange={(e) => update("seoKeywords", e.target.value)} />
            <Input label="OG image URL" value={form.ogImage ?? ""} onChange={(e) => update("ogImage", e.target.value)} />
          </Card>
        </div>
      </div>
    </div>
  );
}
