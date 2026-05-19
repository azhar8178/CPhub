import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Mail, Phone, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { useSeoMeta, SITE_NAME } from "@/lib/seo";

export default function Contact() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: api.settings });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  useSeoMeta({
    title: `Contact · ${SITE_NAME}`,
    description: "Get in touch for an architecture review, fixed-price project or full SRE coverage. We reply within one business day.",
    canonical: `${window.location.origin}/contact`,
    ogType: "website",
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErr(null);
    try {
      const fd = new FormData(e.currentTarget);
      const data = Object.fromEntries(fd) as Record<string, string>;
      if (data._hp) { setState("success"); return; }
      await api.submitLead({
        name: data.name,
        email: data.email,
        company: data.company || undefined,
        phone: data.phone || undefined,
        subject: data.subject || undefined,
        message: data.message,
      });
      setState("success");
      e.currentTarget.reset();
    } catch (e2) {
      setErr((e2 as Error).message);
      setState("error");
    }
  }

  return (
    <div>
      <section className="grid-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-brand-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" /> Contact
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight glow-text mb-4">Let's talk.</h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-300">
            Architecture review, fixed-price project or full SRE coverage — start with a conversation. We reply within one business day.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 grid md:grid-cols-3 gap-10">
          <div className="space-y-5 md:col-span-1">
            {settings?.contact?.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-300 mt-0.5" />
                <div>
                  <div className="text-xs uppercase text-slate-500 mb-0.5">Email</div>
                  <a href={`mailto:${settings.contact.email}`} className="text-white hover:text-brand-300">{settings.contact.email}</a>
                </div>
              </div>
            )}
            {settings?.contact?.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-300 mt-0.5" />
                <div>
                  <div className="text-xs uppercase text-slate-500 mb-0.5">Phone</div>
                  <div className="text-white">{settings.contact.phone}</div>
                </div>
              </div>
            )}
            {settings?.contact?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-300 mt-0.5" />
                <div>
                  <div className="text-xs uppercase text-slate-500 mb-0.5">Where</div>
                  <div className="text-white">{settings.contact.address}</div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            {state === "success" ? (
              <div className="card rounded-2xl p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Got it — we'll be in touch.</h2>
                <p className="text-slate-400">A senior engineer will respond within one business day.</p>
                <button onClick={() => setState("idle")} className="mt-6 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white">Send another message</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="card rounded-2xl p-6 md:p-8 space-y-4">
                <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Field name="name" label="Your name" required />
                  <Field name="email" label="Email" type="email" required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field name="company" label="Company" />
                  <Field name="phone" label="Phone" />
                </div>
                <Field name="subject" label="Subject" />
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Tell us about your stack <span className="text-red-400">*</span></label>
                  <textarea name="message" required rows={5} className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 transition" placeholder="A few sentences about your team, infra and what you're trying to achieve." />
                </div>
                {err && <div className="text-sm text-red-400">{err}</div>}
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 text-white font-semibold shadow-lg shadow-brand-600/30 transition inline-flex items-center justify-center gap-2"
                >
                  {state === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 transition"
      />
    </div>
  );
}
