import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      await api.login(email, password);
      window.location.href = "/admin/";
    } catch (e2) {
      setErr((e2 as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white"><path d="M5 18 L12 6 L19 18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="text-white font-bold text-lg">Cloud Partner Hub</div>
          </div>
          <div className="text-slate-400 text-sm mt-2">Admin sign-in</div>
        </div>
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-2xl p-7 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {err && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</div>}
          <button type="submit" disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold inline-flex items-center justify-center gap-2 transition">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
