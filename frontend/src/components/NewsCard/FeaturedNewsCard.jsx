import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { thumbSrcSet } from "../../services/api";

export default function FeaturedNewsCard({ news, titleOnly = false }) {
  return (
    <motion.article whileHover={{ scale: 1.01 }} className="featured-card">
      <Link to={`/article/${news.id}`} className="absolute inset-0 z-10" aria-label={news.title} />
      <img
        src={news.image}
        srcSet={thumbSrcSet(news.image)}
        sizes="(max-width: 640px) 100vw, 1180px"
        alt={news.title}
        decoding="async"
        fetchPriority="high"
      />
      <div className="featured-overlay">
        <h2>{news.title}</h2>
        {!titleOnly && <p className="card-summary line-clamp-3 leading-7">{news.summary}</p>}
        {!titleOnly && <span className="text-xs text-white/70">{news.date}</span>}
      </div>
    </motion.article>
  );
}