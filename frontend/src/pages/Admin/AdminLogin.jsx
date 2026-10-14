import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X, Mail, Lock, Users } from "lucide-react";
import { adminApi } from "../../services/adminApi";

/**
 * साधारण एडमिन लगइन — सुपर एडमिनको फर्मकदा छुट्टै (SuperAdminLogin.jsx)।
 * यहाँ 'superadmin' भूमिकाले लगइन गर्न मिल्दैन।
 */
export default function AdminLogin() {
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
      if (r && r.token) {
        const role = r.user && r.user.role;

        /* सुपर एडमिन यहाँ आउन मिल्दैन — सुपर ढोका छुट्टै छ */
        if (role === "superadmin") {
          return setErr("यो सुपर एडमिन खाता हो। कृपया सुपर एडमिन लगइन प्रयोग गर्नुहोस्।");
        }

        localStorage.setItem("nagarik_admin_token", r.token);
        nav("/admin/dashboard", { replace: true });
      } else {
        setErr(r.message || "लगइन असफल भयो");
      }
    } catch (ex) {
      setErr(ex.message || "लगइन असफल भयो");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 text-2xl font-black">न</span>
          <div>
            <b className="block text-lg leading-5">नागरिक NEWS</b>
            <small className="text-white/80">एडमिन प्यानल</small>
          </div>
        </div>
        <button onClick={() => nav("/")} className="rounded-full bg-white/15 p-1.5 transition hover:bg-white/25"><X size={18}/></button>
      </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="text-center">
            <h1 className="text-xl font-black text-slate-800">एडमिन लगइन</h1>
            <p className="mt-1 text-sm text-slate-500">व्यवस्थापनका लागि आफ्नो विवरण प्रविष्ट गर्नुहोस्</p>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-600">इमेल</span>
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="a@gmail.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"/>
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-600">पासवर्ड</span>
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"/>
            </div>
          </label>
          {err && <p className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-brand-700">{err}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 py-3 font-bold text-white shadow-lg shadow-blue-600/25 transition hover:opacity-95 disabled:opacity-60">
            {busy ? "लगइन हुँदैछ..." : "लगइन गर्नुहोस्"}
          </button>
        </form>

        <div className="border-t border-slate-100 px-6 py-3">
          <p className="text-center text-xs font-bold text-slate-400">
            <Users size={12} className="mr-1 inline" />
            <Link to="/admin/forgot" className="text-slate-500 underline hover:text-brand-700">
              पासवर्ड बिर्सनुभयो?
            </Link>{" "}
            <span className="mx-1 text-slate-300">·</span>{" "}
            <Link to="/superadmin/login" className="text-slate-600 underline hover:text-brand-700">
              सुपर एडमिन?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}