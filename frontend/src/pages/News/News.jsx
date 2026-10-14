import React from "react";
import { motion } from "framer-motion";

import useNews from "../../hooks/useNews";
import NewsSectionGrid from "../../components/NewsSection/NewsSectionGrid";
import MiniSidebar from "../../components/Sidebar/MiniSidebar";
import AdSlot from "../../components/Ads/AdSlot";
import Loading from "../../components/Common/Loading";
import EmptyState from "../../components/Common/EmptyState";

/* अन्य श्रेणीहरू — क्रम मिलाएर */
const OTHER_SECTIONS = [
  { cat: "विश्व", path: "/world", ad: "news-world-ad" },
  { cat: "राजनीति", path: "/politics", ad: "news-politics-ad" },
  { cat: "स्थानीय तह", path: "/local-level", ad: "news-local-ad" },
  { cat: "कला", path: "/art", ad: "news-art-ad" },
  { cat: "खेलकुद", path: "/sports", ad: "news-sports-ad" },
  { cat: "विचार", path: "/opinion", ad: "news-opinion-ad" },
  { cat: "विविध", path: "/miscellaneous", ad: "news-misc-ad" }
];

const PAGE = 6;

export default function News() {
  const { news, loading } = useNews();
  if (loading) return <Loading />;

  const items = news;
  const inCat = (c) => items.filter((n) => n.category === c);

  /* ताजा खबर = सामान्य "समाचार" श्रेणीका मात्र — श्रेणी खण्डसँग दोहोरिन हुँदैन */
  const general = items.filter((n) => n.category === "समाचार");

  if (!items.length) {
    return (
      <main className="container-shell py-7">
        <EmptyState text="यस श्रेणीमा समाचार भेटिएन।" />
      </main>
    );
  }

  return (
    <main className="container-shell py-7">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ---------------- बायाँ: सबै खण्ड ---------------- */}
        <div className="min-w-0">
          {general.length > 0 && (
            <NewsSectionGrid
              title="ताजा समाचार"
              items={general}
              pageSize={PAGE}
              skip={0}
              view="grid3"
            />
          )}

          {/* ---------------- अन्य श्रेणी ---------------- */}
          {OTHER_SECTIONS.map((s) => {
            const list = inCat(s.cat);
            if (!list.length) return null;
            return (
              <div key={s.cat} className="mt-12 border-t border-slate-200 pt-9">
                <NewsSectionGrid
                  title={s.cat}
                  path={s.path}
                  items={list}
                  pageSize={PAGE}
                  skip={0}
                  view="grid3"
                />
                <AdSlot position={s.ad} className="mt-6" />
              </div>
            );
          })}
        </div>

        {/* ---------------- दायाँ साइडबार ---------------- */}
        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="hidden min-w-0 space-y-5 lg:block"
        >
          <MiniSidebar />
        </motion.aside>
      </div>
    </main>
  );
}
