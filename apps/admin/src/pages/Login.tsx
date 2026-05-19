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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "radial-gradient(ellipse at 60% 20%, #3b1d8a 0%, #0f0f1a 55%, #0c1929 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex flex-col items-center gap-3">
            <svg viewBox="0 0 44 44" className="w-14 h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="login-g" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <path d="M22 2 L39.1 11.5 L39.1 30.5 L22 40 L4.9 30.5 L4.9 11.5 Z" stroke="url(#login-g)" strokeWidth="1.6" strokeLinejoin="round"/>
              <circle cx="22" cy="21" r="4.2" fill="url(#login-g)"/>
              <line x1="22" y1="16.8" x2="22" y2="11" stroke="url(#login-g)" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="22" cy="9.2" r="2.4" fill="url(#login-g)" opacity="0.85"/>
              <line x1="25.64" y1="23.1" x2="29.84" y2="25.53" stroke="url(#login-g)" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="31.67" cy="26.57" r="2.4" fill="url(#login-g)" opacity="0.85"/>
              <line x1="18.36" y1="23.1" x2="14.16" y2="25.53" stroke="url(#login-g)" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="12.33" cy="26.57" r="2.4" fill="url(#login-g)" opacity="0.85"/>
            </svg>
            <div>
              <div className="text-white font-bold text-xl tracking-tight">Cloud Partner <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#a78bfa,#22d3ee)" }}>Hub</span></div>
              <div className="text-slate-400 text-sm mt-0.5">Admin portal</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-7 space-y-4" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)" }}>
          <h1 className="text-white font-semibold text-base mb-1">Sign in to your account</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            {err && (
              <div className="text-sm text-red-400 bg-red-950/50 border border-red-800/40 rounded-lg px-3 py-2">{err}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white inline-flex items-center justify-center gap-2 transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</> : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">Cloud Partner Hub · Admin</p>
      </div>
    </div>
  );
}
