import { createContext, useContext, useState, useEffect } from "react";
import { getFooterData, defaultFooter } from "../services/newsService";
import { absoluteUrl } from "../services/api";

const C = createContext(null);

const hexToRgb = (hex) => {
  let h = String(hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgbToHex = (r, g, b) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

const mix = (rgb, target, amount) => rgb.map((v, i) => v + (target[i] - v) * amount);

const toLinear = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const luminance = (rgb) =>
  0.2126 * toLinear(rgb[0]) + 0.7152 * toLinear(rgb[1]) + 0.0722 * toLinear(rgb[2]);

const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const DARK_PAGE = [22, 33, 58];

// Push the mini-nav colour to the nearest shade that is actually readable
// as a title-hover colour on the current theme background (WCAG AA).
const readable = (rgb, mode) => {
  const bg = mode === "dark" ? DARK_PAGE : WHITE;
  const target = mode === "dark" ? WHITE : BLACK;
  let cur = rgb.slice();
  for (let i = 0; i < 40; i += 1) {
    if (contrast(cur, bg) >= 4.5) return cur;
    cur = mix(cur, target, 0.06);
  }
  return cur;
};

export function applyBrandColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb || typeof document === "undefined") return;
  const white = [255, 255, 255];
  const black = [0, 0, 0];
  const root = document.documentElement;
  const set = (k, v) => root.style.setProperty(k, v);
  set("--brand-50", rgbToHex(...mix(rgb, white, 0.94)));
  set("--brand-100", rgbToHex(...mix(rgb, white, 0.86)));
  set("--brand-500", rgbToHex(...mix(rgb, white, 0.22)));
  set("--brand-600", rgbToHex(...rgb));
  set("--brand-700", rgbToHex(...mix(rgb, black, 0.16)));
  set("--brand-900", rgbToHex(...mix(rgb, black, 0.42)));
  set("--brand", rgbToHex(...rgb));
  set("--brand-rgb", rgb.join(","));
  set("--title-hover", rgbToHex(...readable(rgb.slice(), "light")));
  set("--title-hover-dark", rgbToHex(...readable(rgb.slice(), "dark")));
  set("--title-hover-soft", rgbToHex(...mix(rgb.slice(), white, 0.88)));
  set("--title-hover-ink", rgbToHex(...mix(rgb.slice(), black, 0.3)));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", rgbToHex(...rgb));

  /* मिनी न्युबारको रङ document दराजमा — त्यसैबाट साइडबारका अङ्क पनि
     उही रङमा आउँछन् (पहिले .mini-nav element मा मात्र थियो, त्यसैले
     header भित्रकै चल्ने CSS var बाहिर पुग्दैनथ्यो)। */
  const nav = rgbToHex(...rgb);
  set("--mini-nav", nav);
  set("--mini-nav-ink", rgbToHex(...readable(rgb.slice(), "light")));
  set("--mini-nav-soft", rgbToHex(...mix(rgb.slice(), white, 0.9)));
}

export function SiteProvider({ children }) {
  const [site, setSite] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [color, setColor] = useState(defaultFooter.mini_navbar_color);
  useEffect(() => {
    let on = true;
    getFooterData()
      .then((f) => {
        if (!on) return;
        setSite(f || {});
        setColor((f && f.mini_navbar_color) || defaultFooter.mini_navbar_color);
      })
      .catch(() => {})
      .finally(() => on && setLoaded(true));
    return () => { on = false; };
  }, []);
    useEffect(() => { applyBrandColor(color); }, [color]);

    /* मिनी न्युभार र फुटर ब्यानरको पृष्ठभूमि फोटो — backend बाट आउँछ।
       CSS दुवै ठाउँमा var(--navbarbg) प्रयोग गर्छ। */
    useEffect(() => {
      document.documentElement.style.setProperty(
        "--navbarbg",
        `url(${absoluteUrl("/navbarbg/navbarbg.png")})`
      );
    }, []);
  return <C.Provider value={{ site, setSite, loaded }}>{children}</C.Provider>;
}

export const useSite = () => useContext(C) || { site: {}, setSite: () => {}, loaded: false };