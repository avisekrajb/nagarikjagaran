const ReelModel = require("../models/ReelModel");
const { pickGeneric } = require("../services/imageService");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");

const list = asyncHandler(async (req, res) => {
  res.json(await ReelModel.list());
});

const create = asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!String(b.title || "").trim() || !String(b.video_url || "").trim()) {
    return res.status(400).json({ message: "रीलको शीर्षक र भिडियो लिंक अनिवार्य छ" });
  }
  const row = await ReelModel.create({
    title: String(b.title).trim().slice(0, 255),
    video_url: String(b.video_url).trim().slice(0, 500),
    thumbnail: req.file ? pickGeneric(req) : String(b.thumbnail || "")
  });
  res.json(row);
  await logChange(req, "reel_create", "reels", `नयाँ रील — ${b.title}`);
});

const update = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const row = await ReelModel.update(req.params.id, {
    title: String(b.title || "").trim().slice(0, 255),
    video_url: String(b.video_url || "").trim().slice(0, 500),
    thumbnail: req.file ? pickGeneric(req) : (String(b.thumbnail || "") || "")
  });
  res.json(row || { message: "updated" });
  await logChange(req, "reel_update", "reels", `रील सम्पादन — ${b.title || ""}`);
});

const remove = asyncHandler(async (req, res) => {
  await ReelModel.remove(req.params.id);
  res.json({ ok: true });
  await logChange(req, "reel_delete", "reels", `रील मेटियो #${req.params.id}`);
});

module.exports = { list, create, update, remove };