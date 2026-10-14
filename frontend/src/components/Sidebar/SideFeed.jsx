import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { thumbSrcSet } from "../../services/api";

/**
 * साइडबारको सानो सूची — आधुनिक, पातामैंको ढाँचा।
 * thumb भए पनि नभए पनि राम्रो देखिन्छ।
 *
 * नियम : मिनी साइडबारमा **मिति देखाइँदैन**। सट्टामा शीर्षकको तल
 * एक पङ्क्तिको सारांश (description) देखिन्छ।
 */
export default function SideFeed({
  items = [],
  number = false,
  showThumb = true,
  showDate = false,
  showSum = true,
  empty = "हालसम्म कुनै समाचार छैन।",
}) {
  if (!items.length) {
    return <p className="py-6 text-center text-xs font-bold text-slate-400">{empty}</p>;
  }

  return (
    <ul className="side-feed">
      {items.map((n, i) => (
        <li key={n.id}>
          <Link to={`/article/${n.id}`} className="side-feed-link group">
            {number && <span className="side-feed-n">{i + 1}</span>}

            <span className="min-w-0 flex-1">
              <h4 className="side-feed-title line-clamp-2">{n.title}</h4>
              {showSum && n.summary && (
                <p className="side-feed-sum line-clamp-2">{n.summary}</p>
              )}
              {!showSum && n.summary && (
                <p className="side-feed-sum line-clamp-1">{n.summary}</p>
              )}
              {showDate && <p className="side-feed-meta">{n.date}</p>}
            </span>

            {showThumb && n.image && (
              <span className="side-feed-media">
                <img
                  src={n.image}
                  srcSet={thumbSrcSet(n.image)}
                  sizes="74px"
                  alt={n.title}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** साइडबार बक्स — शीर्षक + सामग्री */
export const SideBlock = ({ title, children, action }) => (
  <section className="side-box">
    {title && (
      <h3>
        {title}
        {action}
      </h3>
    )}
    {children}
  </section>
);