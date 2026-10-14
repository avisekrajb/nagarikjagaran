import React, { useCallback, useEffect, useRef, useState } from "react";
import { useUI } from "../../context/UIContext";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";
import MainNavigation from "../Navigation/MainNavigation";
import LatestTicker from "../Ticker/LatestTicker";

const HIDE_AFTER = 72;
const SHOW_BEFORE = 12;
const DESKTOP = "(min-width: 768px)";

/**
 * ठूलो हेडर (लोगो, समय, मिति, मौसम, विज्ञापन) स्क्रोल गर्दा दुवैतिर लुक्छ —
 * सबैभन्दा माथि पुगेपछि मात्र फेरि देखिन्छ। त्यसबेला मिनी न्युभार
 * ठाउँ ओगट्छ।
 *
 * लुकाउने काम inline style बाट हुन्छ (CSS मा होइन) :
 *  • हरेक पटक CSS cascade बाट मुक्त, त्यसैले breakpoint बदलिँदा बिग्रिँदैन
 *  • max-height सधैँ px मा हुन्छ, त्यसैले none → 0 को "no transition" समस्या हुँदैन
 *  • माथिल्लो भाग नापेर राखिन्छ, त्यसैले content कति पनि होसन सही collapse हुन्छ
 */
export default function Header() {
  const { drawer, setDrawer } = useUI();
  const [topHidden, setTopHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const topRef = useRef(null);
  const heightRef = useRef(0);
  const hiddenRef = useRef(false);

  const applyHeight = useCallback((hidden) => {
    const el = topRef.current;
    if (!el) return;

    if (hidden) {
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      el.style.borderBottomWidth = "0";
      return;
    }

    // नाप्नका लागि फुकुट खोल्ने, अनि वास्तविक उचाइ px मा राख्ने
    el.style.maxHeight = "none";
    const h = el.scrollHeight;
    if (h > 0) {
      heightRef.current = h;
      el.style.maxHeight = `${h}px`;
    } else {
      // नाप्न नसकिए (content छैन/लुकाइएको) — कहिल्यै ० नहालौं,
      // नत्र हेडर देखिनै बिर्सन्छ
      el.style.maxHeight = "none";
    }
    el.style.opacity = "1";
    el.style.pointerEvents = "";
    el.style.borderBottomWidth = "";
  }, []);

  useEffect(() => {
    let raf = 0;

    const readScroll = () => {
      raf = 0;
      const y = window.scrollY || 0;
      setScrolled(y > 8);
      // मोबाइलमा मिनी न्युभार नभएकाले हेडर सधैँ देखिन्छ
      const isDesktop = window.matchMedia(DESKTOP).matches;

      /* Hysteresis : तल जाँदा ७२px नाघेपछि लुकाउने, माथि आउँदा
         १२px भन्दा माथि पुगेपछि मात्र देखाउने। एकै threshold राख्दा
         collapse ले layout सार्ने बित्तिकै state पटक-पटक उल्टिन्छ
         (mini-nav flicker) — यसैले बीचमा "dead zone" राखिएको। */
      let hide = hiddenRef.current;
      if (!isDesktop) hide = false;
      else if (y > HIDE_AFTER) hide = true;
      else if (y < SHOW_BEFORE) hide = false;

      if (hide !== hiddenRef.current) {
        hiddenRef.current = hide;
        setTopHidden(hide);
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(readScroll);
    };

    readScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const mq = window.matchMedia(DESKTOP);
    if (mq.addEventListener) mq.addEventListener("change", readScroll);

    // content को उचाइ बदलिए (फोटो/विज्ञापन लोड) अद्यावधिक गर्ने
    const ro =
      typeof ResizeObserver !== "undefined" && topRef.current
        ? new ResizeObserver(() => {
            if (topRef.current && !topRef.current.classList.contains("is-hidden")) {
              const h = topRef.current.scrollHeight;
              if (h && h !== heightRef.current) {
                heightRef.current = h;
                topRef.current.style.maxHeight = `${h}px`;
              }
            }
          })
        : null;
    if (ro && topRef.current) ro.observe(topRef.current);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (mq.removeEventListener) mq.removeEventListener("change", readScroll);
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, []);

  // state बदलिँदा मात्र inline style लागू गर्ने
  useEffect(() => { applyHeight(topHidden); }, [topHidden, applyHeight]);

  return (
    <header
      className={`site-header sticky top-0 z-50 bg-white shadow-sm ${scrolled ? "is-scrolled" : ""}`}
    >
      <div
        ref={topRef}
        className={`header-top-collapse ${topHidden ? "is-hidden" : ""}`}
        aria-hidden={topHidden}
      >
        <DesktopHeader onMenu={() => setDrawer(true)} />
        <MobileHeader onMenu={() => setDrawer(true)} />
      </div>

      {/* मिनी न्युभार — माथिल्लो हेडर लुक्दा यही ठाउँ ओगट्छ।
          लोगो चाहिन्छ भन्ने मात्र देखाउने (हेडर लुकिएपछि मात्र)। */}
        <div className="mini-nav-bar">
          <MainNavigation showLogo={topHidden} />
        </div>

        {/* ताजा खबर मार्की — अब सबै public पृष्ठमा (हेडरभित्रै) */}
        <LatestTicker />

        <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </header>
  );
}
