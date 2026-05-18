import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Lead } from "@/lib/api";
import { Button, Card, Select, Textarea, PageHeader, Badge, EmptyState } from "@/components/ui";
import { Trash2, Mail, X } from "lucide-react";

const STATUS_COLORS = { new: "blue", in_progress: "amber", won: "green", lost: "red", archived: "slate" } as const;

export default function Leads() {
  const qc = useQueryClient();
  const { data: leads } = useQuery({ queryKey: ["leads"], queryFn: api.leads.list });
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = (leads ?? []).filter((l) => filter === "all" || l.status === filter);

  const update = useMutation({
    mutationFn: (data: { id: number; patch: Partial<Lead> }) => api.leads.update(data.id, data.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
  const del = useMutation({
    mutationFn: (id: number) => api.leads.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); setSelected(null); },
  });

  return (
    <div>
      <PageHeader title="Leads" subtitle="Inbound contact form submissions." />
      <div className="p-8">
        <div className="flex gap-2 mb-4 text-xs">
          {["all", "new", "in_progress", "won", "lost", "archived"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg ${filter === s ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {s.replace("_"," ")}
            </button>
          ))}
        </div>
        {!leads ? <div className="text-sm text-slate-500">Loading…</div> :
          filtered.length === 0 ? (
            <Card><EmptyState title="No leads yet" hint="Contact form submissions will appear here." /></Card>
          ) : (
            <Card>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Received</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(l)}>
                      <td className="px-5 py-3 font-medium text-slate-900">{l.name}</td>
                      <td className="px-5 py-3 text-slate-600">{l.email}</td>
                      <td className="px-5 py-3 text-slate-600">{l.company || "—"}</td>
                      <td className="px-5 py-3"><Badge color={STATUS_COLORS[l.status]}>{l.status}</Badge></td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-end z-50" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="font-bold text-slate-900">{selected.name}</h2>
                <a href={`mailto:${selected.email}`} className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"><Mail className="w-3 h-3"/>{selected.email}</a>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {selected.company && <Row label="Company" value={selected.company} />}
              {selected.phone && <Row label="Phone" value={selected.phone} />}
              {selected.subject && <Row label="Subject" value={selected.subject} />}
              <Row label="Received" value={new Date(selected.createdAt).toLocaleString()} />
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1.5">Message</div>
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">{selected.message}</div>
              </div>
              <Select label="Status" value={selected.status}
                onChange={(e) => update.mutate({ id: selected.id, patch: { status: e.target.value as Lead["status"] } })}>
                {["new","in_progress","won","lost","archived"].map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </Select>
              <Textarea label="Notes" rows={4} defaultValue={selected.notes ?? ""}
                onBlur={(e) => update.mutate({ id: selected.id, patch: { notes: e.target.value } })} />
              <Button variant="danger" onClick={() => confirm("Delete this lead?") && del.mutate(selected.id)}>
                <Trash2 className="w-4 h-4"/>Delete lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500 uppercase font-semibold mb-0.5">{label}</div>
      <div className="text-sm text-slate-900">{value}</div>
    </div>
  );
}
