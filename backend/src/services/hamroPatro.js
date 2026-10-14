const https = require("https");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

function fetchHtml(url, ms = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": UA, "Accept-Language": "ne,en" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return fetchHtml(res.headers.location, ms).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error("http " + res.statusCode));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    req.setTimeout(ms, () => req.destroy(new Error("timeout")));
    req.on("error", reject);
  });
}

// विक्रम महिनाका नाम → ०-११ अनुक्रमणिका (साइटले अंग्रेजी नाम पठाउँछ)
const MONTH_INDEX = new Map();
[
  ["baishakh", 0], ["baisakh", 0], ["baishak", 0],
  ["jestha", 1], ["jeth", 1], ["jeshta", 1],
  ["ashadh", 2], ["ashad", 2], ["ashadh", 2],
  ["shrawan", 3], ["srawan", 3], ["shrawan", 3],
  ["bhadra", 4], ["bhadra", 4],
  ["ashwin", 5], ["ashwin", 5], ["ashwin", 5],
  ["kartik", 6], ["kartik", 6],
  ["mangsir", 7], ["mangsir", 7],
  ["poush", 8], ["poush", 8],
  ["magh", 9], ["magh", 9],
  ["falgun", 10], ["phagun", 10], ["falgun", 10],
  ["chaitra", 11], ["chait", 11], ["chaitra", 11]
].forEach(([name, idx]) => MONTH_INDEX.set(name, idx));

/** विक्रम महिना सँग मिल्ने गरी 'YYYY-M' क्रम सिर्जना गर्ने */
function bsSortKey(bsYear, bsMonth, bsDay) {
  const y = String(bsYear || "").padStart(4, "0");
  const m = String((Number(bsMonth) || 0) + 1).padStart(2, "0");
  const d = String(bsDay || "").padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** पेजको grid label बाट वर्तमानको विक्रम महिना: aria-label="Ashwin 2083" */
function pageMonth(html) {
  const m = html.match(/aria-label="([A-Za-z]+)\s+(\d{4})"/);
  if (!m) return null;
  const idx = MONTH_INDEX.get(m[1].toLowerCase());
  if (idx === undefined) return null;
  return { year: Number(m[2]), month: idx, name: m[1] };
}

/**
 * हरेक दिनको <a> मा aria-label ले दिन, तिथि र नाम दिन्छ:
 *   aria-label="28, द्वितीया, दर खाने दिन, holiday"
 * र href ले त्यो दिनको **साँच्चिकै** विक्रम महिना दिन्छ:
 *   href="/calendar/2083/5?d=2083-5-28"
 *
 * ग्रिडमा छेउछाउको महिनाका दिन पनि हुन्छन् (पृष्ठको label="Ashwin" भए पनि
 * सुरुका २८-३१ जस्ता दिन भदौका हुन्)। त्यसैले महिना प्रत्येक दिनको href बाट
 * लिनुपर्छ — पृष्ठको महिना मात्र भर पऱे सीमान्तका पर्वहरू गलत महिनामा पर्छन्
 * (जस्तै हरितालिका तीज भदौमा हुनुपर्ने असोजमा, संविधान दिवस दोहोरिने)।
 */
const DAY_TAG_RE = /<a\b([^>]*)>/g;
const ARIA_RE = /aria-label="([^"]*)"/;
const HREF_D_RE = /[?&]d=(\d{4})-(\d{1,2})-(\d{1,2})/;

/**
 * नतिजा: [{ title, bs_year, bs_month(0-11), bs_day, description, tithi }]
 * मिति गणित यहाँ हुँदैन — त्यो frontend को प्राधिकृतिक तालिकाले गर्छ।
 */
function parseMonth(html) {
  const out = [];
  const page = pageMonth(html);
  const seen = new Set();
  let m;
  DAY_TAG_RE.lastIndex = 0;
  while ((m = DAY_TAG_RE.exec(html)) !== null) {
    const attrs = m[1];
    const aria = attrs.match(ARIA_RE);
    if (!aria) continue;

    /* "दिन, तिथि, नाम(हरू)..., holiday" */
    const parts = aria[1].match(/^(\d{1,2})\s*,\s*([^,]*),\s*([\s\S]*?),\s*holiday\s*$/);
    if (!parts) continue;

    const day = Number(parts[1]);
    if (!day) continue;
    const tithi = (parts[2] || "").trim();
    const names = (parts[3] || "").trim();
    if (!names || /^[-–—]$/.test(names)) continue;

    /* महिना/वर्ष प्रत्येक दिनको href बाट — सीमान्तका दिन पनि सही हुन्छन् */
    const d = attrs.match(HREF_D_RE);
    const year = d ? Number(d[1]) : (page ? page.year : null);
    const month = d ? Number(d[2]) - 1 : (page ? page.month : null);
    if (year == null || month == null || month < 0 || month > 11) continue;

    const full = tithi ? `${names} (${tithi})` : names;

    names.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean).forEach((title) => {
      const key = `${year}-${month}-${day}|${title}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        title: title.slice(0, 160),
        bs_year: String(year),
        bs_month: String(month),
        bs_day: String(day),
        description: full.slice(0, 250),
        tithi
      });
    });
  }
  return { page, items: out };
}

/** URL segment = monthIndex + 1 (मसिनाको URL महिना १-१२ हुन्छ) */
async function fetchMonth(bsYear, bsMonth) {
  const url = `https://www.hamropatro.com/calendar/${bsYear}/${bsMonth + 1}`;
  const html = await fetchHtml(url);
  const { page, items } = parseMonth(html);
  return {
    url,
    requested: { year: bsYear, month: bsMonth },
    page,
    // साइटले अर्को महिना देखाएमा त्यही मान्ने
    year: page ? page.year : bsYear,
    month: page ? page.month : bsMonth,
    items
  };
}

const shiftMonth = (year, month, delta) => {
  let m = month + delta;
  let y = year;
  while (m > 11) { m -= 12; y += 1; }
  while (m < 0) { m += 12; y -= 1; }
  return { year: y, month: m };
};

/**
 * दिइएको विक्रम महिनाबाट count महिना ल्याउने।
 * 'from' नदिइमा पहिलो महिना नै छोडिदिन्छ (पुरानो डाटा नथपिने होइन, गति हुन्छ)।
 */
async function fetchRange({ year, month, count = 12 } = {}) {
  if (!year || month === undefined || month === null) {
    throw new Error("विक्रम वर्ष र महिना दिनुपर्छ");
  }
  const months = [];
  for (let i = 0; i < Math.max(1, Math.min(36, Number(count) || 12)); i += 1) {
    months.push(shiftMonth(Number(year), Number(month), i));
  }

  const results = [];
  const errors = [];
  for (const m of months) {
    try {
      // eslint-disable-next-line no-await-in-loop
      results.push(await fetchMonth(m.year, m.month));
    } catch (e) {
      errors.push(`${m.year}/${m.month + 1}: ${e.message}`);
    }
  }

  return {
    months: results,
    errors,
    total: results.reduce((a, r) => a + r.items.length, 0)
  };
}

module.exports = { fetchMonth, fetchRange, parseMonth, fetchHtml, pageMonth, bsSortKey };
