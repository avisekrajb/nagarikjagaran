import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FeaturedNewsCard from "../NewsCard/FeaturedNewsCard";
import NewsCard from "../NewsCard/NewsCard";
import SpotlightSidebar from "../Sidebar/SpotlightSidebar";
import ExploreSidebar from "../Sidebar/ExploreSidebar";
import LoadMore from "../Common/LoadMore";
import EmptyState from "../Common/EmptyState";
import usePagedNews from "../../hooks/usePagedNews";
import { thumbSrcSet } from "../../services/api";

const rise = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };
const dev = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[+d]);

const HEAD = ({ title, description, showBanner, accent }) =>
  showBanner ? (
    <header className={`relative overflow-hidden rounded-0 bg-gradient-to-br ${accent.grad} p-8 text-white shadow-xl`}>
      <h1 className="mt-3 text-4xl font-black sm:text-5xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-white/85">{description}</p>
    </header>
  ) : (
    <header className="flex flex-col items-start justify-between gap-4 border-b-2 border-slate-900 pb-6 sm:flex-row sm:items-end">
      <div>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-slate-500">{description}</p>
      </div>
    </header>
  );

export default function CategoryShowcase({
  title,
  description,
  accent = { grad: "from-blue-700 via-blue-600 to-sky-500", solid: "bg-blue-600", text: "text-brand-600", soft: "bg-blue-50", quote: "from-blue-700 to-sky-600" },
  variant = "featured",
  news = [],
  showBanner = true
}) {
  const Sidebar = variant === "editorial" ? ExploreSidebar : SpotlightSidebar;

  /* नयाँ समाचार माथि — स्क्रोल गर्दा-गर्दा बढ्दै (पहिलो मुख्य समाचार हेडिङ) */
  const { sorted, visible, done, loadMore } = usePagedNews(news, 9, 1);

  if (!news.length) {
    return (
      <main className="container-shell py-7">
        <HEAD title={title} description={description} showBanner={false} accent={accent} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <EmptyState text={`${title} श्रेणीमा अहिलेसम्म कुनै समाचार उपलब्ध छैन।`} />
          </div>
          <Sidebar accent={accent} news={news} showCategories={variant !== "editorial"} />
        </div>
      </main>
    );
  }

  const [hero, ...rest] = sorted;

  /* ================= खेलकुद : "स्कोरबोर्ड" ढाँचा =================
     अन्य श्रेणीभन्दा फरक — अगाडी ३ वटा ठूलो 'पोडियम' कार्ड,
     बाँकी सानो अङ्क-सहितको पङ्क्ति सूची (कार्ड ग्रिड होइन)। */
  if (variant === "scoreboard") {
    const podium = rest.slice(0, 3);
    const rows = rest.slice(3);
    return (
      <main className="container-shell py-7">
        {/* showBanner=false भए खाली ठाउँ नराख्ने — माथिको पट्टी नबढ्ने गरी */}
        {showBanner && (
          <header className="overflow-hidden rounded-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 text-white shadow-xl">
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-white/85">{description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["म्याच", "खेलाडी", "रैंकिङ", "प्रशिक्षण"].map((t) => (
                <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur-sm">
                  {t}
                </span>
              ))}
            </div>
          </header>
        )}

        <div className={`grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] ${showBanner ? "mt-8" : ""}`}>
          <div className="min-w-0">
            {hero && (
              <Link
                to={`/article/${hero.id}`}
                className="group relative block overflow-hidden rounded-0 bg-slate-900"
              >
                <span className="block aspect-[16/9] sm:aspect-[21/9]">
                  <img
                    src={hero.image}
                    srcSet={thumbSrcSet(hero.image)}
                    sizes="(max-width: 1024px) 100vw, 860px"
                    alt={hero.title}
                    decoding="async"
                    className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                </span>
                <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6">
                  <span className="w-fit rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-black text-white">
                    आजको खेल
                  </span>
                  <span className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
                    {hero.title}
                  </span>
                  <span className="mt-1 text-xs font-bold text-white/70">{hero.date}</span>
                </span>
              </Link>
            )}

            {podium.length > 0 && (
              <>
                <h2 className="mb-5 mt-12 text-2xl font-black">मुख्य खबर</h2>
                <div className="grid gap-5 sm:grid-cols-3">
                  {podium.map((n) => (
                    <Link
                      key={n.id}
                      to={`/article/${n.id}`}
                      className="group relative overflow-hidden rounded-0 border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <span className="block aspect-[4/3] bg-slate-100">
                        <img
                          src={n.image}
                          srcSet={thumbSrcSet(n.image)}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 290px"
                          alt={n.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </span>
                      <span className="block p-4">
                        <b className="line-clamp-3 font-extrabold leading-6 text-slate-800 transition group-hover:text-brand-600">
                          {n.title}
                        </b>
                        <small className="mt-2 block text-[11px] font-bold text-slate-400">
                          {n.date}
                        </small>
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {rows.length > 0 && (
              <>
                <h2 className="mb-4 mt-12 text-2xl font-black">अन्य खेल खबर</h2>
                <ul className="divide-y divide-slate-200 overflow-hidden rounded-0 border border-slate-200 bg-white shadow-soft">
                  {rows.map((n) => (
                    <li key={n.id}>
                      <Link
                        to={`/article/${n.id}`}
                        className="group grid grid-cols-[minmax(0,1fr)_96px] items-center gap-4 p-4 transition hover:bg-slate-50 sm:grid-cols-[96px_minmax(0,1fr)]"
                      >
                        <img
                          src={n.image}
                          srcSet={thumbSrcSet(n.image)}
                          sizes="96px"
                          alt={n.title}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] w-full rounded-0 object-cover transition duration-300 group-hover:scale-105"
                        />
                        <span className="min-w-0">
                          <b className="line-clamp-2 font-extrabold leading-6 text-slate-800 transition group-hover:text-brand-600">
                            {n.title}
                          </b>
                          <small className="mt-1 block text-[11px] font-bold text-slate-400">
                            {n.date}
                          </small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="min-w-0 space-y-5">
            <SpotlightSidebar accent={accent} news={news} />
          </div>
        </div>
      </main>
    );
  }

  /* ================= विविध : "म्यागजिन" ढाँचा =================
     पाठ-प्रधान — ठूलो लिड कथा दायाँ, बाँकी क्रमैसँग पाठ सूची। */
  if (variant === "magazine") {
    return (
      <main className="container-shell py-7">
        <header className="border-b-4 border-slate-900 pb-6">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-slate-500">{description}</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {hero && (
              <Link to={`/article/${hero.id}`} className="group grid gap-6 border-b border-slate-200 pb-8 transition-colors duration-200 md:grid-cols-2 hover:bg-slate-50">
                <span className="block aspect-[16/10] overflow-hidden rounded-0 bg-slate-100 md:aspect-auto">
                  <img
                    src={hero.image}
                    srcSet={thumbSrcSet(hero.image)}
                    sizes="(max-width: 768px) 100vw, 430px"
                    alt={hero.title}
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="flex flex-col justify-center">
                  <span className="w-fit rounded-full bg-slate-900 px-3 py-1 text-[11px] font-black text-white">
                    मुख्य कथा
                  </span>
                  <b className="mt-3 text-3xl font-black leading-tight text-slate-900 transition group-hover:text-brand-600">
                    {hero.title}
                  </b>
                  <p className="card-summary mt-3 line-clamp-4 text-slate-600">{hero.summary}</p>
                  <small className="mt-3 text-xs font-bold text-slate-400">
                    {hero.date} · {hero.author}
                  </small>
                </span>
              </Link>
            )}

            <h2 className="mb-2 mt-10 text-2xl font-black">अन्य कथा</h2>
            <div className="grid gap-x-6 md:grid-cols-2">
              {visible.map((n) => (
                <article key={n.id} className="group px-2 -mx-2 py-6 transition-colors duration-200 hover:bg-slate-50">
                  <Link to={`/article/${n.id}`} className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 sm:grid-cols-[170px_minmax(0,1fr)]">
                    <span className="block aspect-[16/10] overflow-hidden rounded-0 bg-slate-100">
                      <img
                        src={n.image}
                        srcSet={thumbSrcSet(n.image)}
                        sizes="170px"
                        alt={n.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="min-w-0">
                      <b className="line-clamp-2 text-xl font-black leading-7 text-slate-900 transition group-hover:text-brand-600">
                        {n.title}
                      </b>
                      <p className="card-summary mt-2 line-clamp-3 text-slate-600">{n.summary}</p>
                      <small className="mt-2 block text-[11px] font-bold text-slate-400">{n.date}</small>
                    </span>
                  </Link>
                </article>
              ))}
            </div>

            <LoadMore loadMore={loadMore} done={done} />
          </div>
          <ExploreSidebar accent={accent} news={news} />
        </div>
      </main>
    );
  }

  /* विचार : सम्पादकीय ढाँचा — माथि हेडिन, तल सबै ३/३ ग्रिड */
  if (variant === "editorial") {
    return (
      <main className="container-shell py-7">
        <HEAD title={title} description={description} showBanner={false} accent={accent} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <motion.article variants={rise} className="grid gap-6 md:grid-cols-[280px_1fr]">
              <Link to={`/article/${hero.id}`} className="edge-media aspect-[16/10] md:h-full" style={{ backgroundImage: `url(${hero.image})` }}>
                <img src={hero.image} srcSet={thumbSrcSet(hero.image)} sizes="(max-width: 768px) 100vw, 280px" alt={hero.title} loading="lazy" decoding="async" />
              </Link>
              <div className="flex flex-col justify-center">
                <Link to={`/article/${hero.id}`}><h2 className="mt-3 text-3xl font-black leading-snug transition hover:text-brand-600">{hero.title}</h2></Link>
                <p className="mt-3 leading-7 text-slate-600">{hero.summary}</p>
                <div className="mt-4 text-xs font-bold text-slate-400">{hero.date} • {hero.author}</div>
              </div>
            </motion.article>

            <h2 className="mb-5 mt-12 text-2xl font-black">थप समाचार</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((n, i) => (
                <motion.div key={n.id} variants={rise} className="h-full">
                  <NewsCard news={n} />
                </motion.div>
              ))}
            </div>
            <LoadMore loadMore={loadMore} done={done} />
          </div>
          <ExploreSidebar accent={accent} news={news} showCategories={false} />
        </div>
      </main>
    );
  }

  return (
    <main className="container-shell py-7">
      <HEAD title={title} description={description} showBanner={showBanner} accent={accent} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <motion.div variants={rise}>
            <FeaturedNewsCard news={hero} />
          </motion.div>

          {/* बाँकी सबै — एउटै ३/३ ग्रिड (पहिले ४/४ र सूची मिसाएर थिए) */}
          <h2 className="mb-5 mt-12 text-2xl font-black">थप समाचार</h2>
          <motion.div variants={rise} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((n) => (
              <motion.div key={n.id} variants={rise} className="h-full">
                <NewsCard news={n} />
              </motion.div>
            ))}
          </motion.div>

          <LoadMore loadMore={loadMore} done={done} />
        </div>
        <SpotlightSidebar accent={accent} news={news} />
      </div>
    </main>
  );
}