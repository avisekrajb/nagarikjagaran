import React from "react";
import { Link } from "react-router-dom";
import { thumbSrcSet } from "../../services/api";

/* showDate=false — ताजा खबर साइडबारजस्ता ठाउँमा मिति नदेखाउने */
export default function CompactNewsCard({ news, showDate = true }) {
  return (
    <Link to={`/article/${news.id}`} className="compact-card">
      <div className="thumb-media" style={{ backgroundImage: `url(${news.image})` }}>
        <img
          src={news.image}
          srcSet={thumbSrcSet(news.image)}
          sizes="96px"
          alt={news.title}
          loading="lazy"
          decoding="async"
          width="150"
          height="100"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h4 className="font-bold leading-5 line-clamp-2">{news.title}</h4>
        {showDate && (
          <p className="mt-auto mt-0.5 text-xs text-slate-400">{news.date}</p>
        )}
      </div>
    </Link>
  );
}