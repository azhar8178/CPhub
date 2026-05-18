import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button, Card, Input, PageHeader, EmptyState } from "@/components/ui";
import { Plus, Trash2, Copy, Check } from "lucide-react";

export default function Media() {
  const qc = useQueryClient();
  const { data: items } = useQuery({ queryKey: ["media"], queryFn: api.media.list });
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [alt, setAlt] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const add = useMutation({
    mutationFn: () => api.media.create({ url, originalName: name || url.split("/").pop() || "image", alt, mimeType: guessMime(url) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["media"] }); setUrl(""); setName(""); setAlt(""); },
  });
  const del = useMutation({
    mutationFn: (id: number) => api.media.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });

  function copyUrl(id: number, u: string) {
    navigator.clipboard.writeText(u);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      <PageHeader title="Media library" subtitle="Images and assets used across your site." />
      <div className="p-8 space-y-5">
        <Card className="p-5">
          <div className="text-sm font-semibold text-slate-900 mb-3">Add by URL</div>
          <div className="grid md:grid-cols-4 gap-2">
            <Input placeholder="https://… image URL" value={url} onChange={(e) => setUrl(e.target.value)} className="md:col-span-2" />
            <Input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Alt text" value={alt} onChange={(e) => setAlt(e.target.value)} />
          </div>
          <div className="mt-3"><Button onClick={() => add.mutate()} disabled={!url}><Plus className="w-4 h-4"/>Add to library</Button></div>
          <p className="text-xs text-slate-500 mt-2">Tip: drop images into <code className="font-mono">attached_assets/</code> or paste a public URL (e.g. from Unsplash).</p>
        </Card>

        {!items || items.length === 0 ? (
          <Card><EmptyState title="No media yet" hint="Add an image URL above to get started." /></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((m) => (
              <Card key={m.id} className="overflow-hidden">
                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={m.url} alt={m.alt ?? ""} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-xs font-medium text-slate-900 truncate">{m.originalName}</div>
                  <div className="text-[10px] text-slate-500 truncate">{m.mimeType}</div>
                  <div className="flex gap-1 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => copyUrl(m.id, m.url)}>
                      {copied === m.id ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                      {copied === m.id ? "Copied" : "Copy"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => confirm("Delete?") && del.mutate(m.id)}>
                      <Trash2 className="w-3 h-3"/>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function guessMime(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0] ?? "";
  return { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp" }[ext] ?? "image/jpeg";
}
