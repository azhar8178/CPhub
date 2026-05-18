import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SectionRenderer } from "@/components/Sections";
import { useEffect } from "react";

export default function PageView({ slug }: { slug: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => api.page(slug),
  });

  useEffect(() => {
    if (data?.seoTitle) document.title = data.seoTitle;
    if (data?.seoDescription) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
      }
      m.setAttribute("content", data.seoDescription);
    }
  }, [data]);

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
