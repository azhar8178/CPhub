import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, PageHeader } from "@/components/ui";
import { Link } from "wouter";
import { FileText, Newspaper, Inbox, Users, Send } from "lucide-react";

export default function Overview() {
  const { data: pages } = useQuery({ queryKey: ["pages"], queryFn: api.pages.list });
  const { data: posts } = useQuery({ queryKey: ["posts"], queryFn: api.posts.list });
  const { data: leads } = useQuery({ queryKey: ["leads"], queryFn: api.leads.list });
  const { data: subs } = useQuery({ queryKey: ["subs"], queryFn: api.subscribers.list });
  const { data: campaigns } = useQuery({ queryKey: ["campaigns"], queryFn: api.campaigns.list });

  const newLeads = leads?.filter((l) => l.status === "new").length ?? 0;

  const stats = [
    { label: "Pages", value: pages?.length ?? 0, icon: FileText, href: "/pages", color: "bg-blue-100 text-blue-700" },
    { label: "Blog posts", value: posts?.length ?? 0, icon: Newspaper, href: "/posts", color: "bg-violet-100 text-violet-700" },
    { label: "Leads (new)", value: newLeads, icon: Inbox, href: "/leads", color: "bg-amber-100 text-amber-700" },
    { label: "Subscribers", value: subs?.filter((s) => s.status === "subscribed").length ?? 0, icon: Users, href: "/subscribers", color: "bg-green-100 text-green-700" },
    { label: "Campaigns", value: campaigns?.length ?? 0, icon: Send, href: "/campaigns", color: "bg-pink-100 text-pink-700" },
  ];

  return (
    <div>
      <PageHeader title="Overview" subtitle="What's happening across your site right now." />
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href} className="block">
                  <Card className="p-5 hover:shadow-md transition cursor-pointer">
                    <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{s.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  </Card>
                </Link>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Latest leads</h3>
              <Link href="/leads" className="text-xs text-brand-600 hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {(leads ?? []).slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{l.name}</div>
                    <div className="text-xs text-slate-500 truncate">{l.email} · {new Date(l.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-600 truncate mt-1">{l.message.slice(0, 80)}…</div>
                  </div>
                </div>
              ))}
              {(!leads || leads.length === 0) && <div className="text-sm text-slate-500">No leads yet.</div>}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Latest blog posts</h3>
              <Link href="/posts" className="text-xs text-brand-600 hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {(posts ?? []).slice(0, 5).map((p) => (
                <div key={p.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="text-sm font-medium text-slate-900">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.status} · {new Date(p.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {(!posts || posts.length === 0) && <div className="text-sm text-slate-500">No posts yet.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
