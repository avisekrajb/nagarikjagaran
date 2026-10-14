const express = require("express");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const { uploadPath } = require("./config");
const cache = require("./utils/cache");


const app = express();
app.use(cors());
// JSON/छवि gzip — पहिले २५१ KB हुने सूची अहिले ~१५ KB मा जान्छ
app.use(compression());
app.use(express.json({ limit: "12mb" }));

fs.mkdirSync(uploadPath, { recursive: true });
app.use("/uploads", express.static(uploadPath, { maxAge: "30d", immutable: true }));

/* मिनी न्युभारको पृष्ठभूमि फोटो — backend/src/navbarbgphoto/navbarbg.png
   /navbarbg/navbarbg.png बाट सेवा हुन्छ (frontend ले CSS variable मा हाल्छ)। */
app.use("/navbarbg", express.static(path.join(__dirname, "navbarbgphoto"), { maxAge: "7d" }));

/* ------------------------------------------------------------------
   HTTP cache : पब्लिक GET API हरूमा।
   Browser ले ETag मिलाएर 304 (body खाली) पाउँछ — revalidation मा
   पूरै payload तान्नु पर्दैन।
   ------------------------------------------------------------------ */
app.use("/api", (req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/manage") && !req.path.startsWith("/admin")) {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
  }
  next();
});

/* ------------------------------------------------------------------
   सानो in-memory TTL cache — पब्लिक GET हरूका लागि।
   हरेक पेजमा sidebar/ticker/banner/footer बारम्बार एउटै endpoint
   (ads, patro, footer, watermark, reels, categories) हुन्छन्। तिनलाई
   केही सेकेन्ड cache ले धेरै डाटाबेस query बचाउँछ।
   POST/PUT/DELETE आएमा app.js ले सम्बन्धित key हटाउँछ।
   ------------------------------------------------------------------ */
const CACHEABLE = new Set([
  "/api/ads",
  "/api/patro",
  "/api/footer",
  "/api/watermark",
  "/api/reels",
  "/api/team",
  "/api/header-photo",
]);

const TTL = {
  "/api/ads": cache.S(30),
  "/api/patro": cache.S(300),
  "/api/footer": cache.S(120),
  "/api/watermark": cache.S(120),
  "/api/reels": cache.S(60),
  "/api/team": cache.S(120),
  "/api/header-photo": cache.S(300),
};

app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  const path = req.path.replace(/\/+$/, "") || "/";
  const base = path.split("?")[0];
  if (!CACHEABLE.has(base)) return next();

  const key = `get:${req.originalUrl}`;
  const hit = cache.get(key);
  if (hit !== undefined) {
    res.set("X-Cache", "HIT");
    return res.json(hit);
  }

  /* मूल res.json हराएर cache मा राख्ने */
  const orig = res.json.bind(res);
  res.json = (body) => {
    cache.set(key, body, TTL[base] || cache.S(60));
    res.set("X-Cache", "MISS");
    return orig(body);
  };
  return next();
});

/* लेख्ने काम भएपछि सम्बन्धित cache हटाउने — एडमिनले बदले तुरुन्त देखिन्छ */
const PURGE = {
  news: ["news:", "get:/api/news"],
  reels: ["reels:", "get:/api/reels"],
  ads: ["ads:", "get:/api/ads"],
  patro: ["patro:", "get:/api/patro"],
  footer: ["footer:", "get:/api/footer"],
  watermark: ["watermark:", "get:/api/watermark"],
  team: ["team:", "get:/api/team"],
  "header-photo": ["headerPhoto:", "get:/api/header-photo"],
};
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const seg = req.path.split("/").filter(Boolean);
    const hit = PURGE[seg[1]];
    if (hit) hit.forEach((k) => cache.invalidate(k));
    /* /api/news/:id/view जस्ता गणना — सूची cache बिगार्नु हुँदैन, तर safe */
  }
  next();
});

/* ---- v2 : सुपर एडमिनका route ---- */
app.use("/api/superadmin", require("./v2/routes/super"));
app.use("/api/supersuper", require("./v2/routes/supersuper"));
app.use("/api/v2", require("./v2/routes/public"));

/* ==========================================================
   🔐 Hardcoded खाता seed (साँछेदारको database मा पनि आफैँ बस्छन्)
   admincred · superadmincred · supersuperadmincred
   ========================================================== */
require("./controllers/password").ensureSeeded();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admins", require("./routes/admins"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/track", require("./routes/track"));
app.use("/api/news/:id/comments", require("./routes/comments"));
app.use("/api/comments", require("./routes/commentAdmin"));
app.use("/api/news", require("./routes/news"));
app.use("/api/manage/news", require("./routes/manageNews"));
app.use("/api/ads", require("./routes/ads"));
app.use("/api/footer", require("./routes/footer"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/subscribers", require("./routes/subscribers"));
app.use("/api/reels", require("./routes/reels"));
app.use("/api/header-photo", require("./routes/headerPhoto"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/team", require("./routes/team"));
app.use("/api/patro", require("./routes/patro"));
/* GET सार्वजनिक (पानामा watermark चाहिन्छ) — PUT सुपर एडमिन मात्र (routes भित्रै gate) */
app.use("/api/watermark", require("./routes/watermark"));

app.get("/api/health", (req, res) => res.json({ ok: true, name: "nagarik-backend" }));

app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ message: err.message || "Server error" });
  next();
});

module.exports = app;