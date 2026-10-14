const express = require("express");
const { SiteSettingModel } = require("../models/superAdmin");
const { PollModel, ScoreboardModel } = require("../models/content");
const ChangeRequestModel = require("../models/changeRequest");
const alert = require("../controllers/alert");

/**
 * v2 · सार्वजनिक endpoint — बिना लगइन।
 * साइटले पोल, स्कोरबोर्ड, न्युबार र मर्मत अवस्था यहीबाट पढ्छ।
 */
const router = express.Router();

/** म्याद सकेपछि वा निर्णय भइसकेपछि पुरानो payload नदेखाउने */
const safeView = (r) => {
  if (!r) return null;
  const { payload, ...rest } = r;
  return { ...rest, payload: r.status === "pending" ? payload : undefined };
};

/** OTP verify बाट लौकिने (बारम्बार कोशिका गर्न नदिने) */
const rate = new Map();
const rateOk = (ip) => {
  const now = Date.now();
  const rec = rate.get(ip);
  if (rec && now - rec.start < 60000 && rec.count >= 20) return false;
  if (!rec || now - rec.start >= 60000) rate.set(ip, { start: now, count: 1 });
  else rec.count++;
  return true;
};

/** मर्मत मोड + फिचर टगल — सानो पेग (साइट लोड हुनेबेला नै चाहिन्छ) */
router.get("/public/config", async (req, res) => {
  try {
    const s = await SiteSettingModel.all();
    let nav = [];
    try { nav = JSON.parse(s.nav_buttons || "[]"); } catch (e) { nav = []; }
    res.json({
      maintenance_on: !!s.maintenance_on,
      maintenance_msg: s.maintenance_msg || "",
      show_patro: !!s.show_patro,
      show_dark_mode: !!s.show_dark_mode,
      nav_buttons: nav,
      copyright: s.copyright || "",
      powered_by: s.powered_by || "",
      marquee_color: s.marquee_color || "#064e3b",
    });
  } catch (e) {
    res.json({ maintenance_on: false, show_patro: true, show_dark_mode: true, nav_buttons: [], marquee_color: "#064e3b" });
  }
});

/** सक्रिय पोलहरू (साइडबारमा देखिने) */
router.get("/public/polls", async (req, res) => {
  try {
    const all = await PollModel.list();
    res.json(all.filter((p) => p.is_active && p.show_in_sidebar));
  } catch (e) {
    res.json([]);
  }
});

/** एकजना मानिसले एकपटक मात्र मतदान */
router.post("/public/polls/:id/vote", async (req, res) => {
  try {
    const { option_id, voter_key } = req.body || {};
    if (!option_id || !voter_key) {
      return res.status(400).json({ message: "विकल्प छान्नुहोस्" });
    }
    const r = await PollModel.vote(Number(req.params.id), Number(option_id), String(voter_key).slice(0, 80));
    if (!r.ok) return res.status(409).json(r);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: "मतदान गर्न सकिएन" });
  }
});

/** सक्रिय स्कोरबोर्ड (खेल पेजको फ्लोटिङ बक्सका लागि) */
router.get("/public/scores", async (req, res) => {
  try {
    res.json(await ScoreboardModel.list(true));
  } catch (e) {
    res.json([]);
  }
});

/* ==========================================================
   परिवर्तन अनुमति — इमेलको लिंक थिच्दा यही खुल्छ
   ========================================================== */

/** अनुरोधको विवरण हेर्नुहोस् (अनुमति दिने/नदिने popup मा देखिने) */
router.get("/public/change/:key", async (req, res) => {
  try {
    const r = await ChangeRequestModel.byKey(req.params.key);
    if (!r) return res.status(404).json({ message: "यो अनुरोध भेटिएन वा म्याद सकिएको छ।" });
    res.json(safeView(r));
  } catch (e) {
    res.status(400).json({ message: "अनुरोध हेर्न सकिएन।" });
  }
});

/** OTP लेखेर मिलाउने — मिलेपछि मात्र admins टेबल बदलिन्छ */
router.post("/public/change/:key/verify", async (req, res) => {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim()
    || (req.socket && req.socket.remoteAddress) || "?";
  if (!rateOk(ip)) {
    return res.status(429).json({ ok: false, message: "धेरै कोशिका भयो। एक मिनेटपछि प्रयास गर्नुहोस्।" });
  }

  try {
    const r = await ChangeRequestModel.verify(req.params.key, (req.body || {}).otp);
    const before = await ChangeRequestModel.byKey(req.params.key);

    /* नजिकको नतिजा इमेलमा पठिन्छ — कसले के गर्यो थाहा हुन्छ */
    if (r.ok || r.code === "failed") {
      await alert.notify(
        r.ok ? "OTP मिल्यो — परिवर्तन लागू भयो" : "OTP बारम्बार गलत — अनुरोध रद्द",
        r.ok ? "warn" : "danger",
        [
          ["खाता", before ? before.admin_email : "—"],
          ["के", before ? before.summary : "—"],
          ["नतिजा", r.ok ? "OTP मिल्यो" : r.message],
          ["IP", ip],
          ["समय", new Date().toString()],
        ]
      );
    }

    res.status(r.ok ? 200 : r.code === "closed" || r.code === "failed" ? 409 : 400).json({
      ok: r.ok, message: r.message, request: safeView(r.request || before),
    });
  } catch (e) {
    res.status(400).json({ ok: false, message: "OTP जाँच गर्न सकिएन : " + e.message });
  }
});

/* ==========================================================
   बिर्सनुभएको पासवर्ड — ४ अङ्कको OTP बाट मात्र
   ========================================================== */
const FR_TTL = 30;      /* मिनेट */
const FR_TRIES = 5;
const frStore = new Map();

const frKeyOf = (email) => String(email || "").trim().toLowerCase();

/** पुरानो OTP हटाउने */
const clearFr = (email) => frStore.delete(frKeyOf(email));

router.post("/public/forgot/send", async (req, res) => {
  const email = frKeyOf((req.body || {}).email);
  if (!email) return res.status(400).json({ ok: false, message: "इमेल लेख्नुहोस्।" });

  const existing = frStore.get(email);
  if (existing && Date.now() - existing.at < 60000) {
    return res.status(429).json({ ok: false, message: "१ मिनेटपछि फेरि प्रयास गर्नुहोस्।" });
  }

  const { pool } = require("../../config/db");
  const [rows] = await pool.query(
    "SELECT id, email, name, role FROM admins WHERE email = ? LIMIT 1", [email]
  );
  if (!rows.length) {
    /* खाता छ कि छैन भन्ने नबताउने */
    return res.json({ ok: true, message: "यदि खाता भए यहाँ इमेल जान्छ।" });
  }

  const otp = String(require("crypto").randomInt(1000, 10000));
  const bcrypt = require("bcryptjs");
  const hash = await bcrypt.hash(otp, await bcrypt.genSalt(10));

  frStore.set(email, { otpHash: hash, tries: 0, at: Date.now(), until: Date.now() + FR_TTL * 60000 });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  await alert.notify("बिर्सनुभएको पासवर्ड — OTP", "warn", [
    ["खाता", `${rows[0].name} (${rows[0].email})`],
    ["भूमिका", rows[0].role || "admin"],
    ["OTP", otp],
    ["IP", ip],
    ["म्याद", `${FR_TTL} मिनेट`],
    ["नोट", "यो OTP इमेलमा मात्र छ — कसैलाई नदिनुहोस्।"],
  ]);

  res.json({ ok: true, message: "OTP मालिकको इमेलमा पठाइयो।", email: rows[0].email });
});

router.post("/public/forgot/reset", async (req, res) => {
  const email = frKeyOf((req.body || {}).email);
  const { otp, password } = req.body || {};
  const rec = frStore.get(email);

  if (!rec) return res.status(400).json({ ok: false, message: "OTP माग्नुहोस्।" });
  if (Date.now() > rec.until) {
    clearFr(email);
    return res.status(400).json({ ok: false, message: "OTP को म्याद सकियो। नयाँ OTP माग्नुहोस्।" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ ok: false, message: "नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।" });
  }

  const bcrypt = require("bcryptjs");
  const ok = await bcrypt.compare(String(otp || "").trim(), rec.otpHash);
  if (!ok) {
    rec.tries++;
    const dead = rec.tries >= FR_TRIES;
    if (dead) clearFr(email);
    return res.status(400).json({
      ok: false,
      message: dead ? `OTP ${FR_TRIES} पटक गलत — पुनः OTP माग्नुहोस्।` : `OTP मिलेन। बाँकी ${FR_TRIES - rec.tries} पटक।`,
    });
  }

  const AdminModel = require("../../models/AdminModel");
  await AdminModel.setPasswordByEmail(email, String(password));
  clearFr(email);

  await alert.notify("बिर्सनुभएको पासवर्ड OTP बाट बदलियो", "danger", [
    ["खाता", email],
    ["IP", String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?"],
    ["समय", new Date().toString()],
  ]);

  res.json({ ok: true, message: "पासवर्ड बदलियो। अब नयाँ पासवर्डले लगइन गर्नुहोस्।" });
});

module.exports = router;
