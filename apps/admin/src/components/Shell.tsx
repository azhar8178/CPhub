import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, Newspaper, Inbox, Mail, Send,
  Users, Image as ImageIcon, Settings, LogOut, ExternalLink, UserCircle2,
} from "lucide-react";
import { setToken } from "@/lib/api";

const NAV: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/pages", label: "Pages", icon: FileText },
  { href: "/team", label: "Team", icon: UserCircle2 },
  { href: "/posts", label: "Blog posts", icon: Newspaper },
  { href: "/leads", label: "Leads", icon: Inbox },
  { href: "/subscribers", label: "Subscribers", icon: Users },
  { href: "/templates", label: "Email templates", icon: Mail },
  { href: "/campaigns", label: "Campaigns", icon: Send },
  { href: "/media", label: "Media", icon: ImageIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Shell({ children, user }: { children: React.ReactNode; user: { name: string; email: string; role: string } | null }) {
  const [location] = useLocation();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 44 44" className="w-8 h-8 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="adm-g" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <path d="M22 2 L39.1 11.5 L39.1 30.5 L22 40 L4.9 30.5 L4.9 11.5 Z" stroke="url(#adm-g)" strokeWidth="1.6" strokeLinejoin="round"/>
              <circle cx="22" cy="21" r="4.2" fill="url(#adm-g)"/>
              <line x1="22" y1="16.8" x2="22" y2="11" stroke="url(#adm-g)" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="22" cy="9.2" r="2.4" fill="url(#adm-g)" opacity="0.85"/>
              <line x1="25.64" y1="23.1" x2="29.84" y2="25.53" stroke="url(#adm-g)" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="31.67" cy="26.57" r="2.4" fill="url(#adm-g)" opacity="0.85"/>
              <line x1="18.36" y1="23.1" x2="14.16" y2="25.53" stroke="url(#adm-g)" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="12.33" cy="26.57" r="2.4" fill="url(#adm-g)" opacity="0.85"/>
            </svg>
            <div>
              <div className="font-medium text-sm text-slate-200">Cloud Partner <span className="font-extrabold text-white">Hub</span></div>
              <div className="text-xs text-slate-400">Admin</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((n) => {
            const active = location === n.href || (n.href !== "/" && location.startsWith(n.href));
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                  <Icon className="w-4 h-4" />
                  {n.label}
                </Link>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-white/10 space-y-1">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white">
            <ExternalLink className="w-4 h-4" /> View public site
          </a>
          <div className="px-3 py-2 text-xs text-slate-400">
            <div className="font-medium text-slate-200">{user?.name}</div>
            <div className="truncate">{user?.email}</div>
            <div className="mt-0.5 inline-block px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase tracking-wider">{user?.role}</div>
          </div>
          <button
            onClick={() => { setToken(null); window.location.href = "/admin/login"; }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 overflow-auto">{children}</main>
    </div>
  );
}
