import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button, Card, Input, Textarea, PageHeader } from "@/components/ui";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: s } = useQuery({ queryKey: ["settings"], queryFn: api.settings.get });
  const [branding, setBranding] = useState<{ siteName: string; tagline: string; logoText: string; primaryColor: string }>({
    siteName: "", tagline: "", logoText: "", primaryColor: "#7c3aed",
  });
  const [contact, setContact] = useState<{ email: string; phone: string; address: string; linkedin: string; twitter: string; github: string }>({
    email: "", phone: "", address: "", linkedin: "", twitter: "", github: "",
  });
  const [seo, setSeo] = useState<{ defaultTitle: string; defaultDescription: string; gaId: string; sitemapEnabled: boolean }>({
    defaultTitle: "", defaultDescription: "", gaId: "", sitemapEnabled: true,
  });
  const [smtp, setSmtp] = useState<{ host: string; port: string; user: string; from: string }>({
    host: "", port: "587", user: "", from: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!s) return;
    const b = (s.branding ?? {}) as Partial<typeof branding>;
    const c = (s.contact ?? {}) as { email?: string; phone?: string; address?: string; social?: Record<string, string> };
    const se = (s.seo ?? {}) as Partial<typeof seo>;
    const sm = (s.smtp ?? {}) as Partial<typeof smtp>;
    setBranding({ siteName: b.siteName ?? "", tagline: b.tagline ?? "", logoText: b.logoText ?? "", primaryColor: b.primaryColor ?? "#7c3aed" });
    setContact({
      email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "",
      linkedin: c.social?.linkedin ?? "", twitter: c.social?.twitter ?? "", github: c.social?.github ?? "",
    });
    setSeo({ defaultTitle: se.defaultTitle ?? "", defaultDescription: se.defaultDescription ?? "", gaId: se.gaId ?? "", sitemapEnabled: se.sitemapEnabled ?? true });
    setSmtp({ host: sm.host ?? "", port: sm.port ?? "587", user: sm.user ?? "", from: sm.from ?? "" });
  }, [s]);

  const save = useMutation({
    mutationFn: () => api.settings.save({
      branding,
      contact: { email: contact.email, phone: contact.phone, address: contact.address, social: { linkedin: contact.linkedin, twitter: contact.twitter, github: contact.github } },
      seo,
      smtp,
    }),
    onSuccess: () => { setSaved(true); qc.invalidateQueries({ queryKey: ["settings"] }); setTimeout(() => setSaved(false), 2000); },
  });

  return (
    <div>
      <PageHeader title="Settings" subtitle="Site-wide configuration."
        actions={<Button onClick={() => save.mutate()}><Save className="w-4 h-4"/>{saved ? "Saved ✓" : "Save settings"}</Button>} />
      <div className="p-8 grid lg:grid-cols-2 gap-5">
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">Branding</h3>
          <Input label="Site name" value={branding.siteName} onChange={(e) => setBranding({ ...branding, siteName: e.target.value })} />
          <Input label="Tagline" value={branding.tagline} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} />
          <Input label="Logo text" value={branding.logoText} onChange={(e) => setBranding({ ...branding, logoText: e.target.value })} />
          <Input label="Primary color (hex)" value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} />
        </Card>
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">Contact</h3>
          <Input label="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <Input label="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          <Input label="Address" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
          <Input label="LinkedIn URL" value={contact.linkedin} onChange={(e) => setContact({ ...contact, linkedin: e.target.value })} />
          <Input label="Twitter URL" value={contact.twitter} onChange={(e) => setContact({ ...contact, twitter: e.target.value })} />
          <Input label="GitHub URL" value={contact.github} onChange={(e) => setContact({ ...contact, github: e.target.value })} />
        </Card>
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">SEO</h3>
          <Input label="Default title" value={seo.defaultTitle} onChange={(e) => setSeo({ ...seo, defaultTitle: e.target.value })} />
          <Textarea label="Default description" rows={3} value={seo.defaultDescription} onChange={(e) => setSeo({ ...seo, defaultDescription: e.target.value })} />
          <Input label="Google Analytics ID (G-XXXX)" value={seo.gaId} onChange={(e) => setSeo({ ...seo, gaId: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={seo.sitemapEnabled} onChange={(e) => setSeo({ ...seo, sitemapEnabled: e.target.checked })} />
            Generate sitemap.xml
          </label>
        </Card>
        <Card className="p-6 space-y-3">
          <h3 className="font-semibold text-slate-900">SMTP (for campaigns)</h3>
          <Input label="Host" placeholder="smtp.example.com" value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} />
          <Input label="Port" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} />
          <Input label="Username" value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} />
          <Input label="From address" value={smtp.from} onChange={(e) => setSmtp({ ...smtp, from: e.target.value })} />
          <p className="text-xs text-slate-500">Password is stored as a secret — set <code className="font-mono">SMTP_PASSWORD</code> in environment variables.</p>
        </Card>
      </div>
    </div>
  );
}
