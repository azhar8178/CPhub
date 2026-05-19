import { Link } from "wouter";
import type { PageSection } from "@/lib/api";
import {
  Cloud, Workflow, Container, Lock, Activity, Zap, Database,
  ArrowRight, CheckCircle2,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cloud: Cloud,
  workflow: Workflow,
  container: Container,
  lock: Lock,
  activity: Activity,
  zap: Zap,
  database: Database,
};

function Icon({ name }: { name?: string }) {
  const Cmp = (name && ICONS[name]) || Cloud;
  return <Cmp className="w-5 h-5 text-brand-300" />;
}

export function SectionRenderer({ section }: { section: PageSection }) {
  switch (section.type) {
    case "hero":
      return (
        <section className="grid-bg relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-28 text-center">
            {section.eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-brand-300 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                {section.eyebrow}
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              <span className="glow-text">{section.headline}</span>
            </h1>
            {section.sub && (
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed">
                {section.sub}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
              {section.ctaPrimary && (
                <Link href={section.ctaPrimary.href} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold shadow-xl shadow-brand-600/30 transition">
                    {section.ctaPrimary.label}
                    <ArrowRight size={16} />
                  </Link>
              )}
              {section.ctaSecondary && (
                <Link href={section.ctaSecondary.href} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition">
                    {section.ctaSecondary.label}
                  </Link>
              )}
            </div>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="py-16 border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            {section.headline && (
              <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 mb-10">
                {section.headline}
              </h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {section.items.map((it, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl md:text-5xl font-black glow-text mb-1">{it.value}</div>
                  <div className="text-sm text-slate-400">{it.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "services":
      return (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="max-w-2xl mb-12">
              {section.headline && (
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{section.headline}</h2>
              )}
              {section.sub && <p className="text-slate-400 text-lg">{section.sub}</p>}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.items.map((it, i) => (
                <div key={i} className="card rounded-2xl p-6 transition hover:translate-y-[-2px]">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mb-4">
                    <Icon name={it.icon} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{it.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{it.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "process":
      return (
        <section className="py-24 bg-gradient-to-b from-transparent via-brand-900/10 to-transparent">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            {section.headline && (
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">{section.headline}</h2>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {section.items.map((it, i) => (
                <div key={i} className="card rounded-2xl p-6 relative">
                  <div className="text-xs font-mono font-bold text-brand-400 mb-3">{it.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{it.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{it.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "logos":
      return (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            {section.headline && (
              <p className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 mb-8">
                {section.headline}
              </p>
            )}
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
              {section.items.map((name, i) => (
                <span key={i} className="text-2xl md:text-3xl font-bold text-slate-600 hover:text-slate-300 transition">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      );

    case "values":
      return (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            {section.headline && (
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">{section.headline}</h2>
            )}
            <div className="grid md:grid-cols-2 gap-5">
              {section.items.map((it, i) => (
                <div key={i} className="card rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-300 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{it.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{it.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "cases":
      return (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-8">
            {section.items.map((c, i) => (
              <div key={i} className="card rounded-3xl p-8 md:p-12">
                <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono font-semibold text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                        {c.industry}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{c.client}</div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-5 leading-tight">{c.headline}</h3>
                    {c.challenge && (
                      <div className="mb-4 pl-4 border-l-2 border-white/10">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">The challenge</div>
                        <p className="text-sm text-slate-400 leading-relaxed">{c.challenge}</p>
                      </div>
                    )}
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">{c.body}</p>
                    {c.stack && c.stack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-5">
                        {c.stack.map((tag, ti) => (
                          <span key={ti} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/8 text-xs text-slate-400 font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-6">
                    {c.metrics.map((m, mi) => (
                      <div key={mi} className="pl-4 border-l-2 border-brand-500/30">
                        <div className="text-2xl md:text-3xl font-black glow-text leading-none">{m.value}</div>
                        <div className="text-xs text-slate-500 mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      );

    case "cta":
      return (
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-3xl p-10 md:p-14 bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 text-center">
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{section.headline}</h2>
                {section.sub && <p className="text-white/80 mb-7 text-lg">{section.sub}</p>}
                <Link href={section.cta.href} className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-brand-700 font-semibold shadow-xl hover:bg-slate-100 transition">
                    {section.cta.label}
                    <ArrowRight size={16} />
                  </Link>
              </div>
            </div>
          </div>
        </section>
      );
  }
}
