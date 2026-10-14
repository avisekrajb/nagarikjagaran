import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { getAllNews } from "../../services/newsService";
import NewsCard from "../../components/NewsCard/NewsCard";
import SectionHeader from "../../components/NewsSection/SectionHeader";
import Loading from "../../components/Common/Loading";

const rise = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const cascade = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const viewOnce = { once: true, amount: 0.15 };

export default function AuthorPage() {
  const { author } = useParams();
  const decoded = decodeURIComponent(author || "");
  const [list, setList] = useState(null);

  useEffect(() => {
    getAllNews().then((n) => setList(n.filter((x) => x.author === decoded)));
  }, [decoded]);

  const items = list || [];
  if (!list) return <Loading />;

  const [first, ...rest] = items;

  return (
    <main className="container-shell py-7">
      <motion.div variants={rise}  className="mb-6">
        <SectionHeader title={decoded} />
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500"><PenLine size={14} className="text-brand-600" /> नागरिक जागरणका लागि लेखिएका {decoded}का सबै समाचार र लेखहरू यहाँ एकै ठाउँमा।</p>
      </motion.div>

      {items.length ? (
        <>
          {first && (
            <motion.div variants={rise}  className="mt-8">
              <Link to={`/article/${first.id}`} className="group grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="overflow-hidden">
                  <img src={first.image} alt={first.title} className="h-60 w-full object-cover transition duration-500 group-hover:scale-105 md:h-full" />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <h2 className="text-2xl font-black leading-9 text-slate-900 transition group-hover:text-brand-700">{first.title}</h2>
                  <p className="mt-3 line-clamp-3 leading-7 text-slate-500">{first.summary}</p>
                  <small className="mt-4 text-xs font-black text-slate-400">{first.date} · {first.readingTime}</small>
                </div>
              </Link>
            </motion.div>
          )}
          <motion.div variants={cascade}  className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((n) => (
              <motion.div key={n.id} variants={rise}>
                <NewsCard news={n} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={rise}  className="mt-10">
            <h3 className="mb-4 text-lg font-black text-slate-800">पूर्ण सूची — सबै लेख</h3>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
              {items.map((n, i) => (
                <Link key={n.id} to={`/article/${n.id}`} className={`group flex items-center gap-4 px-5 py-4 transition hover:bg-brand-50/60 ${i !== items.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <span className="select-none text-xl font-black text-brand-100 transition group-hover:text-brand-600">{String(i + 1).padStart(2, "0")}</span>
                  <img src={n.image} alt={n.title} className="h-12 w-20 flex-none rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-1 font-extrabold text-slate-800 transition group-hover:text-brand-700">{n.title}</h4>
                    <small className="text-xs font-bold text-slate-400">{n.date}</small>
                  </div>
                  <span className="hidden text-xs font-black text-brand-600 sm:block">पढ्नुहोस् →</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center text-sm font-bold text-slate-400">{decoded} का लेखहरू फेला परेनन्।</div>
      )}
    </main>
  );
}