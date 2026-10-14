import React from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { thumbSrcSet } from "../../services/api";

export default function NewsCard({ news, dense = false }) {
  return (
    <article className="hcard group">
      <Link to={`/article/${news.id}`} className="hcard-link">
        <span className="hcard-media">
          <img
            src={news.image}
            srcSet={thumbSrcSet(news.image)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 370px"
            alt={news.title}
            loading="lazy"
            decoding="async"
            width="400"
            height="250"
          />
        </span>

        <span className="hcard-body">
          <h3 className={`hcard-title ${dense ? "line-clamp-2" : "line-clamp-3"}`}>
            {news.title}
          </h3>

          {!dense && news.summary && (
            <p className="hcard-sum line-clamp-2">{news.summary}</p>
          )}

          <span className="hcard-meta">
            <span className="truncate">{news.date}</span>
            {news.readingTime && (
              <>
                <span className="hcard-dot" />
                <span className="flex flex-none items-center gap-1">
                  <Clock size={11} />
                  {news.readingTime}
                </span>
              </>
            )}
          </span>
        </span>
      </Link>
    </article>
  );
}