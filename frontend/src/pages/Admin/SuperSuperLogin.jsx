import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Crown, Mail, Lock, X } from "lucide-react";
import { adminApi } from "../../services/adminApi";

/**
 * सुपर-सुपर एडमिन लगइन — /super/superadmin
 * सबैभन्दा माथिल्लो खाता। अरू दुई फर्मभन्दा फरक (crown, कालो-सुनौटो)।
 */
export default function SuperSuperLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await adminApi.login(email, pw);
      if (!r || !r.token) return setErr(r?.message || "लगइन असफल भयो");
      if (r.user?.role !== "supersuper") {
        return setErr("यो सुपर-सुपर एडमिन ढोका हो। अरू खाताले यहाँ लगइन गर्न पाउँदैन।");
      }
      localStorage.setItem("nagarik_admin_token", r.token);
      nav("/super/superadmin", { replace: true });
    } catch (ex) {
      setErr(ex.message || "लगइन असफल भयो");
    } finally {
      setBusy(false);
    }
  };

  const box =
    "w-full border border-amber-500/25 bg-black/30 px-4 py-3 text-sm font-bold text-white " +
    "outline-none transition placeholder:text-white/30 focus:border-amber-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(217,169,78,.20),transparent_55%)]" />

      <div className="relative w-full max-w-md border border-amber-500/30 bg-neutral-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-amber-500/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-amber-500 text-neutral-950">
              <Crown size={20} />
            </span>
            <div>
              <b className="block text-base leading-5 text-amber-400">सुपर-सुपर एडमिन</b>
              <small className="text-[10px] font-black uppercase tracking-[.2em] text-amber-500/60">
                Level 3 · Master
              </small>
            </div>
          </div>
          <button onClick={() => nav("/")} className="p-1.5 text-neutral-500 transition hover:text-white" aria-label="बन्द">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-amber-500/70">
              इमेल
            </span>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" />
              <input type="email" required autoComplete="username" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="h@gmail.com"
                className={`${box} pl-10`} />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-amber-500/70">
              पासवर्ड
            </span>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/50" />
              <input type="password" required autoComplete="current-password" value={pw}
                onChange={(e) => setPw(e.target.value)} placeholder="••••••"
                className={`${box} pl-10`} />
            </div>
          </label>

          {err && (
            <p className="border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm font-bold text-rose-300">{err}</p>
          )}

          <button disabled={busy}
            className="w-full bg-amber-500 py-3 text-sm font-black uppercase tracking-wide text-neutral-950 transition hover:bg-amber-400 disabled:opacity-60">
            {busy ? "जाँच हुँदैछ..." : "प्रवेश गर्नुहोस्"}
          </button>
        </form>

        <div className="border-t border-amber-500/15 px-6 py-3 text-center">
          <Link to="/superadmin/login" className="text-[11px] font-bold text-neutral-600 hover:text-amber-400">
            ← सुपर एडमिन लगइनमा जानुहोस्
          </Link>
        </div>
      </div>
    </div>
  );
}
