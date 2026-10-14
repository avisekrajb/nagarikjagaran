const ContactModel = require("../models/ContactModel");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");

const list = asyncHandler(async (req, res) => {
  res.json(await ContactModel.find());
});

const create = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim();
  const message = String(b.message || "").trim();
  if (!name) return res.status(400).json({ message: "नाम लेख्नुहोस्" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "सही इमेल ठेगाना लेख्नुहोस्" });
  if (message.length < 5) return res.status(400).json({ message: "सन्देश लेख्नुहोस्" });
  const row = await ContactModel.create({ name, email, message });
  res.json(row);
});

const remove = asyncHandler(async (req, res) => {
  await ContactModel.remove(req.params.id);
  res.json({ ok: true });
  await logChange(req, "message_delete", "contacts", `सम्पर्क सन्देश मेटियो #${req.params.id}`);
});

module.exports = { list, create, remove };