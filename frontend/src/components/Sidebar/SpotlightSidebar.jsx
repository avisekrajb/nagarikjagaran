import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Quote } from "lucide-react";
import { getAllNews } from "../../services/newsService";
import CompactNewsCard from "../NewsCard/CompactNewsCard";
import SidebarAd from "./SidebarAd";
import FramerSidebar from "./FramerSidebar";
import MiniCalendar from "./MiniCalendar";

const dev = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[+d]);

export default function SpotlightSidebar({ news = [], accent = {} }) {
  const [popular, setPopular] = useState([]);
  useEffect(() => {
    getAllNews().then((n) => setPopular(n));
  }, []);
  const items = news.length ? news.slice(0, 5) : popular.slice(0, 5);
  const recent = popular.slice(0, 4);
  const accentText = accent.text || "text-brand-600";
  const quoteGrad = accent.quote || "from-blue-700 to-sky-600";

  return (
    <aside className="space-y-5">
      <SidebarAd />
      <FramerSidebar>
        <div className="space-y-5">
          <div className="side-box">
            <h3>अहिले चर्चामा</h3>
            <div className="divide-y divide-slate-100">
              {items.map((n, i) => (
                <Link key={n.id} to={`/article/${n.id}`} className="group flex gap-4 py-3">
                  <span className={`select-none text-3xl font-black leading-none ${accentText} opacity-25`}>{dev(i + 1)}</span>
                  <div className="min-w-0">
                    <p className="font-bold leading-5 transition group-hover:text-brand-600">{n.title}</p>
                    <small className="text-slate-400">{n.date}</small>
                  </div>
                </Link>
              ))}
            </div>
            <div className={`mt-4 rounded-2xl bg-gradient-to-br ${quoteGrad} p-4 text-white shadow-lg`}>
              <Quote size={18} className="opacity-60" />
              <p className="mt-1 text-sm font-black leading-snug">&ldquo;{items[0] ? items[0].summary.slice(0, 110) : ""}&rdquo;</p>
              <span className="mt-2 block text-[11px] font-bold text-white/80">नागरिक डेस्क</span>
            </div>
          </div>
          <div className="side-box">
            <h3>भर्खरै थपिएका</h3>
            {recent.map((n, i) => <CompactNewsCard key={n.id} news={n} index={i} />)}
          </div>
          <MiniCalendar />
        </div>
      </FramerSidebar>
    </aside>
  );
}