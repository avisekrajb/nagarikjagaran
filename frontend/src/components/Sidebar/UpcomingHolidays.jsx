import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatro } from "../../services/newsService";
import { adToBs, bsToAd, BS_MONTHS } from "../../utils/formatDate";

const DEV = "०१२३४५६७८९";
const dev = (n) => String(n).replace(/[0-9]/g, (d) => DEV[+d]);

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / 86400000);

/**
 * मिनी साइडबारको "आगामी बिदा तथा पर्व" — पात्रो डाटाबेसबाट।
 *
 * कडा नियम : **बिगतका मात्र होइन, अगाडिका ३ विक्रम महिनाभित्रका मात्र।**
 * आजपछि भएको मात्र (left >= 0) — बितिसका कहिल्यै देखिँदैन।
 */
export default function UpcomingHolidays({ limit = 6, monthsAhead = 3 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let on = true;
    getPatro()
      .then((d) => {
        if (!on) return;
        const holidays = d?.holidays || [];
        const today = new Date();
        const bsToday = adToBs(today);
        if (!bsToday) return;

        /* अन्तिम महिना = आजको महिना + monthsAhead (वर्ष सीमा पार गर्दै) */
        let lastYear = bsToday.year;
        let lastMonth = bsToday.month + monthsAhead;
        while (lastMonth > 11) { lastMonth -= 12; lastYear += 1; }
        const limitKey =
          lastYear * 100000 + (lastMonth + 1) * 1000 + 99;

        /* विक्रम क्रमअनुसार मिलाएर छान्छौँ */
        const key = (h) =>
          Number(h.bs_year) * 100000 +
          (Number(h.bs_month) + 1) * 1000 +
          Number(h.bs_day || 0);

        const upcoming = holidays
          .slice()
          .sort((a, b) => key(a) - key(b))
          .filter((h) => key(h) <= limitKey)          /* अगाडि ३ महिना सम्म */
          .map((h) => {
            const ad = bsToAd(Number(h.bs_year), Number(h.bs_month), Number(h.bs_day));
            return ad ? { h, ad, left: daysBetween(today, ad) } : null;
          })
          .filter((x) => x && x.left > 0)           /* आजभन्दा पछि मात्र */
          .slice(0, limit);

        setItems(upcoming);
      })
      .catch(() => {});
    return () => { on = false; };
  }, [limit, monthsAhead]);

  return (
    <section className="side-box">
      <h3>आगामी बिदा तथा पर्व</h3>

      {!items.length ? (
        <p className="py-5 text-center text-xs font-bold text-slate-400">
          अगाडिको ३ महिनामा कुनै पर्व छैन।
        </p>
      ) : (
        <ul className="sp-list">
          {items.map(({ h, ad, left }) => (
            <li key={h.id}>
              <span className="sp-day">
                <b>{dev(ad.getDate())}</b>
                <small>{BS_MONTHS[adToBs(ad)?.month]?.slice(0, 3) || ""}</small>
              </span>
              <Link to={`/article/${h.news_id || ""}`} className="sp-body group" onClick={(e) => {
                if (!h.news_id) e.preventDefault();
              }}>
                <b className="sp-title group-hover:text-brand-600">{h.title}</b>
                <small className="sp-bs">
                  वि.सं. {dev(h.bs_year)} {BS_MONTHS[Number(h.bs_month)]} {dev(h.bs_day)}
                </small>
              </Link>
              <span className="sp-left">{dev(left)} दिन</span>
            </li>
          ))}
        </ul>
      )}

      <Link to="/patro" className="sp-go">पूरा पात्रो हेर्नुहोस्</Link>
    </section>
  );
}
