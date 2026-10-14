const AdsModel = require("../models/AdsModel");
const AdsValidator = require("../validators/AdsValidator");
const { pickAdsImage } = require("../services/imageService");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");

const list = asyncHandler(async (req, res) => {
  const rows = await AdsModel.find(req.query.position || "", !!req.query.position);
  res.json(rows);
});

const incrementView = asyncHandler(async (req, res) => {
  await AdsModel.incrementView(req.params.id);
  res.json({ ok: true });
});

const incrementClick = asyncHandler(async (req, res) => {
  await AdsModel.incrementClick(req.params.id);
  res.json({ ok: true });
});

const create = asyncHandler(async (req, res) => {
  const err = AdsValidator.create(req.body || {});
  if (err) return res.status(400).json({ message: err });

  const b = req.body;
  const row = await AdsModel.create({
    title: b.title,
    image: pickAdsImage(req),
    link: b.link,
    description: b.description,
    position: b.position,
    enabled: b.enabled === "1" || b.enabled === true ? 1 : 0,
    expire_date: b.expire_date || ""
  });
  res.json(row);
  await logChange(req, "ad_create", "ads", `नयाँ विज्ञापन — ${b.title}`);
});

const update = asyncHandler(async (req, res) => {
  const b = req.body;
  const row = await AdsModel.update(req.params.id, {
    title: b.title,
    image: req.file ? pickAdsImage(req) : String(b.image || b.imageUrl || ""),
    link: b.link,
    description: b.description,
    position: b.position,
    enabled: b.enabled === "1" || b.enabled === true ? 1 : 0,
    expire_date: b.expire_date || ""
  });
  res.json(row || { message: "updated" });
  await logChange(req, "ad_update", "ads", `विज्ञापन सम्पादन — ${b.title || ""}`);
});

const remove = asyncHandler(async (req, res) => {
  await AdsModel.remove(req.params.id);
  res.json({ ok: true });
  await logChange(req, "ad_delete", "ads", `विज्ञापन मेटियो #${req.params.id}`);
});

module.exports = { list, create, update, remove, incrementView, incrementClick };