import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSplash } from "../../context/SplashContext";
import { useNavigate } from "react-router-dom";
import { getAds, incrementAdView, incrementAdClick } from "../../services/newsService";
import { useSite } from "../../context/SiteContext";
import { absoluteUrl } from "../../services/api";

/**
 * स्प्ल्यास स्क्रिन — पृष्ठ खुल्दा **पहिलो** देखिने।
 *  • पूरा स्क्रिन सफेद overlay (modal)।
 *  • माथि केन्द्रमा हेडर लोगो (सेतो पृष्ठभूमिमा)।
 *  • विज्ञापनको फोटो/गिफ मात्र देखिन्छ — कुनै बक्स/कार्ड छैन।
 *  • विज्ञापनमा क्लिक गर्दा सम्बन्धित लिंकमा जान्छ।
 *  • माथिल्लो दायाँ × बटन थिच्दा वा १० सेकेन्डपछि साइट देखिन्छ।
 */

const isInternal = (link) => typeof link === "string" && link.startsWith("/");

export default function SplashAd({ showDelayMs = 500 }) {
  const [ad, setAd] = useState(null);
  const navigate = useNavigate();
  const { dismissed, dismiss } = useSplash();
  const { site } = useSite();

  /* १) विज्ञापन ल्याउने */
  useEffect(() => {
    let on = true;
    const t = setTimeout(() => {
      getAds("splash")
        .then((list) => {
          if (!on) return;
          if (!Array.isArray(list) || !list.length) { dismiss(); return; }
          setAd(list[0]);
          incrementAdView(list[0].id);
        })
        .catch(() => { if (on) dismiss(); });
    }, showDelayMs);

    return () => { on = false; clearTimeout(t); };
  }, [showDelayMs, dismiss]);

  if (!ad || dismissed) return null;

  const hasLink = ad.link && ad.link !== "#";

  const open = () => {
    incrementAdClick(ad.id);
    if (hasLink) {
      if (isInternal(ad.link)) navigate(ad.link);
      else window.open(ad.link, "_blank", "noopener");
    }
    dismiss();
  };

  return (
    /* फिक्स्ड फुलस्क्रिन overlay — सबैभन्दा माथि */
    <div className="splash-screen" role="dialog" aria-modal="true" aria-label="विज्ञापन">
      {/* माथि केन्द्रमा : हेडर लोगो (सेतो पृष्ठभूमि) */}
      <div className="splash-logo-top">
        {site.logo ? (
          <img src={absoluteUrl(site.logo)} alt="Logo" className="splash-logo-img" />
        ) : (
          <span className="splash-logo-text">नागरिक न्यूज</span>
        )}
      </div>

      {/* माथिल्लो दायाँ : × बटन */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="विज्ञापन बन्द गर्नुहोस्"
        className="splash-x"
      >
        <X size={20} strokeWidth={2.5} />
      </button>

      {/* क्लिकयोग्य विज्ञापन — फोटो/गिफ मात्र, बक्स छैन */}
      <div
        className="splash-ad-hit"
        onClick={open}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") open(); }}
        style={{ cursor: hasLink ? "pointer" : "default" }}
      >
        {ad.image ? (
          <img className="splash-img" src={ad.image} alt={ad.title || "विज्ञापन"} />
        ) : (
          <span className="splash-title">{ad.title}</span>
        )}
      </div>
    </div>
  );
}