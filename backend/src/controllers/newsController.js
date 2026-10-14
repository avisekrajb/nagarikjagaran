const NewsModel = require("../models/NewsModel");
const NewsValidator = require("../validators/NewsValidator");
const { pickNewsImage } = require("../services/imageService");
const readingTime = require("../utils/readingTime");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");
const cache = require("../utils/cache");

/** query बाट cache key (क्रम मिलाएर, ताकि एउटै key दोहोरिने) */
const keyOf = (o) =>
  Object.keys(o)
    .filter((k) => o[k] !== undefined && o[k] !== "" && o[k] !== null)
    .sort()
    .map((k) => `${k}=${o[k]}`)
    .join("&");

/**
 * सूची — ३० सेकेन्डको in-memory cache।
 * सबै पेजले यही एउटै क्वेरी हान्छन् (light=1), त्यसैले डाटाबेसलाई
 * एउटै मात्र query पर्न सक्छ। एडमिनले समाचार बदल्दा `app.js` ले
 * "news:*" key हटाउँछ।
 */
const LIST_TTL = cache.S(30);

const list = asyncHandler(async (req, res) => {
  const q = {
    category: req.query.category,
    q: req.query.q,
    status: req.query.status,
    // ?light=1 — कार्ड/सूचीका लागि content बिनाको हल्को संस्करण
    light: req.query.light === "1" || req.query.light === "true"
  };

  const key = `news:list:${keyOf({ ...q, light: q.light ? 1 : 0 })}`;
  const hit = cache.get(key);
  if (hit !== undefined) return res.json(hit);

  const rows = await NewsModel.find(q);
  cache.set(key, rows, LIST_TTL);
  res.json(rows);
});

const getOne = asyncHandler(async (req, res) => {
  const row = await NewsModel.findById(req.params.id);
  if (!row) return res.status(404).json({ message: "समाचार भेटिएन" });
  res.json(row);
});

const incrementView = asyncHandler(async (req, res) => {
  await NewsModel.incrementView(req.params.id);
  res.json({ ok: true });
});

const incrementClick = asyncHandler(async (req, res) => {
  await NewsModel.incrementClick(req.params.id);
  res.json({ ok: true });
});

/** ट्रेन्डिङ — ६० सेकेन्ड cache (view/click बदलिँदा अलि ढिलो देखिन्छ) */
const TREND_TTL = cache.S(60);

const trending = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const days = parseInt(req.query.days) || 30;
  const key = `news:trending:${limit}:${days}`;

  const hit = cache.get(key);
  if (hit !== undefined) return res.json(hit);

  const rows = await NewsModel.findTrending(limit, days);
  cache.set(key, rows, TREND_TTL);
  res.json(rows);
});

// एडमिन प्यानल : पेज-वाइज़ पागिनेसन + खोज + श्रेणी गणना (सबै वास्तविक डाटा)
const manage = asyncHandler(async (req, res) => {
  const row = await NewsModel.manage({
    page: req.query.page,
    limit: req.query.limit,
    q: String(req.query.q || "").trim(),
    category: String(req.query.category || "").trim()
  });
  res.json(row);
});

const create = asyncHandler(async (req, res) => {
  const err = NewsValidator.create(req.body || {});
  if (err) return res.status(400).json({ message: err });

  const b = req.body;
  const row = await NewsModel.create({
    title: String(b.title).trim(),
    subtitle: b.subtitle,
    summary: b.summary || b.subtitle,
    content: b.content,
    category: String(b.category).trim(),
    image: pickNewsImage(req),
    date: b.date,
    author: b.author || "नागरिक जागरण",
    author_photo: b.author_photo,
    yt_link: b.yt_link,
    tags: b.tags,
    status: b.status === "draft" ? "draft" : "published",
    reading_time: b.reading_time || readingTime(b.content)
  });
  res.json(row);
  await logChange(req, "news_create", "news", `नयाँ समाचार — ${b.title}`);
});

const update = asyncHandler(async (req, res) => {
  const b = req.body;
  const existing = await NewsModel.findById(req.params.id);
  const row = await NewsModel.update(req.params.id, {
    title: b.title,
    subtitle: b.subtitle,
    summary: b.summary || b.subtitle,
    content: b.content,
    category: b.category,
    image: req.file ? pickNewsImage(req) : String(b.image || b.imageUrl || existing?.image || ""),
    date: b.date,
    author: b.author || "नागरिक जागरण",
    author_photo:
      b.author_photo ||
      String(b.authorImageUrl || existing?.author_photo || ""),
    yt_link: b.yt_link,
    tags: b.tags,
    status: b.status === "draft" ? "draft" : "published",
    reading_time: b.reading_time || readingTime(b.content)
  });
  res.json(row || { message: "updated" });
  await logChange(req, "news_update", "news", `समाचार सम्पादन — ${b.title || existing?.title || ""}`);
});

const remove = asyncHandler(async (req, res) => {
  const existing = await NewsModel.findById(req.params.id);
  await NewsModel.remove(req.params.id);
  res.json({ ok: true });
  await logChange(req, "news_delete", "news", `समाचार मेटियो — ${existing?.title || req.params.id}`);
});

module.exports = { list, getOne, manage, create, update, remove, incrementView, incrementClick, trending };