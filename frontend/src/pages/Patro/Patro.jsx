import React, { useEffect, useMemo, useState } from "react";
import {
  adToBs, bsToAd, bsMonthCells, bsMonthDays, toIsoDate,
  BS_MONTHS, BS_MONTHS_EN, BS_WEEKDAYS
} from "../../utils/formatDate";
import { getPatro } from "../../services/newsService";
import MiniSidebar from "../../components/Sidebar/MiniSidebar";
import Loading from "../../components/Common/Loading";

const WEEK_SHORT = ["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"];
const pad = (n) => String(n).padStart(2, "0");
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const daysBetween = (a, b) =>
  Math.round((startOfDay(b) - startOfDay(a)) / 86400000);

export default function Patro() {
  const [data, setData] = useState(null);
  const [cursor, setCursor] = useState(() => {
    const bs = adToBs(new Date()) || { year: 2082, month: 0 };
    return { year: bs.year, month: bs.month };
  });
  const [today] = useState(() => new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let off = false;
    getPatro().then((d) => { if (!off) setData(d); }).catch(() => {}).finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, []);

  const settings = data?.settings || { sunday_holiday: true, saturday_holiday: true };
  const holidays = useMemo(() => data?.holidays || [], [data]);

  // बिदा/पर्व विक्रम मिति (वर्ष, महिना, दिन) बाट — AD मिलाउनुपर्दैन,
  // किनभने विक्रम गणनाको प्राधिकृतिक तालिका यहि�� छ।
  const holidayKey = (y, m, d) => `${y}-${m}-${d}`;

  const cells = useMemo(
    () => bsMonthCells(cursor.year, cursor.month),
    [cursor]
  );

  const todayIso = toIsoDate(today);

  // हप्ताको पहिलो खाली ठाउँ (रवितार = 0)
  const leading = cells.length ? cells[0].weekday : 0;

  // अहिले देखाइरहेको महिनाका बिदा मात्र
  const byDay = useMemo(() => {
    const m = new Map();
    holidays.forEach((h) => {
      if (Number(h.bs_year) !== Number(cursor.year)) return;
      if (Number(h.bs_month) !== Number(cursor.month)) return;
      const k = holidayKey(cursor.year, cursor.month, h.bs_day);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(h);
    });
    return m;
  }, [holidays, cursor]);

  const monthHolidays = useMemo(
    () => cells
      .map((c) => {
        const list = byDay.get(holidayKey(cursor.year, cursor.month, c.bsDay)) || [];
        return { ...c, list };
      })
      .filter((c) => c.list.length > 0),
    [cells, byDay, cursor]
  );

  /** आगामी १२ वटा बिदा — पर्व भए त्यसै, नभए शनिबार */
  const upcoming = useMemo(() => {
    const bsToday = adToBs(today);
    if (!bsToday) return [];

    // १) सक्रिय पर्वहरू — विक्रम क्रमअनुसार, आजपछिका मात्र
    const sorted = holidays
      .slice()
      .sort((a, b) => bsKey(a) - bsKey(b));

    const out = [];
    sorted.forEach((h) => {
      if (out.length >= 12) return;
      const ad = bsToAd(Number(h.bs_year), Number(h.bs_month), Number(h.bs_day));
      if (!ad) return;
      const diff = daysBetween(today, ad);
      if (diff < 0) return; // बितिसक्यो
      out.push({
        key: `h-${h.id}`,
        title: h.title,
        date: ad,
        bs: bsLabel(Number(h.bs_year), Number(h.bs_month), Number(h.bs_day)),
        kind: "festival"
      });
    });

    // २) बाँकी भइ शनिबार (साप्ताहिक बिदा) भरिपूर्ण
    if (out.length < 12) {
      const cursorDate = new Date(today);
      let guard = 0;
      while (out.length < 12 && guard < 400) {
        if (cursorDate.getDay() === 6) {
          const b = adToBs(cursorDate);
          out.push({
            key: `s-${toIsoDate(cursorDate)}`,
            title: "साप्ताहिक बिदा",
            date: new Date(cursorDate),
            bs: b ? bsLabel(b.year, b.month, b.day) : "",
            kind: "weekly"
          });
        }
        cursorDate.setDate(cursorDate.getDate() + 1);
        guard += 1;
      }
    }
  return out.slice(0, 12);
  }, [holidays, today]);

  /** साइडबारका लागि — पर्व/बिदा मात्र (साप्ताहिक शनिबार होइन) */
  const festivalOnly = useMemo(
    () => upcoming.filter((u) => u.kind === "festival").slice(0, 20),
    [upcoming]
  );

  const step = (delta) => {
    setCursor((c) => {
      let m = c.month + delta;
      let y = c.year;
      while (m < 0) { m += 12; y -= 1; }
      while (m > 11) { m -= 12; y += 1; }
      return { year: y, month: m };
    });
  };

  const goToday = () => {
    const bs = adToBs(today) || { year: 2082, month: 0 };
    setCursor({ year: bs.year, month: bs.month });
  };

  if (loading) return <Loading />;

  const bsToday = adToBs(today) || { year: 2082, month: 0, day: 1 };
  const t = data?.today || {};
  const daysInMonth = bsMonthDays(cursor.year, cursor.month);

  const legend = [
    { label: "आज", cls: "bg-patro-red text-white" },
    settings.sunday_holiday ? { label: "आइतबारको बिदा", cls: "bg-red-100 text-patro-red" } : null,
    settings.saturday_holiday ? { label: "शनिबारको बिदा", cls: "bg-rose-50 text-rose-700" } : null
  ].filter(Boolean);

  return (
    <main className="patro-page">
      {/* ---------------- शीर्षक ---------------- */}
      <section className="patro-head">
        <div className="container-shell">
          <div className="flex flex-wrap items-end justify-between gap-5 py-7">
            <div className="min-w-0">
              <h1 className="patro-h1">पात्रो</h1>
              <p className="patro-sub mt-2">
                विक्रम सम्वत् र ई.सं. दुवैमा बिदा, पर्व र तिथि।
              </p>
            </div>

            <div className="patro-now">
              <div>
                <span className="patro-now-label">आजको मिति</span>
                <strong className="patro-now-value">
                  वि.सं. {dev(bsToday.year)} {BS_MONTHS[bsToday.month]} {dev(bsToday.day)}
                </strong>
              </div>
              <span className="patro-now-sep" />
              <div>
                <span className="patro-now-label">ई.सं.</span>
                <strong className="patro-now-value">
                  {dev(today.getFullYear())}/{dev(today.getMonth() + 1)}/{dev(today.getDate())}
                </strong>
              </div>
              <span className="patro-now-sep" />
              <div>
                <span className="patro-now-label">बार</span>
                <strong className="patro-now-value">{BS_WEEKDAYS[today.getDay()]}</strong>
              </div>
            </div>
          </div>

          {(t.tithi || t.nakshatra || t.sunrise || t.festival) && (
            <div className="pb-5">
              <div className="flex flex-wrap gap-2">
                {t.tithi && <span className="patro-chip">तिथि — {t.tithi}</span>}
                {t.nakshatra && <span className="patro-chip">नक्षत्र — {t.nakshatra}</span>}
                {t.sunrise && <span className="patro-chip">सूर्योदय — {t.sunrise}</span>}
                {t.sunset && <span className="patro-chip">सूर्यास्त — {t.sunset}</span>}
                {t.paksha && <span className="patro-chip">पक्ष — {t.paksha}</span>}
                {t.festival && <span className="patro-chip is-festival">{t.festival}</span>}
              </div>
              <p className="mt-2.5 text-[11px] font-bold text-white/50">
                स्रोत — {data?.source === "hamropatro" ? "हाम्रो पात्रो API" : "नागरिक डाटाबेस"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- क्यालेन्डर (बायाँ) + साइडबार (दायाँ) ---------------- */}
      <div className="container-shell py-8">
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ===== क्यालेन्डर ===== */}
          <section className="patro-card">
            {/* महिना सिर */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-patro-red px-5 py-4">
              <div>
                <h2 className="patro-month">
                  {BS_MONTHS[cursor.month]}
                  <span className="patro-month-en">
                    {BS_MONTHS_EN[cursor.month]} {dev(cursor.year)}
                  </span>
                </h2>
                <p className="patro-month-sub">
                  {dev(daysInMonth)} दिन · ई.सं. {isoRange(cells)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => step(-1)} className="patro-nav" aria-label="अघिल्लो महिना">‹</button>
                <button type="button" onClick={goToday} className="patro-nav is-today">आज</button>
                <button type="button" onClick={() => step(1)} className="patro-nav" aria-label="पछिल्लो महिना">›</button>
              </div>
            </div>

            {/* हप्ता नाम */}
            <div className="patro-week">
              {WEEK_SHORT.map((w, i) => {
                const weekend = (settings.sunday_holiday && i === 0) || (settings.saturday_holiday && i === 6);
                return (
                  <span key={w} className={`patro-week-cell ${weekend ? "is-off" : ""}`}>
                    {w}
                  </span>
                );
              })}
            </div>

            {/* दिनहरू */}
            <div className="patro-grid">
              {Array.from({ length: leading }).map((_, i) => (
                <span key={`pad${i}`} className="patro-cell is-empty" />
              ))}

              {cells.map((c) => {
                const iso = toIsoDate(c.ad);
                const list = byDay.get(holidayKey(cursor.year, cursor.month, c.bsDay)) || [];
                const isToday = iso === todayIso;
                const off = (settings.sunday_holiday && c.isSunday) ||
                            (settings.saturday_holiday && c.isSaturday);

                // पर्व भएको दिनमा लाल पृष्ठभूमि हालिँदैन — मात्र मिति देखिन्छ,
                // hover गर्दा मात्र पर्व/बिदाको नाम देखिन्छ।
                let cls = "patro-cell";
                if (off) cls += " is-off";
                if (isToday) cls += " is-today";

                return (
                  <div
                    key={c.bsDay}
                    className={cls}
                    tabIndex={list.length ? 0 : -1}
                    aria-label={
                      list.length
                        ? `${c.bsDay} — ${list.map((h) => h.title).join(", ")}`
                        : undefined
                    }
                  >
                    <span className="patro-bs">{dev(c.bsDay)}</span>
                    <span className="patro-ad">{dev(c.adDay)}</span>

                    {list.length > 0 && (
                      <span className="patro-tip" role="tooltip">
                        {list.map((h, k) => (
                          <i key={k}>{h.title}</i>
                        ))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* संकेत */}
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">संकेत</span>
              {legend.map((l) => (
                <span key={l.label} className={`patro-key ${l.cls}`}>{l.label}</span>
              ))}
              <span className="ml-auto text-[11px] font-bold text-slate-400">
                माथिल्लो अंक = विक्रम मिति · तल्लो अंक = ई.सं. · पर्व छुने दिनमा mouse राख्नुहोस्
              </span>
            </div>
          </section>

          {/* ===== दायाँ स्तम्भ : आगामी बिदा तथा पर्व मात्र ===== */}
          <aside className="min-w-0 lg:sticky lg:top-24">
            <section className="side-box">
              <h3>आगामी बिदा तथा पर्व</h3>

              <p className="mt-1.5 text-xs font-bold text-slate-400">
                {festivalOnly.length} वटा बाँकी
              </p>

              {festivalOnly.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center">
                  <p className="text-sm font-black text-slate-500">आगामी कुनै पर्व छैन</p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    एडमिनले हाम्रो पात्रोबाट पर्व ल्याउन सक्छन्
                  </p>
                </div>
              ) : (
                <ul className="mt-3 max-h-[34rem] space-y-2 overflow-y-auto pr-1">
                  {festivalOnly.map((u) => (
                    <li key={u.key} className="patro-up-row">
                      <span className="patro-up-row-day">{dev(u.date.getDate())}</span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-sm font-black text-slate-800">
                          {u.title}
                        </b>
                        <small className="text-[11px] font-bold text-slate-400">{u.bs}</small>
                      </span>
                      <span className="patro-days-left">{leftLabel(u.date, today)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </aside>
        </div>

        {/* ================= आगामी १२ (४ × ४) ================= */}
        <section className="mt-12">
          <div className="patro-strip">
            <h2 className="patro-strip-title">आगामी बिदा</h2>
            <span className="patro-strip-note">बाँकी {upcoming.length} वटा</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {upcoming.map((u) => {
              const left = daysBetween(today, u.date);
              return (
                <article
                  key={u.key}
                  className={`patro-up ${u.kind === "festival" ? "is-festival" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="patro-up-kind">
                      {u.kind === "festival" ? "बिदा" : "साप्ताहिक"}
                    </span>
                    <span className="patro-up-left">{leftLabel(u.date, today)}</span>
                  </div>
                  <h3 className="patro-up-title">{u.title}</h3>
                  <p className="patro-up-bs">{u.bs}</p>
                  <p className="patro-up-ad">
                    ई.सं. {dev(u.date.getFullYear())}/{dev(u.date.getMonth() + 1)}/{dev(u.date.getDate())}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------------- सहायक ---------------- */

const dev = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[+d]);

/** विक्रम मितिलाई क्रम दिने संख्या (तुलनाका लागि) */
const bsKey = (h) =>
  Number(h.bs_year) * 100000 + (Number(h.bs_month) + 1) * 1000 + Number(h.bs_day || 0);

const bsLabel = (y, m, d) =>
  `वि.सं. ${dev(y)} ${BS_MONTHS[m]} ${dev(d)}`;

const isoRange = (cells) => {
  if (!cells.length) return "";
  const a = cells[0].ad;
  const b = cells[cells.length - 1].ad;
  const f = (d) => `${dev(d.getFullYear())}/${dev(d.getMonth() + 1)}/${dev(d.getDate())}`;
  return a.getFullYear() === b.getFullYear()
    ? `${f(a)} – ${dev(b.getMonth() + 1)}/${dev(b.getDate())}`
    : `${f(a)} – ${f(b)}`;
};

const leftLabel = (date, today) => {
  const d = daysBetween(today, date);
  if (d <= 0) return "आजै";
  if (d === 1) return "१ दिन पछि";
  return `${dev(d)} दिन पछि`;
};
