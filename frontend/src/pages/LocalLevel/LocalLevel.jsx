import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import useLocalLevel from "../../hooks/useLocalLevel";
import usePagedNews from "../../hooks/usePagedNews";
import LoadMore from "../../components/Common/LoadMore";
import Loading from "../../components/Common/Loading";
import EmptyState from "../../components/Common/EmptyState";
import AdSlot from "../../components/Ads/AdSlot";
import PopularNews from "../../components/Sidebar/PopularNews";
import TrendingNews from "../../components/Sidebar/TrendingNews";
import SidebarAd from "../../components/Sidebar/SidebarAd";
import MiniCalendar from "../../components/Sidebar/MiniCalendar";
import NewsCard from "../../components/NewsCard/NewsCard";
import { categories } from "../../services/newsService";

export default function LocalLevel() {
  const { news, loading } = useLocalLevel();

  /* सबै hook लोडिङ भन्दा माथि — rules of hooks */
  const list = news || [];
  const { visible, done, loadMore } = usePagedNews(list, 9, 1);

  if (loading) return <Loading />;

  return (
    <main className="container-shell py-7">
      {/* ---------- सादा शीर्षक ---------- */}
      <div className="category-hero !mb-7 !border-0 !pb-0">
        <h1>गाउँ · नगर · वडाको समाचार</h1>
        <p>
          गाउँपालिका र नगरपालिकाका योजना, सेवा, विकास र जनजीवनसँग जोडिएका खबर — ठाउँ र समयका आधारम।
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ================= मुख्य क column — सबै ३/३ ग्रिड ================= */}
        <div className="min-w-0 space-y-8">
          {!list.length ? (
            <EmptyState text="हालसम्म स्थानीय तहको कुनै समाचार उपलब्ध छैन।" />
          ) : (
            <>
              {/* ---- नयाँ समाचार (सबैभन्दा माथि) ---- */}
              <section>
                <div className="mb-5">
                  <h2 className="text-2xl font-black text-slate-800 sm:text-[26px]">
                    नयाँ समाचार
                  </h2>
                </div>

                  <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((n) => (
                      <NewsCard key={n.id} news={n} />
                    ))}
                  </div>

                <LoadMore loadMore={loadMore} done={done} />
              </section>

              <AdSlot position="home-main" />

              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/news"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-700"
                >
                  सम्पूर्ण समाचार <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-brand-600 px-7 py-3 text-sm font-black text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white"
                >
                  समाचार पठाउनुहोस्
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ================= साइडबार ================= */}
        <aside className="min-w-0 space-y-5 pt-7 lg:sticky lg:top-24">
          <div className="side-box">
            <h3>तपाईंको ठाउँको कुरा</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              वडा, नगरपालिका र प्रदेश सरकारका निर्णय, भेला तथा विकासका कामहरू तपाईंको नजिकबाटै।
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700"
            >
              समाचार पठाउनुहोस् <ArrowRight size={15} />
            </Link>
          </div>

          <PopularNews />
          <TrendingNews />
          <CategoryBox />
          <SidebarAd />
          {/* मिनी साइडबारको अन्त्यमा पात्रो */}
          <MiniCalendar />
        </aside>
      </div>
    </main>
  );
}

/* ---------------- pieces ---------------- */

function CategoryBox() {
  return (
    <div className="side-box">
      <h3>अन्य श्रेणी</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {categories.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className="flex items-center justify-between gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-brand-600 hover:text-white"
          >
            <span className="truncate">{c.label || c.name}</span>
            <ChevronRight size={13} className="flex-none opacity-60" />
          </Link>
        ))}
      </div>
    </div>
  );
}

