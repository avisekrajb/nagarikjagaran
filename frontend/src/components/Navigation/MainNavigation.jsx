import React, { useState, useEffect, useRef } from "react";
import { Search, X, Sun, Moon, LayoutGrid, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { categories, getAllNews } from "../../services/newsService";
import NavigationItem from "./NavigationItem";
import { useUI } from "../../context/UIContext";
import { useSite } from "../../context/SiteContext";
import { useSiteConfig } from "../../context/SiteConfigContext";
import { absoluteUrl } from "../../services/api";

const items = [
  { name: "गृहपृष्ठ", path: "/" },
  ...categories,
  { name: "पात्रो", path: "/patro" },
  { name: "युनिकोड", path: "/unicodeconverter" }
];

export default function MainNavigation({ showLogo = false }) {
  const { theme, toggleTheme } = useUI();
  const { site } = useSite();
  const cfg = useSiteConfig();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState([]);
  const box = useRef(null);
  const nav = useNavigate();
  const miniNavColor = site.mini_navbar_color || "#1e3a8a";

  /* सुपर एडमिनले न्युबार बटन बदलेको छ भने त्यहीअनुसार देखाउने */
  const navItems = Array.isArray(cfg.nav_buttons) && cfg.nav_buttons.length
    ? cfg.nav_buttons
        .filter((i) => i && i.path && Number(i.enabled ?? 1) === 1)
        .map((i) => ({ name: i.label, path: i.path }))
    : items;

  /* सुपर एडमिनले थपेका बटन (मूल सूचीमा नभएका) — यी ड्रपडाउनमा देखिन्छन् */
  const basePaths = items.map((i) => i.path);
  const extraItems = navItems.filter((i) => !basePaths.includes(i.path));

  useEffect(() => {
    const h = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    let on = true;
    getAllNews().then((n) => { if (on) setAll(n); }).catch(() => {});
    return () => { on = false; };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const sugs = all
    .filter((n) => !q || n.title.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 5);

  return (
    <>
      {/* पृष्ठभूमिको रङ CSS ले --mini-nav बाट बनाउँछ (hover सहित) */}
      <nav className="mini-nav" style={{ "--mini-nav": miniNavColor }}>
        <div className="container-shell flex h-[54px] items-center gap-3">
          {/* गोलाकार सेतो लोगो — माथिल्लो हेडर लुकिएपछि मात्र देखिन्छ,
              अनि दुईवटै लोगो एकैपटक देखिएर अल्मल्याउँछ। */}
          {showLogo && (
            <>
              <Link to="/" title="नागरिक" aria-label="नागरिक गृहपृष्ठ" className="mini-nav-logo">
                {site.logo ? <img src={absoluteUrl(site.logo)} alt="नागरिक" /> : <span>न</span>}
              </Link>
              <span className="h-6 w-px flex-none bg-white/30" aria-hidden="true" />
            </>
          )}

          {/* मध्य : स्क्रोल हुने मेनु */}
          <div className="mini-nav-scroll flex-1">
            {navItems.map((i) => <NavigationItem key={i.path} item={i} />)}
          </div>

          {/* दायाँ : खोज, सम्पर्क, थिम */}
          <div className="relative z-10 flex flex-none items-center gap-2">
            {/* सुपर एडमिनले थपेका बटनको ड्रपडाउन */}
            {extraItems.length > 0 && (
              <div className="group relative hidden lg:block">
                <button
                  type="button"
                  className="flex h-8 items-center gap-1.5 rounded-full border border-white/40 px-3 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  <LayoutGrid size={13} /> थप <ChevronDown size={12} />
                </button>
                <div className="invisible absolute right-0 top-9 w-52 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                  <div className="border border-slate-200 bg-white p-1.5 text-slate-800">
                    {extraItems.map((i) => (
                      <Link
                        key={i.path}
                        to={i.path}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-brand-700"
                      >
                        <LayoutGrid size={11} className="flex-none text-slate-300" />
                        <span className="truncate">{i.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <form ref={box} onSubmit={submit} className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setOpen(true)}
                placeholder="खोज्नुहोस्..."
                className="h-8 w-36 rounded-full border border-white/40 bg-white/15 pl-4 pr-8 text-xs font-semibold text-white outline-none transition placeholder:text-white/70 focus:border-white focus:bg-white focus:text-slate-800 lg:w-48"
              />
              {q ? (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-1 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-white/70 hover:bg-white/20"
                >
                  <X size={12} />
                </button>
              ) : (
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
                  <Search size={14} />
                </button>
              )}
              {open && (
                <div className="absolute left-1/2 top-10 z-50 w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-soft">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {q ? "नतिजाहरू" : "ट्रेन्डिङ"}
                  </p>
                  {sugs.map((n) => (
                    <Link
                      key={n.id}
                      to={`/article/${n.id}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-bold hover:bg-slate-50"
                    >
                      {n.title}
                    </Link>
                  ))}
                  {q && !sugs.length && (
                    <p className="px-3 py-2 text-sm text-slate-400">कुनै परिणाम फेला परेन</p>
                  )}
                  <p className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">श्रेणी</p>
                  <div className="grid grid-cols-2 gap-1 pb-1">
                    {categories.map((c) => (
                      <Link
                        key={c.path}
                        to={c.path}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                      >
                        {c.label || c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {cfg.show_dark_mode !== false && (
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === "dark" ? "हल्का थिम" : "गाढा थिम"}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/40 text-white transition hover:border-white hover:bg-white/20"
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={14} />}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
