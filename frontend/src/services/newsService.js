import { api, absoluteUrl } from "./api";
import { nepaliDate } from "../utils/formatDate";
import { newestFirst } from "../utils/sortNews";
import { stripFragments, htmlToText } from "../utils/cleanHtml";

export const categories = [
  { name: "समाचार", path: "/news" },
  { name: "विश्व", path: "/world" },
  { name: "स्थानीय तह", path: "/local-level" },
  { name: "कला", label: "कला/मनोरञ्जन", path: "/art" },
  { name: "राजनीति", path: "/politics" },
  { name: "विचार", path: "/opinion" },
  { name: "खेलकुद", path: "/sports" },
  { name: "विविध", path: "/miscellaneous" }
];

export const defaultFooter = {
  description:
    "विश्वसनीय समाचार, तथ्यमा आधारित विश्लेषण र नेपाली समाजका आवाजहरूलाई एउटै डिजिटल घरमा जोड्ने आधुनिक समाचार पोर्टल।",
  email: "hello@nagariknews.example",
  phone: "+९७७ १ ४१२३४५६",
  facebook: "https://facebook.com/nagariknews",
  instagram: "https://instagram.com/nagariknews",
  youtube: "https://youtube.com/nagariknews",
  logo: "",
  motto: "निष्पक्ष र विश्वसनीय पत्रकारिता",
  editor: "सम्पादक: कृष्णप्रसाद मरासिनी / ९८४१३७२४६०",
  registration: "दर्ता प्रमाणपत्र नं.: ३१३१-२०७८/७९",
  press_council: "प्रेस काउन्सिल नं.: ३१४७-२०७८/७९",
  company_reg: "कम्पनी रजिस्टरको कार्यालय.: २७०१६९/०७८/०७९",
  mini_navbar_color: "#1e3a8a",
  marquee_color: "#064e3b"
};

/**
 * मिति देखाउने — तीन तरका मान हुन सक्छन् :
 *  1) DB मा राखिएको नेपाली मिति (जस्तै "२४ असोज २०८३") → सिधै देखाउने
 *  2) ISO/DATETIME ("2026-10-10 16:16:56" वा "…T…Z")       → BS मा बदल्ने
 *  3) बिग्रिएको/खाली मान                            → created_at बाट बनाउने
 *
 * नोट : "T" र "Z" वालाई हटाउनुपर्छ, नत्र Safari/Chrome ले NaN दिन्छ।
 */
const parseAnyDate = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  // ISO : "2026-10-10T16:16:56.000Z" -> "2026/10/10 16:16:56"
  const iso = /^(\d{4})-(\d{2})-(\d{2})T([\d:.]+)Z?$/.exec(s);
  if (iso) {
    const [, y, mo, d, t] = iso;
    return new Date(`${y}/${mo}/${d} ${t.slice(0, 8)}`);
  }
  const t = s.replace(/-/g, "/");
  const dt = new Date(t);
  return isNaN(dt.getTime()) ? null : dt;
};

const displayDate = (n) => {
  const raw = String(n.date || "").trim();
  // नेपाली मिति (देवनागरी अंक भएको) भइसकेको भए सिधै देखाउने
  if (raw && /[०-९]/.test(raw)) return raw;
  const d = parseAnyDate(raw);
  if (d) return nepaliDate(d);
  // नपढ्ने भए created_at बाट बनाउने — कहिल्यै खाली मिति नदेखाउने
  const c = parseAnyDate(n.created_at);
  return c ? nepaliDate(c) : "";
};

const normalizeNews = (n, { light = false } = {}) => {
  // light मा content आउँदैन — content_head (summary बनाउनको टुक्रा) मात्र
  const rawContent = light ? "" : stripFragments(n.content || "");
  const headText = light ? htmlToText(n.content_head || "") : "";
  const created = parseAnyDate(n.created_at);
  return {
    id: String(n.id),
    slug: n.slug || `news-${n.id}`,
    title: n.title,
    subtitle: n.subtitle || "",
    category: n.category,
    image: absoluteUrl(n.image),
    date: displayDate(n),
    author: n.author || "नागरिक जागरण",
    author_photo: absoluteUrl(n.author_photo || ""),
    yt_link: n.yt_link || "",
    tags: n.tags || "",
    status: n.status || "published",
    // subtitle नभए सारांश देखाउने — HTML ट्याग पनि हटाएर सादा पाठ मात्र
    summary:
      n.summary ||
      n.subtitle ||
      htmlToText(rawContent || headText).slice(0, 150) ||
      "",
    content: rawContent,
    readingTime: n.reading_time || "3 मिनेट",
    view_count: Number(n.view_count || 0),
    click_count: Number(n.click_count || 0),
    // "नयाँ समाचार माथि" क्रम बनाउन
    created_at: created
  };
};

let allNewsPromise = null;
export const clearNewsCache = () => { allNewsPromise = null; };
export const getAllNews = () => {
  if (!allNewsPromise) {
    allNewsPromise = api
      .get("/news?status=published&light=1")
      .then((r) => (Array.isArray(r) ? newestFirst(r.map((n) => normalizeNews(n, { light: true }))) : []))
      .catch(() => []);
  }
  return allNewsPromise;
};

let categoryPromises = {};
export const getNewsByCategory = (category) => {
  if (!categoryPromises[category]) {
    categoryPromises[category] = api
      .get(`/news?category=${encodeURIComponent(category)}&status=published&light=1`)
      .then((r) => (Array.isArray(r) ? newestFirst(r.map((n) => normalizeNews(n, { light: true }))) : []))
      .catch(() => []);
  }
  return categoryPromises[category];
};
export const clearCategoryCache = () => { categoryPromises = {}; };

export const getNewsById = async (id) => {
  try {
    const r = await api.get(`/news/${id}`);
    return r && r.id ? normalizeNews(r) : null;
  } catch (e) {
    return null;
  }
};

export const getComments = async (id) => {
  try {
    const r = await api.get(`/news/${id}/comments`);
    return Array.isArray(r) ? r : [];
  } catch (e) {
    return [];
  }
};

export const addComment = async (id, { name, comment }) => {
  const r = await api.post(`/news/${id}/comments`, { name, comment });
  return r;
};

export const searchNews = async (q) => {
  try {
    const r = await api.get(`/news?q=${encodeURIComponent(q)}&light=1`);
    return Array.isArray(r) ? newestFirst(r.map((n) => normalizeNews(n, { light: true }))) : [];
  } catch (e) {
    return [];
  }
};

export const getFooterData = async () => {
  try {
    const r = await api.get("/footer");
    return r && r.id ? r : { ...defaultFooter };
  } catch (e) {
    return { ...defaultFooter };
  }
};

export const getAds = async (position = "") => {
  try {
    const r = await api.get(`/ads${position ? `?position=${encodeURIComponent(position)}` : ""}`);
    if (!Array.isArray(r)) return [];
    const list = r
      .filter((a) => Number(a.enabled) === 1)
      .map((a) => ({ ...a, image: absoluteUrl(a.image), enabled: Number(a.enabled) === 1 }));
    return list;
  } catch (e) {
    console.error(`[ads] "${position}" स्लटका विज्ञापन लोड गर्न सकिएन:`, e.message || e);
    return [];
  }
};

export const subscribeEmail = async (email) => {
  const r = await api.post("/subscribers", { email });
  return r;
};

export const getReels = async () => {
  try {
    const r = await api.get("/reels");
    return Array.isArray(r) ? r : [];
  } catch (e) {
    return [];
  }
};

export const getHeaderPhoto = async () => {
  try {
    const r = await api.get("/header-photo");
    return (r && r.photo) ? absoluteUrl(r.photo) : "";
  } catch (e) {
    return "";
  }
};

export const getTeam = async () => {
  try {
    const r = await api.get("/team");
    return Array.isArray(r) ? r.map((m) => ({ ...m, photo: absoluteUrl(m.photo) })) : [];
  } catch (e) {
    return [];
  }
};

export const sendContact = async (data) => {
  const r = await api.post("/contacts", data);
  return r;
};

export const getTrendingNews = async (limit = 5, days = 30) => {
  try {
    const r = await api.get(`/news/trending?limit=${limit}&days=${days}`);
    // normalizeNews नगरे फोटोको path सापेक्षिक (relative) रहन्छ,
    // जसले browser ले frontend origin मा खोजेर 404 दिन्छ — त्यसैले अनिवार्य map गर्ने
    return Array.isArray(r) ? r.map((n) => normalizeNews(n, { light: true })) : [];
  } catch (e) {
    return [];
  }
};

export const incrementNewsView = async (id) => {
  try {
    await api.post(`/news/${id}/view`);
  } catch (e) {}
};

export const incrementNewsClick = async (id) => {
  try {
    await api.post(`/news/${id}/click`);
  } catch (e) {}
};

export const incrementAdView = async (id) => {
  try {
    await api.post(`/ads/${id}/view`);
  } catch (e) {}
};

export const incrementAdClick = async (id) => {
  try {
    await api.post(`/ads/${id}/click`);
  } catch (e) {}
};

export const getPatro = async () => {
  try {
    const r = await api.get("/patro");
    return r || null;
  } catch (e) {
    return null;
  }
};

// भिजिटर गणना — सर्भरले दिनमा एकपटक मात्र गन्ने गर्छ
export const trackVisit = async (path) => {
  try {
    await api.post("/track", {
      path: path || (typeof window !== "undefined" ? window.location.pathname : ""),
      referrer: typeof document !== "undefined" ? document.referrer || "" : ""
    });
  } catch (e) {}
};
