import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllNews, categories } from "../../services/newsService";
import SidebarAd from "./SidebarAd";
import FramerSidebar from "./FramerSidebar";
import MiniCalendar from "./MiniCalendar";

const dev = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[+d]);

export default function ExploreSidebar({ news = [], accent = {}, showCategories = true }) {
  const [all, setAll] = useState([]);
  useEffect(() => {
    getAllNews().then((n) => setAll(n));
  }, []);
  const items = news.length ? news : all;
  const picks = items.slice(0, 5);
  const accentText = accent.text || "text-brand-600";
  const accentSoft = accent.soft || "bg-blue-50";

  return (
    <aside className="space-y-5">
      <FramerSidebar>
        <div className="space-y-5">
          {showCategories && (
            <div className="side-box">
              <h3>श्रेणी पत्ता लगाउनुहोस्</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c.path} to={c.path}
                    className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${c.path === "/news" ? "bg-black text-white" : `border-slate-200 ${accentSoft} ${accentText} hover:opacity-80`}`}>
                    {c.label || c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="side-box">
            <h3>पाठकहरूले रोजेका</h3>
            <div className="divide-y divide-slate-100">
              {picks.map((n, i) => (
                <Link key={n.id} to={`/article/${n.id}`} className="group flex items-start gap-3 py-3">
                  <span className={`grid h-7 w-7 flex-none place-items-center rounded-full text-xs font-black ${accentSoft} ${accentText}`}>{dev(i + 1)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-5 transition group-hover:text-brand-600">{n.title}</p>
                    <small className="text-slate-400">{n.author}</small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="side-box">
            <h3>हाम्रो दृष्टिकोण</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              समाचार मात्र होइन, हरेक घटनाको पृष्ठभूमि र विश्लेषण पस्किने प्रतिबद्धतासहित नागरिक जागरण हरेक दिन आगनमा पुग्छ।
            </p>
<Link to="/opinion" className={`mt-3 inline-flex rounded-full ${accentSoft} ${accentText} px-4 py-2 text-xs font-black transition hover:opacity-80`}>
              विचार पेज
            </Link>
          </div>
          {/* मिनी साइडबारको अन्त्यमा पात्रो */}
          <MiniCalendar />
        </div>
      </FramerSidebar>
      <SidebarAd />
    </aside>
  );
}