import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Droplets, PanelsTopLeft, Menu as MenuIcon, Wrench,
  Vote, Trophy, ScrollText, Globe2, Megaphone, Users, ShieldCheck,
  LogOut, Menu, X, Lock, ArrowUpRight
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import AdminWatermark from "../components/AdminWatermark";
import AdminFooter from "../components/AdminFooter";
import AdminAccounts from "../components/AdminAccounts";
import { SectionNavbar } from "./sections/SectionNavbar";
import { SectionMaintenance, SectionFeatures } from "./sections/NavAndSettings";
import { SectionPolls, SectionScoreboard } from "./sections/PollsAndScores";
import { SectionAdPositions, SectionLogs } from "./sections/AdsAndLogs";
import SectionChanges from "./sections/SectionChanges";

/* ------------------------------------------------------------------
   सुपर एडमिन ड्यासबोर्ड — छुट्टै, आधुनिक UI.
   यहाँबाट सबै खण्ड छन्, तर **सबै छैनन्** — जुन कुरा regular एडमिनलाई
   चाहिँदैन (watermark, footer, navbar, maintenance, polls, scoreboard,
   logs, IP, splash ads) ती यहीं मात्र छन्।
   ------------------------------------------------------------------ */

const hasToken = () => !!localStorage.getItem("nagarik_admin_token");

/** सुपर एडमिन मात्रका खण्ड */
const TABS = [
  { key: "overview", label: "सारांश", Icon: LayoutDashboard, always: true },
  { key: "watermark", label: "Watermark", Icon: Droplets },
  { key: "footer", label: "फुटर", Icon: PanelsTopLeft },
  { key: "navbar", label: "न्युबार बटन", Icon: MenuIcon, Comp: SectionNavbar },
  { key: "maintenance", label: "मर्मत मोड", Icon: Wrench, Comp: SectionMaintenance },
  { key: "features", label: "फिचर टगल", Icon: Globe2, Comp: SectionFeatures },
  { key: "polls", label: "पोल", Icon: Vote, Comp: SectionPolls },
  { key: "scoreboard", label: "स्कोरबोर्ड", Icon: Trophy, Comp: SectionScoreboard },
  { key: "ads", label: "विज्ञापन स्थान", Icon: Megaphone, Comp: SectionAdPositions },
  { key: "logs", label: "लग + IP", Icon: ScrollText, Comp: SectionLogs },
  { key: "changes", label: "परिवर्तन अनुरोध", Icon: ShieldCheck, Comp: SectionChanges },
  { key: "accounts", label: "खाता", Icon: Users },
];

/* ---------------- आधुनिक overview ---------------- */
const Card = ({ label, value, hint, tone = "slate" }) => {
  const tones = {
    slate: "from-slate-700 to-slate-900",
    blue: "from-blue-600 to-indigo-600",
    green: "from-emerald-600 to-teal-600",
    rose: "from-rose-600 to-pink-600",
  };
  return (
    <div className={`bg-gradient-to-br ${tones[tone] || tones.slate} p-5 text-white`}>
      <p className="text-[11px] font-black uppercase tracking-[.14em] opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-black leading-none">{value ?? "—"}</p>
      {hint && <p className="mt-1.5 text-xs font-bold opacity-85">{hint}</p>}
    </div>
  );
};

export default function SuperAdminDashboard() {
  const nav = useNavigate();
  const loc = useLocation();
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState(() =>
    (loc.pathname.split("/").filter(Boolean)[1] || "overview")
  );
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTab(loc.pathname.split("/").filter(Boolean)[1] || "overview");
  }, [loc.pathname]);

  useEffect(() => {
    if (!hasToken()) return;
    adminApi.me().then(setMe).catch(() => {});
    /* उत्तर { range, stats:{...}, visitors, series } — हामीलाई stats चाहिन्छ */
    adminApi.dashboard().then((r) => setStats(r?.stats || null)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  if (!hasToken()) return <Navigate to="/admin/login" replace />;

  /* एडमिन (super होइन) यहाबाट भित्र छिर्दैन */
  if (me && me.role !== "superadmin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const go = (k) => {
    setTab(k);
    setOpen(false);
    nav(k === "overview" ? "/superadmin" : `/superadmin/${k}`, { replace: true });
  };

  const logout = () => {
    try { localStorage.removeItem("nagarik_admin_token"); } catch (e) {}
    nav("/admin/login", { replace: true });
  };

  const refresh = async () => {
    setBusy(true);
    try {
      adminApi.me().then(setMe).catch(() => {});
      adminApi.dashboard().then((r) => setStats(r?.stats || null)).catch(() => {});
      setMsg("ताजाँकृतिको डाटा ल्याइयो");
    } finally { setTimeout(() => setBusy(false), 400); }
  };

  const current = TABS.find((t) => t.key === tab) || TABS[0];

  const SideBody = (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-11 w-11 place-items-center bg-gradient-to-br from-slate-800 to-slate-950 text-xl font-black text-white">
          स
        </span>
        <div className="min-w-0">
          <b className="block truncate leading-5 text-slate-900">{me?.name || "Super Admin"}</b>
          <small className="text-[11px] font-bold text-slate-400">सुपर एडमिन · लक</small>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => go(key)}
            className={`group flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-bold transition ${
              tab === key
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon size={16} className="flex-none" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-xs text-slate-400">{me?.email}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-rose-500 hover:text-white"
        >
          <LogOut size={15} /> लगआउट
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* डेस्कटप साइडबार — गाढा, आधुनिक */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white sm:flex">
        {SideBody}
      </aside>

      {/* मोबाइल ड्रअर */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-slate-950/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center bg-slate-100 text-slate-600"
            >
              <X size={18} />
            </button>
            {SideBody}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col sm:ml-64">
        {/* टपबार */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="मेनु"
              className="grid h-9 w-9 flex-none place-items-center border border-slate-200 text-slate-600 sm:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">
                सुपर एडमिन
              </p>
              <h1 className="truncate text-lg font-black text-slate-900">
                {current.label}
              </h1>
            </div>
          </div>

          <div className="flex flex-none items-center gap-2">
            <span className="hidden items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 sm:inline-flex">
              <Lock size={11} /> लक खाता
            </span>
            <button
              onClick={refresh}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-900 hover:text-white disabled:opacity-60"
            >
              ⟳ <span className="hidden sm:inline">{busy ? "…" : "रिफ्रेस"}</span>
            </button>
          </div>
        </header>

        {msg && (
          <div className="fixed right-4 top-4 z-50 max-w-[90vw] bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl">
            {msg}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">
          {/* ---------------- OVERVIEW ---------------- */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white sm:p-8">
                <p className="text-[11px] font-black uppercase tracking-[.16em] text-white/50">
                  सुपर एडमिन ड्यासबोर्ड
                </p>
                <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
                  नमस्कार, {me?.name || "Super Admin"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  यहाँबाट साइट चलाउने, सुरक्षा गर्ने र नयाँ सुविधा थप्ने सबै काम हुन्छ।
                  तपाईंको खाता लक छ — अरूले यो ड्यासबोर्ड खोल्न सक्दैन।
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card label="कुल समाचार" value={stats?.news} tone="blue"
                  hint={`प्रकाशित ${stats?.newsPublished ?? "—"}`} />
                <Card label="कुल दृश्य" value={stats?.totalViews} tone="slate"
                  hint={`समाचार ${stats?.newsViews ?? 0} · विज्ञापन ${stats?.adViews ?? 0}`} />
                <Card label="कुल क्लिक" value={stats?.totalClicks} tone="green"
                  hint={`समाचार ${stats?.newsClicks ?? 0} · विज्ञापन ${stats?.adClicks ?? 0}`} />
                <Card label="कुल विज्ञापन" value={stats?.ads} tone="rose"
                  hint={`सक्रिय ${stats?.adsActive ?? "—"}`} />
              </div>

              {/* सुपर एडमिन मात्रका खण्ड */}
              <section className="bg-white p-5 sm:p-6">
                <h3 className="text-base font-black text-slate-900">
                  सुपर एडमिनका खण्डहरू
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  यी खण्ड regular एडमिनलाई देखिन्दैनन्।
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {TABS.filter((t) => t.key !== "overview").map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      onClick={() => go(key)}
                      className="group flex items-center gap-3 border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-lg"
                    >
                      <span className="grid h-10 w-10 flex-none place-items-center bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-sm font-black text-slate-800">{label}</b>
                        <small className="text-[11px] font-bold text-slate-400">तयार छ</small>
                      </span>
                      <ArrowUpRight size={15} className="flex-none text-slate-300 transition group-hover:text-slate-900" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ---------------- काम गर्ने खण्डहरू ---------------- */}
          {tab === "watermark" && <AdminWatermark setMsg={setMsg} />}
          {tab === "footer" && <AdminFooter setMsg={setMsg} />}
          {tab === "accounts" && <AdminAccounts setMsg={setMsg} me={me} />}

          {/* ---------------- नयाँ खण्ड (v2) ---------------- */}
          {tab === "navbar" && <SectionNavbar />}
          {tab === "maintenance" && <SectionMaintenance />}
          {tab === "features" && <SectionFeatures />}
          {tab === "polls" && <SectionPolls />}
          {tab === "scoreboard" && <SectionScoreboard />}
          {tab === "ads" && <SectionAdPositions />}
          {tab === "logs" && <SectionLogs />}
          {tab === "changes" && <SectionChanges />}
        </main>
      </div>
    </div>
  );
}
