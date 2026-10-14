import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSlider({ news = [], auto = 4500 }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const n = news.length;
  const touchX = useRef(null);

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => { setDir(1); setI((p) => (p + 1) % n); }, auto);
    return () => clearInterval(t);
  }, [n, paused, auto]);

  if (!n) return null;

  const go = (d) => { setDir(d); setI((p) => (p + d + n) % n); };
  const item = news[i];

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - (touchX.current || 0); if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); }}
    >
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={item.id}
          custom={dir}
          initial={{ opacity: 0, x: dir * 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -80 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="hero-slide"
        >
          <Link to={`/article/${item.id}`} className="hero-slide-link" aria-label={item.title}>
            <img src={item.image} alt={item.title} fetchPriority={i === 0 ? "high" : "auto"} />
            <div className="hero-dim" />
            <div className="hero-content">
              <h2>{item.title}</h2>
            </div>
          </Link>
          <div className="hero-dots">
            {news.map((x, k) => (
              <button
                key={x.id} type="button" title={x.title}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(k - i); }}
                className={`hero-dot ${k === i ? "on" : ""}`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <button type="button" className="hero-arrow left" onClick={() => go(-1)} aria-label="पछिल्लो">
        <ChevronLeft size={20} />
      </button>
      <button type="button" className="hero-arrow right" onClick={() => go(1)} aria-label="अर्को">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}