import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type EmailTemplate } from "@/lib/api";
import { Button, Card, Input, Textarea, PageHeader, EmptyState } from "@/components/ui";
import { Plus, Save, Trash2, ArrowLeft } from "lucide-react";

export default function Templates() {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["templates"], queryFn: api.templates.list });
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [creating, setCreating] = useState(false);

  if (editing || creating) {
    return <Editor initial={editing} onClose={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["templates"] }); }} />;
  }

  return (
    <div>
      <PageHeader title="Email templates" subtitle="Reusable email templates with {{variables}}."
        actions={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4"/>New template</Button>} />
      <div className="p-8">
        {!items ? <div className="text-sm text-slate-500">Loading…</div> :
          items.length === 0 ? <Card><EmptyState title="No templates yet" /></Card> : (
            <div className="grid md:grid-cols-2 gap-4">
              {items.map((t) => (
                <Card key={t.id} className="p-5 cursor-pointer hover:shadow-md transition" onClick={() => setEditing(t)}>
                  <div className="text-xs font-mono text-slate-500">{t.slug}</div>
                  <h3 className="font-semibold text-slate-900 mt-1">{t.name}</h3>
                  <div className="text-sm text-slate-600 mt-1">{t.subject}</div>
                  {t.description && <p className="text-xs text-slate-500 mt-2">{t.description}</p>}
                </Card>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

function Editor({ initial, onClose }: { initial: EmailTemplate | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<EmailTemplate>>(initial ?? {
    slug: "", name: "", subject: "", bodyHtml: "", bodyText: "", description: "",
  });
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => initial ? api.templates.update(initial.id, form) : api.templates.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); onClose(); },
    onError: (e) => setErr((e as Error).message),
  });
  const del = useMutation({
    mutationFn: () => api.templates.delete(initial!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["templates"] }); onClose(); },
  });

  function update<K extends keyof EmailTemplate>(k: K, v: EmailTemplate[K]) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div>
      <PageHeader title={initial ? `Edit · ${initial.name}` : "New email template"}
        actions={
          <>
            <Button variant="secondary" onClick={onClose}><ArrowLeft className="w-4 h-4"/>Back</Button>
            {initial && <Button variant="danger" onClick={() => confirm("Delete?") && del.mutate()}><Trash2 className="w-4 h-4"/>Delete</Button>}
            <Button onClick={() => save.mutate()}><Save className="w-4 h-4"/>Save</Button>
          </>
        } />
      <div className="p-8 grid lg:grid-cols-2 gap-5">
        <Card className="p-6 space-y-3">
          <Input label="Name" value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} />
          <Input label="Slug" value={form.slug ?? ""} onChange={(e) => update("slug", e.target.value)} />
          <Input label="Subject" value={form.subject ?? ""} onChange={(e) => update("subject", e.target.value)} />
          <Textarea label="Description" rows={2} value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} />
          <Textarea label="HTML body" rows={12} value={form.bodyHtml ?? ""} onChange={(e) => update("bodyHtml", e.target.value)} />
          <Textarea label="Plain-text body (fallback)" rows={5} value={form.bodyText ?? ""} onChange={(e) => update("bodyText", e.target.value)} />
          {err && <div className="text-sm text-red-600">{err}</div>}
        </Card>
        <Card className="p-6">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Preview</div>
          <div className="border border-slate-200 rounded-lg">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500">Subject</div>
              <div className="text-sm font-medium text-slate-900">{form.subject || "(no subject)"}</div>
            </div>
            <iframe
              title="email-preview"
              sandbox=""
              srcDoc={`<!doctype html><meta charset="utf-8"><base target="_blank"><style>body{font:14px/1.6 -apple-system,system-ui,sans-serif;color:#0f172a;margin:14px;}</style>${form.bodyHtml || "<em>Empty body</em>"}`}
              className="w-full min-h-[300px] border-0 bg-white"
            />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Use <code className="font-mono text-brand-600">{`{{name}}`}</code>, <code className="font-mono text-brand-600">{`{{email}}`}</code> etc. — substitution happens at send-time.
          </p>
        </Card>
      </div>
    </div>
  );
}
