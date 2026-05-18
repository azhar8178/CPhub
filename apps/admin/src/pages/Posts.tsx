import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Post } from "@/lib/api";
import { Button, Card, Input, Textarea, Select, PageHeader, Badge, EmptyState } from "@/components/ui";
import { Plus, Save, Trash2, ArrowLeft } from "lucide-react";

export default function Posts() {
  const qc = useQueryClient();
  const { data: posts } = useQuery({ queryKey: ["posts"], queryFn: api.posts.list });
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  if (editing || creating) {
    return (
      <Editor initial={editing} onClose={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["posts"] }); }} />
    );
  }

  return (
    <div>
      <PageHeader
        title="Blog posts"
        subtitle="Write and publish blog posts."
        actions={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4"/>New post</Button>}
      />
      <div className="p-8">
        {!posts ? <div className="text-sm text-slate-500">Loading…</div> :
          posts.length === 0 ? (
            <Card><EmptyState title="No posts yet" action={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4"/>New post</Button>} /></Card>
          ) : (
            <Card>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Tags</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-900">{p.title}</div>
                        <div className="text-xs text-slate-500 font-mono">/blog/{p.slug}</div>
                      </td>
                      <td className="px-5 py-3"><div className="flex flex-wrap gap-1">{p.tags.slice(0,3).map((t) => <Badge key={t} color="violet">{t}</Badge>)}</div></td>
                      <td className="px-5 py-3"><Badge color={p.status === "published" ? "green" : "amber"}>{p.status}</Badge></td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{new Date(p.updatedAt).toLocaleString()}</td>
                      <td className="px-5 py-3 text-right"><Button variant="ghost" size="sm" onClick={() => setEditing(p)}>Edit</Button></td>
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

function Editor({ initial, onClose }: { initial: Post | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Post>>(initial ?? {
    slug: "", title: "", excerpt: "", body: "", coverImage: "", author: "Cloud Partner Hub",
    tags: [], status: "draft", seoTitle: "", seoDescription: "",
  });
  const [tagsText, setTagsText] = useState((form.tags ?? []).join(", "));
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => {
      const payload: Partial<Post> = {
        ...form,
        tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      };
      return initial ? api.posts.update(initial.id, payload) : api.posts.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); onClose(); },
    onError: (e) => setErr((e as Error).message),
  });
  const del = useMutation({
    mutationFn: () => api.posts.delete(initial!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posts"] }); onClose(); },
  });

  function update<K extends keyof Post>(k: K, v: Post[K]) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div>
      <PageHeader
        title={initial ? `Edit · ${initial.title}` : "New blog post"}
        actions={
          <>
            <Button variant="secondary" onClick={onClose}><ArrowLeft className="w-4 h-4"/>Back</Button>
            {initial && <Button variant="danger" onClick={() => confirm("Delete?") && del.mutate()}><Trash2 className="w-4 h-4"/>Delete</Button>}
            <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4"/>{save.isPending ? "Saving…" : "Save"}</Button>
          </>
        }
      />
      <div className="p-8 grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <Input label="Title" value={form.title ?? ""} onChange={(e) => update("title", e.target.value)} />
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Slug" value={form.slug ?? ""} onChange={(e) => update("slug", e.target.value)} />
            <Input label="Author" value={form.author ?? ""} onChange={(e) => update("author", e.target.value)} />
          </div>
          <Textarea label="Excerpt" rows={2} value={form.excerpt ?? ""} onChange={(e) => update("excerpt", e.target.value)} />
          <Textarea label="Body (Markdown supported: ## headings, **bold**, lists, [links](url))" rows={18} value={form.body ?? ""} onChange={(e) => update("body", e.target.value)} />
          {err && <div className="text-sm text-red-600">{err}</div>}
        </Card>
        <div className="space-y-5">
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Publishing</h3>
            <Select label="Status" value={form.status ?? "draft"} onChange={(e) => update("status", e.target.value as "draft" | "published")}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
            <Input label="Cover image URL" value={form.coverImage ?? ""} onChange={(e) => update("coverImage", e.target.value)} />
            <Input label="Tags (comma separated)" value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
          </Card>
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">SEO</h3>
            <Input label="SEO title" value={form.seoTitle ?? ""} onChange={(e) => update("seoTitle", e.target.value)} />
            <Textarea label="SEO description" rows={3} value={form.seoDescription ?? ""} onChange={(e) => update("seoDescription", e.target.value)} />
          </Card>
        </div>
      </div>
    </div>
  );
}
