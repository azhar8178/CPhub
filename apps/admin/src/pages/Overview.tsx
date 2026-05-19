import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "wouter";
import {
  FileText, Newspaper, Inbox, Users, Send,
  ArrowUpRight, TrendingUp, UserCircle2,
} from "lucide-react";

export default function Overview() {
  const { data: pages } = useQuery({ queryKey: ["pages"], queryFn: api.pages.list });
  const { data: posts } = useQuery({ queryKey: ["posts"], queryFn: api.posts.list });
  const { data: leads } = useQuery({ queryKey: ["leads"], queryFn: api.leads.list });
  const { data: subs } = useQuery({ queryKey: ["subs"], queryFn: api.subscribers.list });
  const { data: campaigns } = useQuery({ queryKey: ["campaigns"], queryFn: api.campaigns.list });

  const newLeads = leads?.filter((l) => l.status === "new").length ?? 0;
  const activeSubs = subs?.filter((s) => s.status === "subscribed").length ?? 0;

  const stats = [
    {
      label: "Pages",
      value: pages?.length ?? 0,
      icon: FileText,
      href: "/pages",
      gradient: "from-violet-600 to-purple-700",
      glow: "shadow-violet-500/20",
    },
    {
      label: "Blog posts",
      value: posts?.length ?? 0,
      icon: Newspaper,
      href: "/posts",
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
    },
    {
      label: "New leads",
      value: newLeads,
      icon: Inbox,
      href: "/leads",
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20",
    },
    {
      label: "Subscribers",
      value: activeSubs,
      icon: Users,
      href: "/subscribers",
      gradient: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
    },
    {
      label: "Campaigns",
      value: campaigns?.length ?? 0,
      icon: Send,
      href: "/campaigns",
      gradient: "from-pink-500 to-rose-600",
      glow: "shadow-pink-500/20",
    },
  ];

  const quickActions = [
    { label: "New blog post", href: "/posts", icon: Newspaper, desc: "Write and publish a new article" },
    { label: "Edit team", href: "/team", icon: UserCircle2, desc: "Update team member profiles" },
    { label: "View leads", href: "/leads", icon: Inbox, desc: `${newLeads} new enquir${newLeads === 1 ? "y" : "ies"} waiting` },
    { label: "Send campaign", href: "/campaigns", icon: Send, desc: `${activeSubs} active subscriber${activeSubs === 1 ? "" : "s"}` },
  ];

  const recentLeads = (leads ?? []).slice(0, 4);
  const recentPosts = (posts ?? []).slice(0, 4);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-slate-900 px-8 pt-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">Good to see you</h1>
              <p className="text-slate-400 text-sm mt-0.5">Here's what's happening across Cloud Partner Hub.</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 transition"
            >
              View live site <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 -mt-8 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href} className="block group">
                <div className={`rounded-2xl bg-gradient-to-br ${s.gradient} p-5 shadow-lg ${s.glow} group-hover:scale-[1.02] transition-transform`}>
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-4 h-4 text-white/70" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 transition" />
                  </div>
                  <div className="text-3xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-white/70 mt-0.5 font-medium">{s.label}</div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-900 text-sm">Latest leads</h3>
                {newLeads > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">{newLeads} new</span>
                )}
              </div>
              <Link href="/leads" className="text-xs text-violet-600 hover:text-violet-800 font-medium">View all →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentLeads.map((l) => (
                <div key={l.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {l.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 truncate">{l.name}</span>
                      {l.status === "new" && <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{l.email}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{l.message.slice(0, 70)}{l.message.length > 70 ? "…" : ""}</div>
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">{new Date(l.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              {recentLeads.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No leads yet — share your site to get started.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-slate-900 text-sm">Recent posts</h3>
              </div>
              <Link href="/posts" className="text-xs text-violet-600 hover:text-violet-800 font-medium">View all →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentPosts.map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Newspaper className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">{p.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{p.status}</span>
                      <span className="text-xs text-slate-400">{new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {recentPosts.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <Newspaper className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No posts yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-900 text-sm">Quick actions</h3>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.label} href={a.href} className="group flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition flex items-center gap-1">
                      {a.label} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{a.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
