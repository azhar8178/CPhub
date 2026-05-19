import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { SectionRenderer } from "@/components/Sections";
import { useSeoMeta, SITE_NAME } from "@/lib/seo";

export default function PageView({ slug }: { slug: string }) {
  const [location] = useLocation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => api.page(slug),
  });

  const canonical = `${window.location.origin}${location}`;

  useSeoMeta({
    title: data?.seoTitle ?? (data ? `${data.title} · ${SITE_NAME}` : undefined),
    description: data?.seoDescription ?? undefined,
    canonical,
    ogImage: data?.ogImage ?? undefined,
    ogType: "website",
    jsonLd: data
      ? {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: data.seoTitle ?? data.title,
          description: data.seoDescription ?? undefined,
          url: canonical,
        }
      : undefined,
  });

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-6 py-32 text-center text-slate-500">Loading…</div>;
  }
  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400">We couldn't find that page.</p>
      </div>
    );
  }

  return (
    <div>
      {data.sections.map((s, i) => <SectionRenderer key={i} section={s} />)}
    </div>
  );
}
