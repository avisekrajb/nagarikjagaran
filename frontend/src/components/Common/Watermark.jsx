import React, { createContext, useContext, useEffect, useState } from "react";
import { api, absoluteUrl } from "../../services/api";
import { useSite } from "../../context/SiteContext";

const DEFAULTS = {
  enabled: true,
  pos_x: 78,
  pos_y: 80,
  size: 150,
  shape: "rounded",
  opacity: 0.4,
  bg_color: "#ffffff",
  rotation: 0,
  logo: ""
};

/* module-level cache — एउटै पटक मात्र fetch (पहिलो फोटो देखिएपछि) */
let promise = null;
export const clearWatermarkCache = () => { promise = null; };

const fetchWatermark = () => {
  if (!promise) {
    promise = api
      .get("/watermark")
      .then((r) => ({ ...DEFAULTS, ...(r || {}) }))
      .catch(() => ({ ...DEFAULTS }));
  }
  return promise;
};

const WatermarkCtx = createContext({ ...DEFAULTS });

export function WatermarkProvider({ children }) {
  // null = अहिलेसम्म लोड भएको छैन। डिफल्टमा छाडिदिए डाटा आउनुअघिकै
  // watermark एकपटक चमकिएर हराउँथ्यो, त्यसैले लोड भएपछि मात्र देखाउने।
  const [wm, setWm] = useState(null);
  useEffect(() => {
    let on = true;
    fetchWatermark().then((r) => { if (on) setWm(r); });
    return () => { on = false; };
  }, []);
  return <WatermarkCtx.Provider value={wm}>{children}</WatermarkCtx.Provider>;
}

export const useWatermark = () => useContext(WatermarkCtx);

const SHAPE_CLS = {
  square: "rounded-none",
  rounded: "rounded-2xl",
  circle: "rounded-full"
};

/**
 * फोटोमाथि बस्ने watermark।
 * जग्गा (parent) मा `relative` हुनुपर्छ।
 */
export default function Watermark({ preview = false, settings = null, className = "" }) {
  const ctx = useWatermark();
  const { site } = useSite();
  const wm = settings || ctx;

  const src = wm.logo ? absoluteUrl(wm.logo) : absoluteUrl(site?.logo || "");
  if (!wm.enabled) return null;

  const shapeCls = SHAPE_CLS[wm.shape] || SHAPE_CLS.rounded;
  const width = wm.size;

  // हेडर लोगो नभए पनि watermark हराउनु हुँदैन — "न" ब्र्यान्ड चिन्ह देखाउने
  // (Brand.jsx सँग उस्तै)।
  const Mark = (
    src
      ? <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
      : <span className="grid h-full w-full place-items-center font-black text-blue-700" style={{ fontSize: Math.round(width * 0.5) }}>न</span>
  );

  if (preview) {
    // एडमिन preview : खाली ढाँचामा देखाउने (फोटो नभए पनि)
    return (
      <span
        className={`pointer-events-none absolute z-10 ${shapeCls} ${className}`}
        style={{
          left: `${wm.pos_x}%`,
          top: `${wm.pos_y}%`,
          width,
          height: width,
          transform: "translate(-50%,-50%)",
          opacity: Number(wm.opacity),
          background: wm.bg_color,
          boxShadow: "0 2px 10px rgba(15,23,42,.18)",
          outline: "2px dashed rgba(37,99,235,.5)",
          outlineOffset: 3
        }}
      >
        {Mark}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 ${shapeCls} ${className}`}
      style={{
        left: `${wm.pos_x}%`,
        top: `${wm.pos_y}%`,
        width,
        height: width,
        transform: `translate(-50%,-50%) rotate(${Number(wm.rotation) || 0}deg)`,
        opacity: Number(wm.opacity),
        background: wm.bg_color,
        boxShadow: "0 2px 10px rgba(15,23,42,.18)"
      }}
    >
      {Mark}
    </span>
  );
}
