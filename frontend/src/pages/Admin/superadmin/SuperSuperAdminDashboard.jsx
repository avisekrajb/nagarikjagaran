import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Crown, Users, KeyRound, ScrollText, LogOut, Menu, X,
  Lock, ShieldCheck, LayoutDashboard, PanelsTopLeft, Droplets,
  Menu as MenuIcon, Wrench, Globe2, Vote, Trophy, Megaphone, ArrowUpRight
} from "lucide-react";
import { adminApi, superSuperApi } from "../../../services/adminApi";
import AdminWatermark from "../components/AdminWatermark";
import AdminFooter from "../components/AdminFooter";
import { SectionNavbar } from "./sections/SectionNavbar";
import { SectionMaintenance, SectionFeatures } from "./sections/NavAndSettings";
import { SectionPolls, SectionScoreboard } from "./sections/PollsAndScores";
import { SectionAdPositions, SectionLogs } from "./sections/AdsAndLogs";
import SectionChanges from "./sections/SectionChanges";

/**
 * ==========================================================
 *  सुपर-सुपर एडमिन — /super/superadmin
 *  • सुपर एडमिनका सबै खण्ड हेर्न सक्छ
 *  • एडमिन खण्ड पनि हेर्न सक्छ
 *  • तर बदल्न केही पनि पाउँदैन — **पासवर्ड मात्र**
 * ========================================================== */

const hasToken = () => !!localStorage.getItem("nagarik_admin_token");

/** हेर्न मात्र — कुनै बटनले केही बद्दैन */
const ReadOnly = ({ children }) => (
  <div className="relative">
    {children}
    <div className="pointer-events-none absolute inset-0 z-10" />
    <p className="mt-3 border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-bold text-amber-700">
      हेर्न मात्र — सुपर-सुपर एडमिनले यहाँ केही बदल्न पाउँदैन।
    </p>
  </div>
);

const TABS = [
  { key: "passwords", label: "पासवर्ड व्यवस्थापन", Icon: KeyRound },
  { key: "accounts", label: "सबै खाता", Icon: Users },
  { key: "changes", label: "परिवर्तन अनुरोध", Icon: ScrollText },
  { key: "overview", label: "सुपर · सारांश", Icon: LayoutDashboard, ro: true },
  { key: "watermark", label: "सुपर · Watermark", Icon: Droplets, ro: true },
  { key: "footer", label: "सुपर · फुटर", Icon: PanelsTopLeft, ro: true },
  { key: "navbar", label: "सुपर · न्युबार", Icon: MenuIcon, ro: true },
  { key: "maintenance", label: "सुपर · मर्मत", Icon: Wrench, ro: true },
  { key: "features", label: "सुपर · फिचर", Icon: Globe2, ro: true },
  { key: "polls", label: "सुपर · पोल", Icon: Vote, ro: true },
  { key: "scoreboard", label: "सुपर · स्कोरबोर्ड", Icon: Trophy, ro: true },
  { key: "ads", label: "सुपर · विज्ञापन", Icon: Megaphone, ro: true },
  { key: "logs", label: "सुपर · लग + IP", Icon: ScrollText, ro: true },
];

/* ---------------- पासवर्ड व्यवस्थापन ---------------- */
const PasswordManager = ({ me }) => {
  const [rows, setRows] = useState(null);
  const [target, setTarget] = useState(null);   // खाता
  const [prev, setPrev] = useState("");
  const [np, setNp] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => superSuperApi.listAdmins().then(setRows).catch((e) => setMsg({ k: "err", t: e.message }));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const r = await superSuperApi.changePassword(target.id, prev, np);
      setMsg({ k: "ok", t: r.message });
      setTarget(null); setPrev(""); setNp("");
    } catch (ex) {
      setMsg({ k: "err", t: ex.message });
    } finally { setBusy(false); }
  };

  if (!rows) return <p className="py-8 text-center text-sm font-bold text-slate-400">लोड हुँदैछ…</p>;

  const tone = (r) =>
    r.role === "supersuper" ? "bg-amber-50 text-amber-700"
      : r.role === "superadmin" ? "bg-rose-50 text-rose-700"
        : "bg-slate-100 text-slate-600";

  return (
    <div className="space-y-5">
      {msg && (
        <p className={`border px-4 py-3 text-sm font-bold ${msg.k === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {msg.t}
        </p>
      )}

      <section className="border border-amber-500/30 bg-white p-5">
        <h3 className="flex items-center gap-2 text-base font-black text-slate-900">
          <KeyRound size={17} className="text-amber-600" /> पासवर्ड बदल्नुहोस्
        </h3>
        <p className="mt-1 text-xs font-bold text-slate-400">
          खाताको **पुरानो पासवर्ड** अनिवार्य। त्यसपछि मालिकको इमेलमा ४ अङ्कको OTP जान्छ —
          सही OTP ले मात्र पासवर्ड बदलिन्छ।
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-slate-200">
              <tr>
                {["खाता", "भूमिका", "कार्य"].map((h, i) => (
                  <th key={h} className={`px-3 py-2 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 ${i === 2 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <b className="block text-sm font-black text-slate-800">{a.name}</b>
                    <small className="text-[11px] font-bold text-slate-400">{a.email}</small>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 text-[11px] font-black ${tone(a)}`}>{a.role}</span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => { setTarget(a); setMsg(null); }}
                      className="bg-amber-500 px-3 py-1.5 text-xs font-black text-neutral-950 transition hover:bg-amber-400"
                    >
                      पासवर्ड बदल्नुहोस्
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="w-full max-w-sm bg-white shadow-2xl">
            <div className="flex items-center gap-3 bg-neutral-950 px-5 py-4 text-white">
              <Lock size={17} className="text-amber-400" />
              <b className="text-sm">{target.name} — पासवर्ड</b>
              <button type="button" onClick={() => setTarget(null)} className="ml-auto text-neutral-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 p-5">
              <p className="bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
                {target.email} — पुरानो पासवर्ड नमिलेमा केही हुँदैन।
              </p>
              <label className="block">
                <span className="mb-1 block text-xs font-black text-slate-600">पुरानो पासवर्ड (अनिवार्य)</span>
                <input type="password" required value={prev} onChange={(e) => setPrev(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-black text-slate-600">नयाँ पासवर्ड</span>
                <input type="password" required minLength={6} value={np} onChange={(e) => setNp(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900" />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setTarget(null)}
                  className="border border-slate-300 px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50">रद्द</button>
                <button type="submit" disabled={busy}
                  className="bg-neutral-950 px-4 py-2 text-sm font-black text-white hover:bg-neutral-800 disabled:opacity-50">
                  {busy ? "पठाउँदै…" : "अनुरोध पठाउनुहोस्"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* ---------------- सबै खाता (हेर्ने मात्र) ---------------- */
const AccountList = () => {
  const [rows, setRows] = useState(null);
  useEffect(() => { superSuperApi.listAdmins().then(setRows).catch(() => setRows([])); }, []);
  if (!rows) return <p className="py-8 text-center text-sm font-bold text-slate-400">लोड हुँदैछ…</p>;

  return (
    <section className="border border-slate-200 bg-white p-5">
      <h3 className="text-base font-black text-slate-900">सबै खाता</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead className="border-b border-slate-200">
            <tr>{["#", "नाम", "इमेल", "भूमिका", "स्थिति"].map((h) => (
              <th key={h} className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="px-3 py-3 text-xs font-black text-slate-400">{a.id}</td>
                <td className="px-3 py-3 text-sm font-black text-slate-800">{a.name}</td>
                <td className="px-3 py-3 text-xs font-bold text-slate-500">{a.email}</td>
                <td className="px-3 py-3"><span className="bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">{a.role}</span></td>
                <td className="px-3 py-3 text-xs font-bold text-slate-500">{a.is_active ? "सक्रिय" : "निष्क्रिय"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

/* ---------------- सम्पूर्ण ड्यासबोर्ड ---------------- */
export default function SuperSuperAdminDashboard() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("passwords");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasToken()) return nav("/super/superadmin/login", { replace: true });
    adminApi.me()
      .then((u) => {
        if (u.role !== "supersuper") return nav("/super/superadmin/login", { replace: true });
        setMe(u);
      })
      .catch(() => nav("/super/superadmin/login", { replace: true }));
  }, [nav]);

  const logout = () => {
    localStorage.removeItem("nagarik_admin_token");
    nav("/super/superadmin/login", { replace: true });
  };

  if (!me) return null;
  const cur = TABS.find((t) => t.key === tab) || TABS[0];

  const Nav = ({ mobile }) => (
    <nav className={`space-y-1 ${mobile ? "p-3" : "flex-1 overflow-y-auto px-3 pb-3"}`}>
      {TABS.map(({ key, label, Icon, ro }) => (
        <button key={key} onClick={() => { setTab(key); if (mobile) setOpen(false); }}
          className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-bold transition ${
            tab === key ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"
          }`}>
          <Icon size={15} className="flex-none" />
          <span className="truncate">{label}</span>
          {ro && <span className={`ml-auto text-[9px] font-black uppercase ${tab === key ? "text-amber-400" : "text-neutral-300"}`}>हेर्ने</span>}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* साइडबार */}
        <aside className="hidden w-72 flex-none border-r border-neutral-200 bg-white lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
            <span className="grid h-10 w-10 place-items-center bg-amber-500 text-neutral-950"><Crown size={19} /></span>
            <div className="min-w-0">
              <b className="block truncate text-sm font-black text-neutral-900">सुपर-सुपर</b>
              <small className="text-[10px] font-black uppercase tracking-[.18em] text-amber-600">Level 3</small>
            </div>
          </div>
          <Nav />
          <div className="border-t border-neutral-200 p-4">
            <p className="truncate text-xs text-neutral-400">{me.email}</p>
            <button onClick={logout} className="mt-3 flex w-full items-center gap-2 bg-neutral-100 px-4 py-2.5 text-sm font-bold text-neutral-700 transition hover:bg-rose-500 hover:text-white">
              <LogOut size={15} /> लगआउट
            </button>
          </div>
        </aside>

        {/* मोबाइल ड्रअ */}
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white">
              <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                <b className="text-sm font-black">सुपर-सुपर</b>
                <button onClick={() => setOpen(false)}><X size={18} /></button>
              </div>
              <Nav mobile />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* हेड */}
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
            <button className="lg:hidden" onClick={() => setOpen(true)}><Menu size={20} /></button>
            <h1 className="flex items-center gap-2 text-sm font-black text-neutral-900">
              <cur.Icon size={16} className="text-amber-600" /> {cur.label}
            </h1>
            <span className="ml-auto hidden bg-amber-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 sm:inline">
              पासवर्ड मात्र बदल्न सकिन्छ
            </span>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            {tab === "passwords" && <PasswordManager me={me} />}
            {tab === "accounts" && <AccountList />}
            {tab === "changes" && <SectionChanges />}

            {cur.ro && (
              <ReadOnly>
                {tab === "watermark" && <AdminWatermark setMsg={() => {}} />}
                {tab === "footer" && <AdminFooter setMsg={() => {}} />}
                {tab === "navbar" && <SectionNavbar />}
                {tab === "maintenance" && <SectionMaintenance />}
                {tab === "features" && <SectionFeatures />}
                {tab === "polls" && <SectionPolls />}
                {tab === "scoreboard" && <SectionScoreboard />}
                {tab === "ads" && <SectionAdPositions />}
                {tab === "logs" && <SectionLogs />}
                {tab === "overview" && (
                  <section className="border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-black text-slate-900">सुपर एडमिन · सारांश</h3>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      यो खण्ड हेर्न मात्र हो।
                    </p>
                  </section>
                )}
              </ReadOnly>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
