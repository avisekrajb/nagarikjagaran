import React, { useState, useEffect } from "react";
import { getAds, incrementAdView, incrementAdClick } from "../../services/newsService";

export const AD_POSITIONS = [
  { value: "splash", label: "स्प्ल्यास (पर्दा स्क्रिन)", page: "सबै पेज — खुल्दा देखिने पूरा स्क्रिन विज्ञापन" },

  /* ---- सबै पेज (फुल-विड्थ) ---- */
  { value: "banner", label: "होमपेज ब्यानर", page: "गृहपृष्ठ — मुख्य सामग्रीको बीच" },
  { value: "header", label: "हेडर (माथि)", page: "सबै पेज — हेडरको ठीक माथि" },
  { value: "ticker-after", label: "ताजा खबर मार्की पछि", page: "गृहपृष्ठ — मार्कीको ठीक तल" },
  { value: "page-top", label: "पेजको माथि (फुल-विड्थ)", page: "सबै पेज — हेडरको ठीक तल" },
  { value: "page-end", label: "पेजको अन्त्य (फुल-विड्थ)", page: "सबै पेज — फुटरको ठीक तल" },

  /* ---- दायाँ साइडबार ---- */
  { value: "sidebar", label: "साइडबार (सबै पेज)", page: "दायाँ स्तम्भ — सबै पेजको साइडबारमा" },
  { value: "home-sports-ad", label: "साइडबार — खेलकुद मिनी", page: "दायाँ स्तम्भ — खेलकुदको मिनी साइडबार" },
  { value: "home-culture-ad", label: "साइडबार — कला मिनी", page: "दायाँ स्तम्भ — कला/मनोरञ्जनको मिनी साइडबार" },

  /* ---- समाचार विवरण पेज ---- */
  { value: "article-top", label: "समाचार — शीर्षक पछि", page: "विवरण पेज — मुख्य फोटोको ठीक तल" },
  { value: "article-middle", label: "समाचार — बीचमा", page: "विवरण पेज — सामग्रीको बीचमा" },
  { value: "article-bottom", label: "समाचार — अन्त्यमा", page: "विवरण पेज — सामग्री सकिएपछि" },
  { value: "article-after-comments", label: "समाचार — टिप्पणी पछि", page: "विवरण पेज — टिप्पणीको ठीक तल" },
  { value: "article-after-related", label: "समाचार — सम्बन्धित पछि", page: "विवरण पेज — सम्बन्धित सामग्रीको ठीक तल" },

  /* ---- समाचार पेज : श्रेणी खण्ड ---- */
  { value: "news-world-ad", label: "पेज — विश्व खण्ड", page: "/news — विश्व खण्डको ठीक तल" },
  { value: "news-politics-ad", label: "पेज — राजनीति खण्ड", page: "/news — राजनीति खण्डको ठीक तल" },
  { value: "news-local-ad", label: "पेज — स्थानीय तह खण्ड", page: "/news — स्थानीय तह खण्डको ठीक तल" },
  { value: "news-art-ad", label: "पेज — कला खण्ड", page: "/news — कला खण्डको ठीक तल" },
  { value: "news-sports-ad", label: "पेज — खेलकुद खण्ड", page: "/news — खेलकुद खण्डको ठीक तल" },
  { value: "news-opinion-ad", label: "पेज — विचार खण्ड", page: "/news — विचार खण्डको ठीक तल" },
  { value: "news-misc-ad", label: "पेज — विविध खण्ड", page: "/news — विविध खण्डको ठीक तल" },

  /* ---- गृहपृष्ठ ---- */
  { value: "home-main", label: "गृहपृष्ठ — मुख्य खण्ड", page: "गृहपृष्ठ — ताजा खबरको माथि" },
  { value: "home-bulletin", label: "गृहपृष्ठ — बुलेटिन पछि", page: "गृहपृष्ठ — समाचार बुलेटिनको ठीक तल" },
  { value: "home-local-bottom", label: "गृहपृष्ठ — स्थानीय तह पछि", page: "गृहपृष्ठ — स्थानीय तह खण्डको ठीक तल" },
  { value: "home-art-bottom", label: "गृहपृष्ठ — कला/मनोरञ्जन पछि", page: "गृहपृष्ठ — कला/मनोरञ्जन खण्डको ठीक तल" },
  { value: "home-politics-bottom", label: "गृहपृष्ठ — राजनीति पछि", page: "गृहपृष्ठ — राजनीति खण्डको ठीक तल" },
  { value: "home-sports-bottom", label: "गृहपृष्ठ — खेलकुद पछि", page: "गृहपृष्ठ — खेलकुद खण्डको ठीक तल" },
  { value: "home-misc-bottom", label: "गृहपृष्ठ — विविध पछि", page: "गृहपृष्ठ — विविध खण्डको ठीक तल" },
  { value: "home-voices", label: "गृहपृष्ठ — विविध आवाज", page: "गृहपृष्ठ — विविध आवाजको ठीक तल" },
  { value: "home-marquee", label: "गृहपृष्ठ — मार्की पछि", page: "गृहपृष्ठ — फोटो मार्कीको ठीक तल" },
];

export default function AdSlot({ position, className = "", slotClassName = "", onHas = null }) {
  const [ads, setAds] = useState([]);
  const [broken, setBroken] = useState({});
  useEffect(() => {
    let on = true;
    getAds(position)
      .then((list) => {
        if (!on) return;
        const arr = Array.isArray(list) ? list : [];
        if (!arr.length) console.warn(`[ads] "${position}" स्लट खाली छ — प्रकाशित/म्याद नसकिएको विज्ञापन छैन।`);
        setAds(arr);
        if (onHas) onHas(arr.length > 0);
        // Track views for each ad
        arr.forEach((ad) => incrementAdView(ad.id));
      })
      .catch(() => { if (onHas) onHas(false); });
    return () => { on = false; };
  }, [position]);
  if (!ads.length) return null;

  return (
    <div className={`ad-stack ${className}`}>
      {ads.map((a) => (
        <a
          key={a.id}
          href={a.link === "#" ? "#" : a.link || "#"}
          target={a.link === "#" ? "_self" : "_blank"}
          rel="noreferrer"
          title={a.title}
          className={`block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10 ${slotClassName}`}
          onClick={() => incrementAdClick(a.id)}
        >
          {a.image ? (
            <img
              src={a.image}
              alt={a.title}
              loading="lazy"
              decoding="async"
              onError={() => { console.error(`[ads] छवि लोड भएन (ad id=${ad.id}):`, a.image); setBroken((b) => ({ ...b, [a.id]: true })); }}
              className="ad-img"
            />
          ) : broken[a.id] ? (
            <div className={`grid place-items-center bg-gradient-to-br from-blue-600 to-sky-500 px-4 py-6 text-center text-sm font-black text-white`}>
              {a.title}
            </div>
          ) : null}
        </a>
      ))}
    </div>
  );
}
