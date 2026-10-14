import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { publicApi } from "../services/adminApi";

/**
 * स्कोरबोर्ड — खेलकुद पेजमा दायाँतिर टाँसिने बक्स।
 * सुपर एडमिनले स्कोर अपडेट गर्दा यहाँ तुरुन्त देखिन्छ।
 */
const ScoreboardFloat = () => {
  const [rows, setRows] = useState([]);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    const pull = () =>
      publicApi.scores().then((r) => alive && setRows(r)).catch(() => {});
    pull();
    const id = setInterval(pull, 30000);      // ३० सेकेन्डमा नयाँ
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const shown = rows.filter((r) => r.show_float);
  if (!shown.length) return null;
  if (!pathname.startsWith("/sports")) return null;

  return (
    <div className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
      <div className="space-y-3 p-2">
        {shown.map((r) => {
          const live = r.status === "live";
          const lead = r.home_score > r.away_score ? r.home_team : r.away_score > r.home_score ? r.away_team : null;
          return (
            <button
              key={r.id}
              onClick={() => navigate("/sports")}
              className="block w-[168px] border border-slate-200 bg-white shadow-lg transition hover:border-slate-900"
            >
              <span className={`block px-2 py-1 text-[9px] font-black uppercase tracking-wider ${live ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                {r.match_label}
                {live && " ● लाइभ"}
              </span>
              <span className="block px-2 py-2">
                <span className="flex items-center justify-between gap-2 py-0.5">
                  <span className={`truncate text-[11px] font-black ${lead === r.home_team ? "text-slate-900" : "text-slate-500"}`}>{r.home_team}</span>
                  <span className="shrink-0 bg-slate-900 px-1.5 text-[11px] font-black text-white">{r.home_score}</span>
                </span>
                <span className="flex items-center justify-between gap-2 py-0.5">
                  <span className={`truncate text-[11px] font-black ${lead === r.away_team ? "text-slate-900" : "text-slate-500"}`}>{r.away_team}</span>
                  <span className="shrink-0 bg-slate-900 px-1.5 text-[11px] font-black text-white">{r.away_score}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreboardFloat;
