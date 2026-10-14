/**
 * हाम्रो पात्रो API को जवाफ कहिल्यै एउटै ढाँचाको हुँदैन — विभिन्न endpoint
 * फरक-फरक key दिन्छन्। त्यसैले यहाँ धेरै संभावित नाम परीक्षण गरिन्छ।
 */

const iso = (y, m, d) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const num = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const fromGregorian = (v) => {
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
};

const firstString = (obj, keys) => {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim() && v.trim() !== "-") return v.trim();
  }
  return "";
};

/** कुनै पनि object बाट मिति निकाल्ने प्रयास */
function pickDate(entry) {
  // सिधै AD
  const ad =
    firstString(entry, ["date", "date_ad", "ad", "gregorian", "englishDate", "solarDate", "todayDate", "date_en"]) ||
    "";
  const adNum = num(ad);
  if (adNum && adNum > 1000000) {
    // unix seconds/ms
    const ms = adNum > 9999999999 ? adNum : adNum * 1000;
    const isoDate = fromGregorian(ms);
    if (isoDate) return { holiday_date: isoDate };
  }
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(ad)) {
    const [y, m, d] = ad.split("-");
    const mm = num(m);
    const dd = num(d);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return { holiday_date: iso(num(y), mm, dd) };
    }
  }

  // विक्रम सम्वत्
  const by = num(firstString(entry, ["year", "bs_year", "bsYear", "nepaliYear", "date_np_year", "y"]));
  const bm = num(firstString(entry, ["month", "bs_month", "bsMonth", "date_np_month", "m"])) ||
    num(entry.date_np);
  const bd = num(firstString(entry, ["day", "date_np_day", "bd", "tithi_day"]));
  if (by && bm && bd) {
    // महिना नाम भए अनुक्रमणिकामा खोज्ने प्रयास
    return { bs_year: String(by), bs_month: String(bm), bs_day: String(bd) };
  }
  return {};
}

const MONTH_WORDS = [
  "baishakh", "baisakh", "jestha", "ashadh", "ashad", "shrawan", "bhadra", "ashwin",
  "kartik", "mangsir", "poush", "magh", "falgun", "phagun", "chaitra", "chait"
];

const monthIndexFromWord = (w) => {
  const i = MONTH_WORDS.findIndex((m) => w.includes(m));
  return i === -1 ? null : i % 12;
};

/** महिनाको नामबाट अनुक्रमणिका */
function pickBsMonth(entry) {
  const w = firstString(entry, [
    "month", "bs_month", "bsMonth", "date_np_month", "monthName", "month_name", "m"
  ]).toLowerCase();
  const n = monthIndexFromWord(w);
  return n === null ? null : n;
}

/** एउटा entry बाट बिदा record बनाउने */
function normalizeEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const title =
    firstString(entry, [
      "title", "name", "event", "festival", "holiday", "holiday_name",
      "event_name", "eventName", "description", "desc", "title_np"
    ]) || "";

  if (!title) return null;

  const out = { title: title.slice(0, 160) };
  Object.assign(out, pickDate(entry));

  const bm = pickBsMonth(entry);
  if (bm !== null && out.bs_month === undefined) out.bs_month = String(bm);
  if (out.bs_year && out.bs_month && out.bs_day) {
    out.description = `वि.सं. ${out.bs_year}-${String(out.bs_month).padStart(2, "0")}-${String(out.bs_day).padStart(2, "0")}`;
  }

  if (!out.holiday_date && !(out.bs_year && out.bs_month && out.bs_day)) return null;
  return out;
}

/** जुनसुकै गहिराइको array भित्रका entry हरू खोज्ने */
function walk(node, depth = 0, acc = []) {
  if (!node || depth > 6) return acc;
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, depth + 1, acc));
    return acc;
  }
  if (typeof node !== "object") return acc;

  if (normalizeEntry(node)) acc.push(node);
  Object.values(node).forEach((v) => {
    if (Array.isArray(v)) walk(v, depth + 1, acc);
    else if (v && typeof v === "object") walk(v, depth + 1, acc);
  });
  return acc;
}

/** जम्मा payload बाट बिदा/पर्वहरू निकाल्ने */
function extract(payload) {
  if (!payload) return [];
  const raw = walk(payload);
  const seen = new Set();
  const out = [];
  raw.forEach((e) => {
    const item = normalizeEntry(e);
    if (!item) return;
    const key = `${item.holiday_date || ""}|${item.bs_year || ""}-${item.bs_month || ""}-${item.bs_day || ""}|${item.title}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });
  return out;
}

/** आजको तिथि/नक्षत्र/सूर्योदय जस्तो सूचना */
function extractToday(payload) {
  const out = {};
  const find = (keys) => {
    let found = null;
    const scan = (node, depth = 0) => {
      if (found || !node || depth > 5) return;
      if (typeof node === "string") return;
      if (Array.isArray(node)) { node.forEach((n) => scan(n, depth + 1)); return; }
      if (typeof node !== "object") return;
      for (const k of keys) {
        const v = node[k];
        if (typeof v === "string" && v.trim() && v.trim() !== "-") { found = v.trim(); return; }
      }
      Object.values(node).forEach((v) => { if (v && typeof v === "object") scan(v, depth + 1); });
    };
    scan(payload);
    return found || "";
  };

  out.tithi = find(["tithi", "tithi_np", "tithiName", "tithi_name", "titA"]);
  out.nakshatra = find(["nakshatra", "naksatra", "naksha", "nakshatra_np", "nakshatraName"]);
  out.sunrise = find(["sunrise", "suryodaya", "sun_rise", "sunrise_np"]).replace(/^(\d{1,2})(\d{2})$/, "$1:$2");
  out.sunset = find(["sunset", "suryastha", "sun_set", "sunset_np"]).replace(/^(\d{1,2})(\d{2})$/, "$1:$2");
  out.paksha = find(["paksha", "paksha_np", "fortnight"]);
  out.festival = find(["festival", "holiday", "event", "parv", "festival_np", "holiday_np"]);
  return out;
}

module.exports = { extract, extractToday, normalizeEntry };
