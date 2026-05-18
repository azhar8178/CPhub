import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type User } from "@/lib/api";
import { Button, Card, Input, PageHeader, Badge, EmptyState } from "@/components/ui";
import { Plus, Trash2, Download } from "lucide-react";

export default function Subscribers() {
  const qc = useQueryClient();
  const { data: subs } = useQuery({ queryKey: ["subs"], queryFn: api.subscribers.list });
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: api.users.list });
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const create = useMutation({
    mutationFn: () => api.subscribers.create({ email, name: name || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subs"] }); setEmail(""); setName(""); },
  });
  const del = useMutation({
    mutationFn: (id: number) => api.subscribers.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subs"] }),
  });

  function exportCSV() {
    if (!subs) return;
    const csv = ["email,name,status,source,createdAt", ...subs.map((s) => `${s.email},${s.name ?? ""},${s.status},${s.source ?? ""},${s.createdAt}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
  }

  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle="Newsletter audience and team members."
        actions={<Button variant="secondary" onClick={exportCSV}><Download className="w-4 h-4"/>Export CSV</Button>}
      />
      <div className="p-8 space-y-6">
        <Card className="p-5">
          <div className="text-sm font-semibold text-slate-900 mb-3">Add subscriber manually</div>
          <div className="flex gap-2">
            <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
            <Input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            <Button onClick={() => create.mutate()} disabled={!email}><Plus className="w-4 h-4"/>Add</Button>
          </div>
        </Card>

        <Card>
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 font-semibold text-sm text-slate-900">
            Newsletter subscribers ({subs?.length ?? 0})
          </div>
          {!subs || subs.length === 0 ? (
            <EmptyState title="No subscribers yet" hint="Sign-ups from the public site will appear here." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-900">{s.email}</td>
                    <td className="px-5 py-3 text-slate-600">{s.name ?? "—"}</td>
                    <td className="px-5 py-3"><Badge color={s.status === "subscribed" ? "green" : s.status === "bounced" ? "red" : "slate"}>{s.status}</Badge></td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{s.source ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => confirm("Remove?") && del.mutate(s.id)}><Trash2 className="w-3.5 h-3.5"/></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 font-semibold text-sm text-slate-900">
            Admin users ({users?.length ?? 0})
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u: User) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3"><Badge color="violet">{u.role}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
