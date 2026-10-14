import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Newspaper, Megaphone, Film, ImagePlus, Users, MessageSquare,
  ShieldCheck, LogOut, RefreshCw,
  Menu, Lock, EyeOff
} from "lucide-react";
import { adminApi } from "../../services/adminApi";
import AdminSidebarBtn from "./AdminSidebarBtn";
import AdminOverview from "./components/AdminOverview";
import AdminAccounts from "./components/AdminAccounts";
import AdminNews from "./components/AdminNews";
import AdminAds from "./components/AdminAds";
import AdminReels from "./components/AdminReels";
import AdminHeaderPhoto from "./components/AdminHeaderPhoto";
import AdminTeam from "./components/AdminTeam";
import AdminSubscribers from "./components/AdminSubscribers";
import AdminComments from "./components/AdminComments";
import AdminMessages from "./components/AdminMessages";

const hasToken = () => !!localStorage.getItem("nagarik_admin_token");

/** /admin/news  ->  "news"   ·   /admin  वा /admin/dashboard  ->  "dashboard" */
const TAB_KEYS = [
  "dashboard", "news", "ads", "reels", "header-photo", "team",
  "messages", "comments", "subscribers", "accounts",
];
const tabFromPath = (pathname = "") => {
  /* /admin/news  र  /superadmin/news  दुवै -> "news" */
  const seg = String(pathname).split("/").filter(Boolean)[1] || "dashboard";
  return TAB_KEYS.includes(seg) ? seg : "dashboard";
};

export default function AdminDashboard() {
  const nav = useNavigate();
  const loc = useLocation();
  /* tab अब URL बाटै — /admin?tab=x होइन */
  const [tab, setTab] = useState(() => tabFromPath(loc.pathname));
  const [sideOpen, setSideOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [fresh, setFresh] = useState(0);
  const [intent, setIntent] = useState("");
  const [me, setMe] = useState({ name: "", email: "", is_active: 1 });

  /* ब्राउजर back/forward ले पनि tab बदल्ने */
  useEffect(() => {
    setTab(tabFromPath(loc.pathname));
  }, [loc.pathname]);

  /* चाँडो काम (नयाँ समाचार आदि) — पुरानो ?tab= लिंक पनि चल्न दिन्छ */
  useEffect(() => {
    const p = new URLSearchParams(loc.search);
    const t = p.get("tab");
    if (t && TAB_KEYS.includes(t)) setTab(t);
  }, [loc.search]);

  useEffect(() => {
    if (!hasToken()) return;
    adminApi.me()
      .then((d) => setMe(d || { name: "", email: "", is_active: 1 }))
      .catch(() => {});
  }, [fresh]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!hasToken()) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;

  /* /superadmin/... भएको होइन भने /admin/... मा ठेलाउँछौ */
  const seg = loc.pathname.split("/").filter(Boolean);
  const isSuperPath = seg[0] === "superadmin";
  const base = isSuperPath ? "/superadmin" : "/admin";
  const seg1 = seg[1] || "dashboard";

  /* एउटै canonical URL — /admin वा /superadmin → .../dashboard */
  if (!seg1 || seg1 === "") {
    return <Navigate to={`${base}/dashboard`} replace />;
  }
  /* नचिनिएको खण्ड (जस्तै /admin/foo) → ड्यासबोर्ड */
  if (!TAB_KEYS.includes(seg1)) {
    return <Navigate to={`${base}/dashboard`} replace />;
  }

  const email = me.email || "";
  const inactive = Number(me.is_active) === 0;

  const logout = () => {
    try { localStorage.removeItem("nagarik_admin_token"); } catch (e) {}
    nav("/admin/login", { replace: true });
  };

  /* सबै खण्ड वास्तविक route मा — /admin/watermark आदि */
  const go = (k, want = "") => {
    setTab(k);
    setIntent(want || "");
    setSideOpen(false);
    nav(k === "dashboard" ? `${base}/dashboard` : `${base}/${k}`, { replace: true });
  };

  const menu = [
    { key: "dashboard", label: "ड्यासबोर्ड", icon: LayoutDashboard },
    { key: "news", label: "समाचार व्यवस्थापन", icon: Newspaper },
    { key: "ads", label: "विज्ञापन व्यवस्थापन", icon: Megaphone },
    { key: "reels", label: "रील व्यवस्थापन", icon: Film },
    { key: "header-photo", label: "हेडर फोटो", icon: ImagePlus },
    { key: "team", label: "हाम्रो टिम", icon: Users },
    { key: "messages", label: "सम्पर्क सन्देश", icon: MessageSquare },
    { key: "comments", label: "टिप्पणी व्यवस्थापन", icon: MessageSquare },
    { key: "subscribers", label: "सब्सक्राइबरहरू", icon: Users },
    { key: "accounts", label: "एडमिन खाता", icon: ShieldCheck },
  ];

  /* Watermark / फुटर / पात्रो अब सुपर एडमिन ड्यासबोर्डमा मात्र छन् */
  const visibleMenu = menu;

  const SidebarBody = ({ onPick }) => (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/40">
          न
        </span>
        <div className="min-w-0">
          <b className="block truncate leading-5 text-slate-800">नागरिक NEWS</b>
          <small className="text-slate-400">एडमिन प्यानल</small>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {visibleMenu.map(({ key, label, icon: Icon }) => (
          <AdminSidebarBtn key={key} label={label} icon={Icon} active={tab === key} onClick={() => onPick(key)} />
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p className="flex items-center gap-1.5 truncate text-xs text-slate-400">
          <Lock size={11} className="flex-none" />
          <span className="truncate">{email}</span>
        </p>
        {inactive && (
          <p className="mt-1.5 rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">
            निष्क्रिय खाता — हेर्न मात्र मिल्छ
          </p>
        )}
        <button
          onClick={logout}
          className="mt-2 flex w-full items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-blue-600 hover:text-white"
        >
          <LogOut size={16} /> लगआउट
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* डेस्कटप साइडबार — fixed, त्यसैले content स्क्रोल गर्दा पनि सधैं ठाउँमै */}
      <aside className="fixed inset-y-0 left-0 z-[100] hidden w-64 flex-col overflow-hidden border-r border-slate-200 bg-white sm:flex">
        {/* साइडबारको माथि ३०% मा रङ बदलिरहने "ग्यास" */}
        <span className="admin-gases" aria-hidden="true" />
        <SidebarBody onPick={go} />
      </aside>

      {/* मोबाइल ड्रअर */}
      {sideOpen && (
        <div className="fixed inset-0 z-[92] sm:hidden">
          <div className="absolute inset-0 bg-slate-950/60" onClick={() => setSideOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-2xl">
            <SidebarBody onPick={go} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col sm:ml-64">
        <header className="sticky top-0 z-[90] flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSideOpen(true)}
              aria-label="मेनु"
              className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-slate-200 text-slate-600 sm:hidden"
            >
              <Menu size={18} />
            </button>
            <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-blue-600 text-lg font-black text-white sm:hidden">
              न
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black text-slate-800 sm:text-lg">
                {visibleMenu.find((m) => m.key === tab)?.label || (isSuper ? "सुपर एडमिन" : "नागरिक एडमिन")}
              </h1>
              <p className="hidden truncate text-[11px] font-bold text-slate-400 sm:block">{email}</p>
            </div>
          </div>
          <div className="flex flex-none items-center gap-2">
            {inactive && (
              <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700 sm:hidden">
                <EyeOff size={11} /> निष्क्रिय
              </span>
            )}
            <button
              onClick={() => setFresh((x) => x + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-blue-100"
            >
              <RefreshCw size={15} /> <span className="hidden sm:inline">रिफ्रेस</span>
            </button>
          </div>
        </header>

        {msg && (
          <div className="fixed right-4 top-4 z-[95] max-w-[90vw] rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl sm:right-5 sm:top-5">
            {msg}
          </div>
        )}

        <main className="flex-1 p-3 sm:p-6">
          {/* निष्क्रिय एडमिन — सबै कुरा blur हुन्छ */}
          <div className={inactive ? "admin-blurred relative" : "relative"}>
            {tab === "dashboard" && <AdminOverview setMsg={setMsg} onNavigate={go} />}
            {tab === "accounts" && <AdminAccounts setMsg={setMsg} me={me} />}
            {tab === "news" && <AdminNews key={`news-${intent}`} setMsg={setMsg} startOpen={intent === "newNews"} />}
            {tab === "ads" && <AdminAds key={`ads-${intent}`} setMsg={setMsg} startOpen={intent === "newAd"} />}
            {tab === "reels" && <AdminReels key={`reels-${intent}`} setMsg={setMsg} startOpen={intent === "newReel"} />}
            {tab === "header-photo" && <AdminHeaderPhoto setMsg={setMsg} />}
            {tab === "team" && <AdminTeam setMsg={setMsg} />}
            {tab === "messages" && <AdminMessages setMsg={setMsg} />}
            {tab === "comments" && <AdminComments setMsg={setMsg} />}
            {tab === "subscribers" && <AdminSubscribers setMsg={setMsg} />}

          </div>

          {inactive && (
            <div className="fixed inset-0 z-[94] grid place-items-center p-4">
              <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white/95 p-6 text-center shadow-2xl backdrop-blur">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                  <EyeOff size={26} />
                </span>
                <h3 className="mt-4 text-lg font-black text-slate-800">तपाईं निष्क्रिय हुनुहुन्छ</h3>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  तपाईंको एडमिन खाता असक्रिय भएको छ। तपाईंले ड्यासबोर्ड हेर्न सक्नुहुन्छ,
                  तर सम्पादन गर्न मिल्दैन। कृपया प्रमुख एडमिनलाई सम्पर्क गर्नुहोस्।
                </p>
                <p className="mt-3 truncate text-xs font-black text-slate-400">{email}</p>
                <button
                  onClick={logout}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  <LogOut size={15} /> लगआउट
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}