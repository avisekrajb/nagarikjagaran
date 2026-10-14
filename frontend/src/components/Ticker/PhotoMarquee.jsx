import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllNews } from "../../services/newsService";
import { useSite } from "../../context/SiteContext";
import { thumbSrcSet } from "../../services/api";

/* फोटो कार्ड निश्चित चौडाइका हुन्, त्यसैले प्रति कार्ड ~४ सेकेण्ड।
   समाचार बढ्दै पनि गति नबढ्ने गरी अनुपातमा मिलाइन्छ। */
const secsFor = (n) => Math.min(900, Math.max(90, Math.round(n * 4)));

export default function PhotoMarquee() {
  const [items, setItems] = useState([]);
  const { site } = useSite();
  const marqueeColor = site.marquee_color || "#0f2557";

  useEffect(() => {
    let on = true;
    getAllNews().then((n) => { if (on) setItems(Array.isArray(n) ? n : []); }).catch(() => {});
    return () => { on = false; };
  }, []);

  if (!items.length) return null;

  return (
    <section className="section-space">
      <div className="container-shell mb-5">
        <div className="section-header">
          <h2>फोटो फिचर</h2>
          <Link to="/news" className="group flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
            <span className="rounded-full bg-brand-50 px-3 py-1.5 transition group-hover:bg-brand-600 group-hover:text-white">सबै हेर्नुहोस्</span>
          </Link>
        </div>
      </div>
      <div className="photo-marquee" style={{ background: marqueeColor }}>
        <div className="photo-marquee-track" style={{ "--marquee-dur": `${secsFor(items.length)}s` }}>
          {[0, 1].map((g) => (
            <div className="photo-marquee-group" key={g}>
              {items.map((n) => (
                <Link key={n.id + g} to={`/article/${n.id}`} className="photo-marquee-card">
                  <img
                    src={n.image}
                    srcSet={thumbSrcSet(n.image)}
                    sizes="250px"
                    alt={n.title}
                    loading="lazy"
                    decoding="async"
                  />
                  <div><h4>{n.title}</h4></div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}