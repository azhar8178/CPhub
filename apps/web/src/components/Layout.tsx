import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api, type SiteSettings } from "@/lib/api";
import { Github, Linkedin, Twitter, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: api.settings,
  });
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const nav = settings?.navigation?.primary ?? [
    { label: "Services", href: "/services" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  const branding = settings?.branding;
  const contact = settings?.contact;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white"><path d="M5 18 L12 6 L19 18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="font-bold text-white">
                {branding?.logoText ?? "CloudPartnerHub"}
              </span>
            </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = location === n.href || (n.href !== "/" && location.startsWith(n.href));
              return (
                <Link key={n.href} href={n.href} className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${active ? "text-white bg-white/5" : "text-slate-300 hover:text-white hover:bg-white/5"}`}>
                    {n.label}
                  </Link>
              );
            })}
            <Link href="/contact" className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-lg shadow-brand-600/30 transition">
                Book a call
              </Link>
          </nav>
          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-white/5 bg-slate-950/95 px-6 py-3 space-y-1">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5">{n.label}</Link>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/5 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500" />
              <span className="font-bold text-white">{branding?.logoText ?? "CloudPartnerHub"}</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              {branding?.tagline ?? "DevOps. Cloud. Done Right."} Senior platform engineers building cloud and DevOps platforms for ambitious teams.
            </p>
            <div className="flex gap-3 mt-5">
              {contact?.social?.linkedin && <a href={contact.social.linkedin} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"><Linkedin size={16}/></a>}
              {contact?.social?.twitter && <a href={contact.social.twitter} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"><Twitter size={16}/></a>}
              {contact?.social?.github && <a href={contact.social.github} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"><Github size={16}/></a>}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Company</div>
            <ul className="space-y-2 text-sm text-slate-300">
              {nav.map((n) => (
                <li key={n.href}><Link href={n.href} className="hover:text-white">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Get in touch</div>
            <ul className="space-y-2 text-sm text-slate-300">
              {contact?.email && <li><a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a></li>}
              {contact?.phone && <li>{contact.phone}</li>}
              {contact?.address && <li className="text-slate-400">{contact.address}</li>}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 text-xs text-slate-500 flex flex-col md:flex-row justify-between gap-2">
            <div>© {new Date().getFullYear()} Cloud Partner Hub. All rights reserved.</div>
            <div>Built for ambitious engineering teams.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
