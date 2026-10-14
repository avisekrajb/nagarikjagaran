const crypto = require("crypto");
const VisitorModel = require("../models/VisitorModel");
const asyncHandler = require("../utils/asyncHandler");

const deviceOf = (req) => {
  const ua = String(req.headers["user-agent"] || "");
  if (/mobile|android|iphone|ipod|windows phone/i.test(ua)) return "mobile";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  return "desktop";
};

// गुमनाम मात्र — IP नै होइन, hash गरिएको कुचला (गोपनीयता)
const visitorKey = (req) => {
  const ip =
    String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const ua = String(req.headers["user-agent"] || "unknown");
  const day = new Date().toISOString().slice(0, 10);
  return crypto.createHash("sha256").update(`${ip}|${ua}|${day}`).digest("hex").slice(0, 48);
};

  const ipOf = (req) =>
    String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "";

  const track = asyncHandler(async (req, res) => {
    const body = req.body || {};
    const counted = await VisitorModel.track({
      visitorKey: visitorKey(req),
      path: body.path || "",
      referrer: body.referrer || req.headers.referer || "",
      device: deviceOf(req),
      ip: ipOf(req)
    });
    res.json({ ok: true, counted });
  });

module.exports = { track };
