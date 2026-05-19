import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight } from "lucide-react";
import { useSeoMeta, SITE_NAME } from "@/lib/seo";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({ queryKey: ["posts"], queryFn: api.posts });

  useSeoMeta({
    title: `Blog · ${SITE_NAME}`,
    description: "Engineering essays, war stories and patterns from the DevOps and cloud platforms we build.",
    canonical: `${window.location.origin}/blog`,
    ogType: "website",
  });

  return (
    <div>
      <section className="grid-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-brand-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Blog
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight glow-text mb-4">Field notes from the trenches</h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-300">
            Engineering essays, war stories and patterns from the platforms we build.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          {isLoading ? (
            <div className="text-center text-slate-500">Loading…</div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center text-slate-500">No posts yet.</div>
          ) : (
            <div className="grid gap-5">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="card rounded-2xl p-7 group flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 text-xs">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/30 text-brand-300 font-mono">{t}</span>
                        ))}
                        {p.publishedAt && (
                          <span className="text-slate-500">{new Date(p.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-white group-hover:text-brand-200 mb-2 leading-tight">{p.title}</h2>
                      <p className="text-slate-400">{p.excerpt}</p>
                      <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                        Read more <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
