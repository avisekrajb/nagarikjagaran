import React from "react";
import {useState,useEffect} from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getAllNews, incrementNewsView, getTrendingNews } from "../../services/newsService";
import ArticleHeader from "./ArticleHeader";
import ArticleMeta from "./ArticleMeta";
import ArticleImage from "./ArticleImage";
import ArticleContent from "./ArticleContent";
import SocialShare from "./SocialShare";
import { VideoEmbed, ArticleTags } from "./ArticleExtras";
import Comments from "./Comments";
import RelatedNews from "./RelatedNews";
import MiniSidebar from "../Sidebar/MiniSidebar";
import NewsCard from "../NewsCard/NewsCard";
import SectionHeader from "../NewsSection/SectionHeader";
import AdSlot from "../Ads/AdSlot";

const fade={hidden:{opacity:0,y:24},show:{opacity:1,y:0}};
const rise={hidden:{opacity:0,y:26},show:{opacity:1,y:0,transition:{duration:.45,ease:"easeOut"}}};
/* मुख्य समाचार बायाँतिर बाट ओिल्छ, साइडबार दायाँतिर — साइडबार ढिलो आउँछ */
const newsSlide={hidden:{opacity:0,x:-56},show:{opacity:1,x:0,transition:{duration:.55,ease:[.2,.8,.3,1]}}};
const sideSlide={hidden:{opacity:0,x:64},show:{opacity:1,x:0,transition:{duration:.55,delay:.18,ease:[.2,.8,.3,1]}}};
const cascade={hidden:{},show:{transition:{staggerChildren:.08}}};
const artCascade={hidden:{},show:{transition:{staggerChildren:.07,delayChildren:.05}}};
const cardV={hidden:{opacity:0,y:20},show:{opacity:1,y:0,transition:{duration:.4,ease:"easeOut"}}};

// ट्रेन्डिङ : अधिकतम २० समाचार, ४÷४ ग्रिड, पेजमा ८÷
const TRENDING_MAX = 20;
const TRENDING_PER_PAGE = 8;
const TRENDING_DAYS = 36500; // लगभग सबैसमय — क्लिक भरेका सबै

export default function ArticleDetail({ article }) {
  const [live, setLive] = useState([]);
  const [fontSize, setFontSize] = useState(19);
  const [prog, setProg] = useState(0);
  const [trending, setTrending] = useState([]);
  const [top, setTop] = useState([]);
  const [trendPage, setTrendPage] = useState(1);

  // ट्रेन्डिङ = डाटाबेसमा सबैभन्दा बढी click भएका (अधिकतम २०)
  useEffect(() => {
    let on = true;
    getTrendingNews(TRENDING_MAX, TRENDING_DAYS)
      .then((rows) => {
        if (!on) return;
        setTrending(rows.filter((n) => String(n.id) !== String(article?.id)).slice(0, TRENDING_MAX));
      })
      .catch(() => {});
    return () => { on = false; };
  }, [article?.id]);

  // टप न्युज = नयाँ भित्र सबैभन्दा बढी हेरिएका (हालका १४ दिन)
  useEffect(() => {
    let on = true;
    getTrendingNews(8, 14)
      .then((rows) => {
        if (!on) return;
        setTop(rows.filter((n) => String(n.id) !== String(article?.id)).slice(0, 5));
      })
      .catch(() => {});
    return () => { on = false; };
  }, [article?.id]);

  useEffect(() => {
    getAllNews().then((n) => setLive(n)).catch(() => {});
    if (article?.id) incrementNewsView(article.id);
  }, [article?.id]);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        setProg(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const list = live;
  /* नयाँ भित्र धेरै हेरिएका — नभए भए नयाँ मात्र देखाउने */
  const top5 = top.length ? top : list.slice(0, 5);

  // ट्रेन्डिङ पेजिनेसन
  const trendingPages = Math.max(1, Math.ceil(trending.length / TRENDING_PER_PAGE));
  const trendStart = (trendPage - 1) * TRENDING_PER_PAGE;
  const pageItems = trending.slice(trendStart, trendStart + TRENDING_PER_PAGE);
  return (
    <main className="container-shell py-7">
      <div className="article-progress" style={{ width: `${Math.round(prog * 100)}%` }} />
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <motion.article variants={newsSlide} className="min-w-0">
          <motion.div variants={fade} >
            <SocialShare article={article} className="mb-6 justify-center"/>
            <ArticleHeader article={article}/>
            <ArticleMeta article={article} fontSize={fontSize} setFontSize={setFontSize}/>
            <ArticleImage article={article}/>
            <VideoEmbed url={article.yt_link}/>
            <AdSlot position="article-top" className="my-6"/>
            <ArticleContent article={article} fontSize={fontSize}/>
            <ArticleTags tags={article.tags}/>
          </motion.div>
          <AdSlot position="article-bottom" className="mt-10"/>
          <Comments newsId={article.id}/>
          <AdSlot position="article-after-comments" className="mt-10"/>
          <RelatedNews article={article}/>
          <AdSlot position="article-after-related" className="mt-10"/>
        </motion.article>
        <motion.aside variants={sideSlide} className="min-w-0">
          <motion.div variants={artCascade}>
            <MiniSidebar/>
          </motion.div>
        </motion.aside>
      </div>

      <motion.section variants={fade}  className="mt-16">
        <SectionHeader title="टप न्युज" link="सबै हेर्नुहोस्" linkTo="/news"/>
        <motion.div variants={cascade}   className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {top5.map((n)=>(
            <motion.div key={n.id} className="h-full">
              <Link to={`/article/${n.id}`} className="tn-card group">
                <span className="tn-card-media">
                  <img src={n.image} alt={n.title} loading="lazy" decoding="async" />
                </span>
                <span className="tn-card-body">
                  <span className="tn-card-title line-clamp-3">{n.title}</span>
                  {n.summary && (
                    <span className="tn-card-sum line-clamp-2">{n.summary}</span>
                  )}
                  <span className="tn-card-meta">
                    <Clock size={12} />
                    <span>{n.date}</span>
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section variants={fade}  className="mt-16">
        <SectionHeader title="मुख्य समाचार" link="सबै हेर्नुहोस्" linkTo="/news"/>
        {/* साइडबार माथिल्लो खण्डमा मात्र छ — यहाँ पुनः नहालाखोल्ने */}
        <motion.div variants={cascade} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.slice(0,12).map(n=>(
            <motion.div key={n.id} className="h-full"><NewsCard news={n}/></motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section variants={fade} className="mt-16 pb-2">
        <div className="mb-5 flex items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
          <h2 className="text-lg font-black text-slate-900 sm:text-xl">
            ट्रेन्डिङ समाचार
          </h2>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            सबैभन्दा बढी हेरिएका
          </span>
        </div>

        {trending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-bold text-slate-400">
            अहिलेसम्म कुनै ट्रेन्डिङ समाचार छैन।
          </p>
        ) : (
          /* सूची मात्र : २/२ (साइडबार माथिल्लो खण्डमै छ) */
          <motion.div variants={cascade} className="trend-items grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((n) => (
              <motion.div key={n.id} variants={cardV} className="h-full">
                <Link to={`/article/${n.id}`} className="trend-row group">
                    <img src={n.image} alt={n.title} loading="lazy" decoding="async" />
                    <span className="min-w-0 flex-1">
                      <span className="tn-card-title line-clamp-2 block">{n.title}</span>
                      <span className="tn-card-meta">
                        <Clock size={12} />
                        <span>{n.date}</span>
                      </span>
                    </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

            {trendingPages > 1 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
                <button
                  onClick={() => setTrendPage((p) => Math.max(1, p - 1))}
                  disabled={trendPage <= 1}
                  aria-label="अघिल्लो पृष्ठ"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>
                {Array.from({ length: trendingPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setTrendPage(p)}
                    className={`h-9 min-w-[36px] rounded-lg px-2.5 text-sm font-black tabular-nums transition ${
                      p === trendPage
                        ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setTrendPage((p) => Math.min(trendingPages, p + 1))}
                  disabled={trendPage >= trendingPages}
                  aria-label="पछिल्लो पृष्ठ"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            )}
        )}
      </motion.section>
    </main>
  );
}