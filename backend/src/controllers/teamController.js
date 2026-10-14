const TeamModel = require("../models/TeamModel");
const { pickGeneric } = require("../services/imageService");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");

const list = asyncHandler(async (req, res) => {
  res.json(await TeamModel.find());
});

const create = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim();
  if (!name) return res.status(400).json({ message: "नाम लेख्नुहोस्" });
  const row = await TeamModel.create({
    name,
    photo: pickGeneric(req),
    role: String(b.role || "").trim(),
    email: String(b.email || "").trim(),
    phone: String(b.phone || "").trim()
  });
  res.json(row);
  await logChange(req, "team_create", "team", `टिम सदस्य थपियो — ${name}`);
});

const update = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim();
  if (!name) return res.status(400).json({ message: "नाम लेख्नुहोस्" });
  const row = await TeamModel.update(req.params.id, {
    name,
    photo: req.file ? pickGeneric(req) : String(b.photo || b.imageUrl || ""),
    role: String(b.role || "").trim(),
    email: String(b.email || "").trim(),
    phone: String(b.phone || "").trim()
  });
  res.json(row || { message: "updated" });
  await logChange(req, "team_update", "team", `टिम सदस्य सम्पादन — ${name}`);
});

const remove = asyncHandler(async (req, res) => {
  await TeamModel.remove(req.params.id);
  res.json({ ok: true });
  await logChange(req, "team_delete", "team", `टिम सदस्य मेटियो #${req.params.id}`);
});

module.exports = { list, create, update, remove };