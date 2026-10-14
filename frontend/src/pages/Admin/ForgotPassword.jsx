import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { KeyRound, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { publicApi } from "../../services/adminApi";

/**
 * बिर्सनुभएको पासवर्ड — मालिकको इमेलमा पठाइने **४ अङ्कको OTP** बाट मात्र।
 * OTP मिलेपछि नयाँ पासवर्ड राख्न मिल्छ, नत्र केही हुँदैन।
 */
export default function ForgotPassword() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const [step, setStep] = useState("email");     // email | otp | done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const send = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const r = await publicApi.forgotSend(email);
      setMsg({ k: "ok", t: r.message });
      setStep("otp");
    } catch (ex) {
      setMsg({ k: "err", t: ex.message });
    } finally { setBusy(false); }
  };

  const reset = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const r = await publicApi.forgotReset(email, otp.join(""), pw);
      setMsg({ k: "ok", t: r.message });
      setStep("done");
    } catch (ex) {
      setMsg({ k: "err", t: ex.message });
      setOtp(["", "", "", ""]);
    } finally { setBusy(false); }
  };

  const type = (i, v) => {
    v = v.replace(/\D/g, "").slice(-1);
    setOtp((d) => { const n = [...d]; n[i] = v; return n; });
    if (v && i < 3) { const b = document.getElementById(`f-otp-${i + 1}`); if (b) b.focus(); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <span className="grid h-9 w-9 place-items-center bg-white/15"><KeyRound size={17} /></span>
          <b className="text-sm">पासवर्ड बिर्सनुभयो?</b>
          <button onClick={() => nav(-1)} className="ml-auto text-white/60 hover:text-white" aria-label="पछाडि">
            <ArrowLeft size={17} />
          </button>
        </div>

        <div className="p-6">
          {msg && (
            <p className={`mb-4 border px-3 py-2.5 text-sm font-bold ${
              msg.k === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {msg.t}
            </p>
          )}

          {/* ---- इमेल ---- */}
          {step === "email" && (
            <form onSubmit={send} className="space-y-4">
              <p className="text-sm font-bold text-slate-500">
                आफ्नो इमेल लेख्नुहोस्। मालिकको इमेलमा <b className="text-slate-800">४ अङ्कको OTP</b> जान्छ।
              </p>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-600">इमेल</span>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="तपाईंको इमेल" className="w-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-slate-900 focus:bg-white" />
                </div>
              </label>
              <button disabled={busy} className="w-full bg-slate-900 py-3 text-sm font-black text-white transition hover:bg-slate-700 disabled:opacity-60">
                {busy ? "पठाउँदैछ..." : "OTP पठाउनुहोस्"}
              </button>
              <p className="text-center text-[11px] font-bold text-slate-400">
                खाता नभए पनि "पठाइयो" भन्नेछ — कसको खाता छ भन्ने बताइँदैन।
              </p>
            </form>
          )}

          {/* ---- OTP + नयाँ पासवर्ड ---- */}
          {step === "otp" && (
            <form onSubmit={reset} className="space-y-4">
              <p className="text-sm font-bold text-slate-500">
                इमेलमा पठाइएको <b className="text-slate-800">४ अङ्कको OTP</b> लेख्नुहोस् र नयाँ पासवर्ड राख्नुहोस्।
              </p>
              <div className="flex justify-center gap-2">
                {otp.map((d, i) => (
                  <input key={i} id={`f-otp-${i}`} value={d} maxLength={1} inputMode="numeric"
                    autoComplete="one-time-code" onChange={(e) => type(i, e.target.value)}
                    className="h-13 w-13 border-2 border-slate-300 py-3 text-center text-2xl font-black outline-none focus:border-slate-900" />
                ))}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-600">नयाँ पासवर्ड</span>
                <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)}
                  placeholder="कम्तीमा ६ अक्षर" className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white" />
              </label>
              <button disabled={busy || otp.join("").length !== 4} className="w-full bg-slate-900 py-3 text-sm font-black text-white transition hover:bg-slate-700 disabled:opacity-60">
                {busy ? "जाँच हुँदैछ..." : "पासवर्ड बदल्नुहोस्"}
              </button>
            </form>
          )}

          {/* ---- पूरा ---- */}
          {step === "done" && (
            <div className="py-4 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={28} />
              </span>
              <p className="mt-4 text-sm font-bold text-slate-600">पासवर्ड बदलियो।</p>
              <button onClick={() => nav(pathname.replace("/forgot", "/login"), { replace: true })}
                className="mt-5 w-full bg-slate-900 py-3 text-sm font-black text-white hover:bg-slate-700">
                लगइनमा जानुहोस्
              </button>
            </div>
          )}

          {step !== "done" && (
            <p className="mt-4 text-center text-xs font-bold text-slate-400">
              <Link to="#" onClick={(e) => { e.preventDefault(); nav(-1); }}>लगइनमा फर्कनुहोस्</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
