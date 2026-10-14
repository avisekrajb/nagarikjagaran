import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  adToBs,
  bsMonthCells,
  bsMonthDays,
  BS_MONTHS,
  BS_WEEKDAYS
} from "../../utils/formatDate";

const DEV = "०१२३४५६७८९";
const dev = (n) => String(n).replace(/[0-9]/g, (d) => DEV[+d]);

/**
 * साइडबारको मिनी पात्रो — आजको विक्रम महिना, आज निलो।
 * नेटवर्कमा नपुगी आफ्नै मिति गणना प्रयोग गर्छ, र दिन बदलिँदा आफैँ अपडेट हुन्छ।
 */
export default function MiniCalendar() {
  /* दिन बदलिएको थाहा पाउन "आज" को signature निचि */
  const [now, setNow] = useState(() => new Date());
  const [view, setView] = useState(() => {
    const bs = adToBs(new Date());
    return bs ? { y: bs.year, m: bs.month } : { y: 2083, m: 4 };
  });

  /* मिनेट-मिनेट जाँच — आज नै बदलिएमा नयाँ महिनामा जान्छ (स्वतः अपडेट) */
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setNow((prev) => {
        if (prev.toDateString() !== d.toDateString()) {
          const bs = adToBs(d);
          if (bs) setView({ y: bs.year, m: bs.month });
          return d;
        }
        return prev;
      });
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const cells = useMemo(() => bsMonthCells(view.y, view.m), [view.y, view.m]);
  const todayBs = useMemo(() => adToBs(now), [now]);
  const total = bsMonthDays(view.y, view.m);
  const isThisMonth =
    todayBs && todayBs.year === view.y && todayBs.month === view.m;
  const todayWeekday = now.getDay();

  /* महिनाको १ नै आइतबार होइन भने अगाडि खाली ठाउँ चाहिन्छ —
     नत्र सबै दिन एक दिन अगाडि चलेर शनिबार मङ्गलबारमा देखिन्छ। */
  const leading = cells.length ? cells[0].weekday : 0;

  const move = (delta) => {
    let m = view.m + delta;
    let y = view.y;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    if (y < 1970 || y > 2090) return;
    setView({ y, m });
  };

  return (
    <div className="side-box cal overflow-hidden p-0">
      {/* शीर्षक — रंग ३ सेकेन्डमा बदलिन्छ */}
      <div className="cal-cycle flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-base font-black leading-tight">
            {BS_MONTHS[view.m]} {dev(view.y)}
          </h3>
          <p className="text-[11px] font-bold opacity-80">
            {total} दिन · {isThisMonth ? "यही महिना" : "अन्य महिना"}
          </p>
        </div>
        <div className="flex flex-none gap-1">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="अघिल्लो महिना"
            className="cal-head-btn"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => {
              const bs = adToBs(new Date());
              if (bs) setView({ y: bs.year, m: bs.month });
            }}
            className="cal-head-btn !text-[10px]"
          >
            आज
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="अर्को महिना"
            className="cal-head-btn"
          >
            ›
          </button>
        </div>
      </div>

      {/* हप्ताका दिन — शनिबार मात्र बिदा */}
      <div className="cal-week">
        {BS_WEEKDAYS.map((w, i) => (
          <span key={w} className={i === 6 ? "sat" : ""}>
            {w.slice(0, 1)}
          </span>
        ))}
      </div>

      {/* दिनहरू */}
      <div className="cal-grid">
        {Array.from({ length: leading }).map((_, i) => (
          <span key={`lead${i}`} aria-hidden="true" />
        ))}

        {cells.map((c) => {
          const isToday = isThisMonth && c.bsDay === todayBs.day;
          const isSat = c.isSaturday;
          return (
            <span
              key={c.bsDay}
              title={`${dev(c.bsDay)} ${BS_MONTHS[view.m]} ${dev(view.y)} — ${c.weekdayName}, ${dev(c.adDay)}/${dev(c.adMonth)}/${dev(c.adYear)}`}
              className={`cal-day${isToday ? " is-today" : isSat ? " is-sat" : ""}`}
            >
              {dev(c.bsDay)}
            </span>
          );
        })}
        {Array.from({ length: (7 - ((leading + cells.length) % 7)) % 7 }).map((_, i) => (
          <span key={`p${i}`} aria-hidden="true" />
        ))}
      </div>

      {/* सङ्केत */}
      <div className="cal-legend">
        <span><i className="cal-chip sat" /> शनिबारको बिदा</span>
        <span><i className="cal-chip today" /> आज</span>
      </div>

      <div className="cal-foot">
        <p>
          आज — {BS_WEEKDAYS[todayWeekday]},{" "}
          <b>{todayBs ? `${dev(todayBs.day)} ${BS_MONTHS[todayBs.month]} ${dev(todayBs.year)}` : "—"}</b>
        </p>
        <Link to="/patro" className="cal-go">पूरा पात्रो हेर्नुहोस्</Link>
      </div>
    </div>
  );
}