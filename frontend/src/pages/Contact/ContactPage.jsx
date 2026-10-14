import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Type, CalendarRange } from "lucide-react";

import SectionHeader from "../../components/NewsSection/SectionHeader";
import ContactPanel from "../../components/Common/ContactPanel";
import NewsCard from "../../components/NewsCard/NewsCard";
import ReelsSection from "../../components/Reels/ReelsSection";
import MiniCalendar from "../../components/Sidebar/MiniCalendar";
import { newestFirst } from "../../utils/sortNews";
import { getAllNews } from "../../services/newsService";

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

/* Unicode converter को नमुना (static — यहाँ लाइभ conversion छैन) */
const SAMPLE_FROM = "nepal ko khabar ramro cha";
const SAMPLE_TO = "नेपालको खबर राम्रो छ";

export default function ContactPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    let on = true;
    getAllNews()
      .then((rows) => { if (on) setNews(newestFirst(rows || [])); })
      .catch(() => {});
    return () => { on = false; };
  }, []);

  const latest = useMemo(() => news.slice(0, 6), [news]);

  return (
    <main className="container-shell py-7">
      <motion.section variants={rise} className="mb-8">
        <SectionHeader title="सम्पर्क" />
        <p className="mt-1 text-sm font-bold text-slate-500">
          सुझाव, प्रतिक्रिया वा समाचारसम्बन्धी जानकारी हामीसँग साझा गर्नुहोस् — तपाईंको सन्देश सीधा हाम्रो डेस्कमा पुग्छ।
        </p>
      </motion.section>

      <motion.section variants={rise}>
        <ContactPanel />
      </motion.section>

      {/* ---------------- तल : ताजा समाचार ---------------- */}
      {latest.length > 0 && (
        <motion.section variants={rise} className="mt-14">
          <SectionHeader title="ताजा समाचार" link="सबै हेर्नुहोस्" linkTo="/news" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
        </motion.section>
      )}

      {/* ---------------- तल : रील्स ---------------- */}
      <ReelsSection />

      {/* ---------------- तल : पात्रो + टेक्स्ट कन्वर्टर ---------------- */}
      <motion.section variants={rise} className="mt-14">
        <SectionHeader title="औजार" />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Unicode converter — सानो */}
          <Link
            to="/unicodeconverter"
            className="group block border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-soft"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-800">
                <span className="grid h-9 w-9 place-items-center bg-brand-50 text-brand-600">
                  <Type size={17} />
                </span>
                टेक्स्ट कन्वर्टर
              </h3>
              <ArrowRight size={17} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              आफ्नो किबोर्डको अङ्रेजी टाइपलाई सजिलै नेपाली युनिकोडमा बदल्नुहोस्।
            </p>

            {/* नमुना : साँचो रूपान्तरण */}
            <div className="mt-4 border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-bold text-slate-500">{SAMPLE_FROM}</span>
                <ArrowRight size={13} className="flex-none text-slate-400" />
                <span className="font-black text-slate-900">{SAMPLE_TO}</span>
              </div>
            </div>
          </Link>

          {/* पात्रो — सानो */}
          <div>
            <MiniCalendar />
            <Link
              to="/patro"
              className="mt-4 flex items-center justify-between gap-2 border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-soft"
            >
              <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                <span className="grid h-8 w-8 place-items-center bg-brand-50 text-brand-600">
                  <CalendarRange size={16} />
                </span>
                पूरा पात्रो
              </span>
              <ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
