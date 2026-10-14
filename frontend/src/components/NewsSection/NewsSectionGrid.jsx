import React from "react";
import { motion } from "framer-motion";
import NewsCard from "../NewsCard/NewsCard";
import LoadMore from "../Common/LoadMore";
import usePagedNews from "../../hooks/usePagedNews";
import { thumbSrcSet } from "../../services/api";

const gridV = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
/* स्क्रोल गर्दा "ग्याप" नदेखिने गरी — transform (y) दिइँदैन,
   opacity मात्र। y दिने कारण कार्ड animate हुँदा आफ्नै ठाउँबाट
   सारिन्छ र खाली जग्गा देखिन्थ्यो। */
const cardV = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

/**
 * एउटा श्रेणीको समाचार खण्ड — ग्रिड (३/३ वा ४/४) वा सूची, दुवै आधुनिक।
 * नयाँ समाचार माथि, तल स्क्रोल गर्दा-गर्दा थपिन्छ।
 */
export default function NewsSection({
  title,
  path,
  items = [],
  pageSize = 9,
  skip = 0,
  view = "grid3"          // "list" | "grid3" | "grid4"
}) {
  if (!items.length) return null;

  return (
    <GridBody
      title={title}
      path={path}
      items={items}
      pageSize={pageSize}
      skip={skip}
      view={view}
    />
  );
}

function GridBody({ title, path, items, pageSize, skip, view }) {
  const { visible, done, loadMore } = usePagedNews(items, pageSize, skip);

  const gridClass =
    view === "grid4"
      ? "grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : view === "grid3"
      ? "grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-4";

  return (
    <section className="mt-11 first:mt-0">
      {/* शीर्षक (दायाँतिर "सबै हेर्नुहोस्") */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-slate-800 sm:text-[26px]">{title}</h2>

        {path && (
          <a
            href={path}
            className="group inline-flex items-center gap-1.5 border-b-2 border-brand-600 pb-0.5 text-sm font-black text-brand-600 transition hover:gap-2.5 hover:text-brand-700"
          >
            सबै हेर्नुहोस्
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        )}
      </div>

      {view === "list" ? (
        /* ---------------- सूची ढाँचा ---------------- */
        <motion.div
          variants={gridV}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0 }}
          className="grid gap-4"
        >
          {visible.map((n) => (
            <motion.article key={n.id} variants={cardV}>
              <a href={`/article/${n.id}`} className="nrow group">
                <span className="nrow-media">
                  <img
                    src={n.image}
                    srcSet={thumbSrcSet(n.image)}
                    sizes="(max-width: 640px) 110px, 200px"
                    alt={n.title}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="nrow-body">
                  <b className="nrow-title line-clamp-2">{n.title}</b>
                  {n.summary && <p className="nrow-sum line-clamp-2">{n.summary}</p>}
                  <small className="nrow-meta">
                    <span className="nrow-cat">{n.category}</span>
                    <span>{n.date}</span>
                  </small>
                </span>
              </a>
            </motion.article>
          ))}
        </motion.div>
      ) : (
        /* ---------------- ग्रिड ढाँचा ---------------- */
        <motion.div
          variants={gridV}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0 }}
          className={gridClass}
        >
          {visible.map((n) => (
            <motion.div key={n.id} variants={cardV} className="h-full">
              <NewsCard news={n} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <LoadMore loadMore={loadMore} done={done} />
    </section>
  );
}
