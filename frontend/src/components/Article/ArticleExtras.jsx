import React from "react";

export function VideoEmbed({ url }) {
  if (!url) return null;
  let m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,15})|youtu\.be\/([\w-]{6,15})/);
  const id = m ? (m[1] || m[2]) : null;
  if (!id) return null;
  return (
    <div className="article-video-wrap mt-5 overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video"
        className="article-video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function ArticleTags({ tags }) {
  if (!tags) return null;
  const list = String(tags).split(",").map((t) => t.trim()).filter(Boolean);
  if (!list.length) return null;
  return (
    <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
      <span className="text-xs font-bold text-slate-500">ट्यागहरू:</span>
      {list.map((t, i) => (
        <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand-700">#{t}</span>
      ))}
    </div>
  );
}