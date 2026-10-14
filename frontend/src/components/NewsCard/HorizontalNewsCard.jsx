import React from "react";
import { Link } from "react-router-dom";
import { thumbSrcSet } from "../../services/api";

export default function HorizontalNewsCard({ news }) {
  return (
    <Link to={`/article/${news.id}`} className="horizontal-card h-full">
      <div className="thumb-media" style={{ backgroundImage: `url(${news.image})` }}>
        <img
          src={news.image}
          srcSet={thumbSrcSet(news.image)}
          sizes="115px"
          alt={news.title}
          loading="lazy"
          decoding="async"
          width="200"
          height="140"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-2 mt-1 font-extrabold leading-6">{news.title}</h3>
        <p className="card-summary line-clamp-3 mt-1 text-slate-600">{news.summary}</p>
        <small className="mt-auto block pt-1 text-xs text-slate-400">{news.date}</small>
      </div>
    </Link>
  );
}