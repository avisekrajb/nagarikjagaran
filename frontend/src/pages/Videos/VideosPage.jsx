import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { getAllNews, getReels } from "../../services/newsService";
import { absoluteUrl, thumbSrcSet } from "../../services/api";
import { adToBs, BS_MONTHS } from "../../utils/formatDate";
import Loading from "../../components/Common/Loading";
import EmptyState from "../../components/Common/EmptyState";
import ReelViewer from "../../components/Reels/ReelViewer";

const DEV = "०१२३४५६७८९";
const dev = (n) => String(n).replace(/[0-9]/g, (d) => DEV[+d]);

/** विक्रम मिति मात्र — साइटमा कही पनि ई.सं. नदेखिने गरी */
const bsDate = (value) => {
  const b = value instanceof Date ? adToBs(value) : adToBs(new Date(value || Date.now()));
  if (!b) return "";
  return `वि.सं. ${dev(b.year)} ${BS_MONTHS[b.month]} ${dev(b.day)}`;
};

const ytId = (text) => {
  const m = String(text || "").match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,15})|youtu\.be\/([\w-]{6,15})/
  );
  return m ? m[1] || m[2] : null;
};

/** समाचारका भित्रबाट युट्युब भिडियो (पुरानो व्यवहार) */
const fromNews = (news) => {
  const map = new Map();
  news.forEach((n) => {
    [ytId(n.yt_link), ytId(n.content)].forEach((id) => {
      if (id && !map.has(id)) {
        map.set(id, {
          key: `yt-${id}`,
          title: n.title,
          date: n.date,
          readingTime: n.readingTime,
          image: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
          video_url: `https://www.youtube.com/watch?v=${id}`,
          category: "युट्युब",
        });
      }
    });
  });
  return [...map.values()];
};

/** रील्स API बाट — सबै रील (सिधा .webm/.mp4 + लिंक) */
const fromReels = (reels) =>
  reels.map((r) => ({
    key: `reel-${r.id}`,
    title: r.title,
    date: bsDate(r.created_at),
    readingTime: "",
    image: absoluteUrl(r.thumbnail) || "",
    video_url: r.video_url,
    category: "रील",
  }));

export default function VideosPage() {
  const [videos, setVideos] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    Promise.all([
      getReels().catch(() => []),
      getAllNews().catch(() => []),
    ]).then(([reels, news]) => {
      setVideos([...fromReels(reels || []), ...fromNews(news || [])]);
    });
  }, []);

  if (!videos) return <Loading />;

  return (
    <main className="container-shell py-7">
      {/* ब्यानर हटाइयो — अनावश्यक थियो */}

      <div className="mb-6 border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">नागरिक भिडियो</h1>
      </div>

      {!videos.length ? (
        <div className="py-14"><EmptyState text="हालसम्म कुनै भिडियो थपिएको छैन।" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {videos.map((v) => (
            <button
              key={v.key}
              onClick={() => setActive(v)}
              className="vid-card group text-left"
            >
              <span className="vid-media">
                {v.image ? (
                  <img
                    src={v.image}
                    srcSet={thumbSrcSet(v.image)}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                    alt={v.title}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500" />
                )}
                <span className="vid-play"><Play size={20} fill="currentColor" /></span>
                <span className="vid-badge">{v.category}</span>
              </span>
              <span className="vid-body">
                <h3 className="vid-title line-clamp-3">{v.title}</h3>
                <span className="vid-meta">
                  {v.date && <span>{v.date}</span>}
                  {v.readingTime && <span>{v.readingTime}</span>}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ९:१६ फ्रेममा चल्ने — सिधा फाइल र युट्युब दुवै */}
      <ReelViewer reel={active} onClose={() => setActive(null)} />
    </main>
  );
}
