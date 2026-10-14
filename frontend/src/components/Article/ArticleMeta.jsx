import React from "react";
import { Link } from "react-router-dom";
import { User, Clock, CalendarDays, Plus, Minus } from "lucide-react";

// मिति मा समय (time) हटाउने — मोबाइलमा "मिति मात्र"
const dateOnly = (value = "") => {
  const s = String(value).trim();
  if (!s) return "";
  // "२०८२/०५/१२, १०:३०" जस्तो भए पछाडिको समय हटाउने
  return s.split(/[,|]|\s+(?:at|समय)\s+/i)[0].trim() || s;
};

export default function ArticleMeta({ article, fontSize = 19, setFontSize }) {
  const photo = article.author_photo;
  const set = setFontSize || (() => {});
  const published = dateOnly(article.date);

  return (
    <div className="article-meta mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-slate-100 py-3 sm:py-4">
      {/* लेखक, मिति (मिति मात्र), पढ्ने समय */}
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-2.5">
        <Link
          to={`/author/${encodeURIComponent(article.author)}`}
          className="article-meta-chip max-w-full transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50"
        >
          {photo ? (
            <img src={photo} alt={article.author} className="h-7 w-7 flex-none rounded-full object-cover" />
          ) : (
            <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-white">
              <User size={14} />
            </span>
          )}
          <b className="truncate text-slate-800">{article.author}</b>
        </Link>

        {published && (
          <span className="article-meta-chip">
            <CalendarDays size={14} className="flex-none text-slate-400" />
            <span className="whitespace-nowrap">{published}</span>
          </span>
        )}

        <span className="article-meta-chip">
          <Clock size={14} className="flex-none text-slate-400" />
          <span className="whitespace-nowrap">{article.readingTime}</span>
        </span>
      </div>

      {/* पाठको आकार : मोबाइलमा सानो +/- आइकन मात्र */}
      <div className="flex flex-none items-center gap-1.5">
        <span className="mr-1 hidden text-[11px] font-black uppercase tracking-wider text-slate-400 sm:inline">
          पाठको आकार
        </span>
        <button
          type="button"
          onClick={() => set((s) => Math.max(15, s - 1))}
          title="सानो"
          aria-label="पाठ सानो गर्नुहोस्"
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:bg-blue-50 hover:text-brand-600 sm:h-9 sm:w-9"
        >
          <Minus size={15} />
        </button>

        {/* नम्बर मोबाइलमा लुकाउँछ — सिर्फ आइकन देखिन्छ */}
        <span className="hidden h-9 min-w-[48px] place-items-center rounded-full bg-blue-50 px-2 text-xs font-black text-brand-600 sm:grid">
          {fontSize}
        </span>

        <button
          type="button"
          onClick={() => set((s) => Math.min(26, s + 1))}
          title="ठूलो"
          aria-label="पाठ ठूलो गर्नुहोस्"
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:bg-blue-50 hover:text-brand-600 sm:h-9 sm:w-9"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
