import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Mail, Lock, X } from "lucide-react";
import { adminApi } from "../../services/adminApi";

/**
 * ============================================================
 *  सुपर एडमिन लगइन — regular एडमिनको फर्मकदा छुट्टै।
 *  अँध्यारो slate स्टाइल, shield आइकन, छुट्टै copy।
 *  यहाँ 'admin' भूमिकाले लगइन गर्न मिल्दैन।
 * ============================================================
 */
export default function SuperAdminLogin() {
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
      const role = r?.user?.role;

      if (!r || !r.token) return setErr(r?.message || "लगइन असफल भयो");

      if (role !== "superadmin") {
        /* सुपर ढोका खोलेर normal एडमिन आयो — ढोका बन्द गरिदिने */
        return setErr("यो सुपर एडमिन ढोका हो। साधारण एडमिनले यहाँ लगइन गर्न पाउँदैन।");
      }

      localStorage.setItem("nagarik_admin_token", r.token);
      nav("/superadmin", { replace: true });
    } catch (ex) {
      setErr(ex.message || "लगइन असफल भयो");
    } finally {
      setBusy(false);
    }
  };

  const box =
    "w-full rounded-none border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white " +
    "outline-none transition placeholder:text-white/35 focus:border-white/60 focus:bg-white/10";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-4">
      {/* ठ्याम्मे हल्का ग्रेडिएन्ट — regular लगइन (निलो) भन्दा फरक */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(100,116,139,.35),transparent_60%)]" />

      <div className="relative w-full max-w-md border border-white/10 bg-slate-900/95 shadow-2xl">
        {/* माथिल्लो पट्टी — slate, निलो होइन */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-white text-slate-900">
              <ShieldCheck size={20} />
            </span>
            <div>
              <b className="block text-base leading-5 text-white">सुपर एडमिन</b>
              <small className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Super Admin Access
              </small>
            </div>
          </div>
          <button
            onClick={() => nav("/")}
            className="p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="बन्द"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-400">
              सुपर एडमिन इमेल
            </span>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="super@gmail.com"
                className={`${box} pl-10`}
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-400">
              पासवर्ड
            </span>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••"
                className={`${box} pl-10`}
              />
            </div>
          </label>

          {err && (
            <p className="border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm font-bold text-rose-300">
              {err}
            </p>
          )}

          <button
            disabled={busy}
            className="w-full bg-white py-3 text-sm font-black uppercase tracking-wide text-slate-900 transition hover:bg-slate-200 disabled:opacity-60"
          >
            {busy ? "जाँच हुँदैछ..." : "सुपर एडमिन लगइन"}
          </button>
        </form>

        <div className="border-t border-white/10 px-6 py-3">
          <p className="text-center text-[11px] font-bold text-slate-500">
            <Link to="/superadmin/forgot" className="text-slate-400 hover:text-white">
              पासवर्ड बिर्सनुभयो?
            </Link>
            <span className="mx-2 text-slate-700">·</span>
            <Link to="/admin/login" className="text-slate-300 underline hover:text-white">
              एडमिन लगइनमा जानुहोस्
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
