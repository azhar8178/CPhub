import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { useSeoMeta, SITE_NAME } from "@/lib/seo";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function safeUrl(u: string) {
  const trimmed = u.trim();
  if (/^(https?:\/\/|mailto:|\/)/i.test(trimmed)) return escapeHtml(trimmed);
  return "#";
}
function inline(raw: string) {
  return escapeHtml(raw)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, url: string) =>
      `<a href="${safeUrl(url)}" rel="noreferrer noopener">${label}</a>`);
}
function renderBody(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((b, i) => {
    if (b.startsWith("## ")) return <h2 key={i}>{b.slice(3)}</h2>;
    if (b.startsWith("### ")) return <h3 key={i}>{b.slice(4)}</h3>;
    if (/^[-*] /m.test(b)) {
      return (
        <ul key={i}>
          {b.split("\n").map((line, li) => {
            const m = line.match(/^[-*] (.+)/);
            return m ? <li key={li} dangerouslySetInnerHTML={{ __html: inline(m[1]) }} /> : null;
          })}
        </ul>
      );
    }
    if (/^\d+\.\s/.test(b)) {
      return (
        <ol key={i}>
          {b.split("\n").map((line, li) => {
            const m = line.match(/^\d+\.\s(.+)/);
            return m ? <li key={li} dangerouslySetInnerHTML={{ __html: inline(m[1]) }} /> : null;
          })}
        </ol>
      );
    }
    return <p key={i} dangerouslySetInnerHTML={{ __html: inline(b) }} />;
  });
}

export default function BlogPost({ slug }: { slug: string }) {
  const [location] = useLocation();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => api.post(slug),
  });

  const canonical = `${window.location.origin}${location}`;
  const postTitle = post?.seoTitle ?? post?.title;
  const postDescription = post?.seoDescription ?? post?.excerpt ?? undefined;

  useSeoMeta({
    title: postTitle ? `${postTitle} · ${SITE_NAME}` : undefined,
    description: postDescription,
    canonical,
    ogImage: post?.coverImage ?? undefined,
    ogType: "article",
    twitterCard: post?.coverImage ? "summary_large_image" : "summary",
    jsonLd: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: post.coverImage ?? undefined,
          author: {
            "@type": "Person",
            name: post.author,
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
          },
          datePublished: post.publishedAt ?? undefined,
          url: canonical,
          keywords: post.tags.join(", "),
        }
      : undefined,
  });

  if (isLoading) return <div className="max-w-3xl mx-auto px-6 py-32 text-center text-slate-500">Loading…</div>;
  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-3xl font-bold text-white mb-3">Post not found</h1>
        <Link href="/blog" className="text-brand-300 hover:underline">← Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-8">
          <ArrowLeft size={14} /> Back to blog
        </Link>
      <div className="flex items-center gap-2 mb-4 text-xs">
        {post.tags.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/30 text-brand-300 font-mono">{t}</span>
        ))}
        {post.publishedAt && (
          <span className="text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</span>
        )}
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-[1.1]">{post.title}</h1>
      {post.excerpt && <p className="text-lg text-slate-300 mb-8">{post.excerpt}</p>}
      <div className="text-sm text-slate-500 mb-10">By {post.author}</div>
      <div className="prose-cphub">{renderBody(post.body)}</div>
    </article>
  );
}
