import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Campaign } from "@/lib/api";
import { Button, Card, Input, Textarea, PageHeader, Badge, EmptyState } from "@/components/ui";
import { Plus, Save, Trash2, Send, ArrowLeft } from "lucide-react";

export default function Campaigns() {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["campaigns"], queryFn: api.campaigns.list });
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [creating, setCreating] = useState(false);

  if (editing || creating) {
    return <Editor initial={editing} onClose={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["campaigns"] }); }} />;
  }

  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Send newsletters to your subscribers."
        actions={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4"/>New campaign</Button>} />
      <div className="p-8">
        {!items ? <div className="text-sm text-slate-500">Loading…</div> :
          items.length === 0 ? <Card><EmptyState title="No campaigns yet" /></Card> : (
            <Card>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Sent to</th>
                    <th className="px-5 py-3">When</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setEditing(c)}>
                      <td className="px-5 py-3 font-medium text-slate-900">{c.name}</td>
                      <td className="px-5 py-3 text-slate-600">{c.subject}</td>
                      <td className="px-5 py-3"><Badge color={c.status === "sent" ? "green" : "amber"}>{c.status}</Badge></td>
                      <td className="px-5 py-3 text-slate-500">{c.recipientsCount}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{c.sentAt ? new Date(c.sentAt).toLocaleString() : "—"}</td>
                      <td></td>
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

function Editor({ initial, onClose }: { initial: Campaign | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Campaign>>(initial ?? {
    name: "", subject: "", bodyHtml: "", fromName: "", fromEmail: "", status: "draft",
  });
  const [err, setErr] = useState<string | null>(null);
  const [sendMsg, setSendMsg] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => initial ? api.campaigns.update(initial.id, form) : api.campaigns.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns"] }); onClose(); },
    onError: (e) => setErr((e as Error).message),
  });
  const sendNow = useMutation({
    mutationFn: () => api.campaigns.send(initial!.id),
    onSuccess: (r) => { setSendMsg(r.note); qc.invalidateQueries({ queryKey: ["campaigns"] }); },
  });
  const del = useMutation({
    mutationFn: () => api.campaigns.delete(initial!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campaigns"] }); onClose(); },
  });

  function update<K extends keyof Campaign>(k: K, v: Campaign[K]) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div>
      <PageHeader title={initial ? `Edit · ${initial.name}` : "New campaign"}
        actions={
          <>
            <Button variant="secondary" onClick={onClose}><ArrowLeft className="w-4 h-4"/>Back</Button>
            {initial && <Button variant="danger" onClick={() => confirm("Delete?") && del.mutate()}><Trash2 className="w-4 h-4"/>Delete</Button>}
            <Button onClick={() => save.mutate()}><Save className="w-4 h-4"/>Save draft</Button>
            {initial && initial.status !== "sent" && (
              <Button onClick={() => confirm("Send this campaign to all subscribers?") && sendNow.mutate()}><Send className="w-4 h-4"/>Send now</Button>
            )}
          </>
        } />
      <div className="p-8 grid lg:grid-cols-2 gap-5">
        <Card className="p-6 space-y-3">
          <Input label="Internal name" value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} />
          <Input label="Subject line" value={form.subject ?? ""} onChange={(e) => update("subject", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="From name" value={form.fromName ?? ""} onChange={(e) => update("fromName", e.target.value)} />
            <Input label="From email" value={form.fromEmail ?? ""} onChange={(e) => update("fromEmail", e.target.value)} />
          </div>
          <Textarea label="HTML body" rows={15} value={form.bodyHtml ?? ""} onChange={(e) => update("bodyHtml", e.target.value)} />
          {err && <div className="text-sm text-red-600">{err}</div>}
          {sendMsg && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{sendMsg}</div>}
        </Card>
        <Card className="p-6">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Preview</div>
          <div className="border border-slate-200 rounded-lg">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500">From: {form.fromName || "—"} &lt;{form.fromEmail || "—"}&gt;</div>
              <div className="text-sm font-medium text-slate-900 mt-1">{form.subject || "(no subject)"}</div>
            </div>
            <iframe
              title="campaign-preview"
              sandbox=""
              srcDoc={`<!doctype html><meta charset="utf-8"><base target="_blank"><style>body{font:14px/1.6 -apple-system,system-ui,sans-serif;color:#0f172a;margin:14px;}</style>${form.bodyHtml || "<em>Empty body</em>"}`}
              className="w-full min-h-[300px] border-0 bg-white"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
