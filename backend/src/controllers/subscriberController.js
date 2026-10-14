const SubscriberModel = require("../models/SubscriberModel");
const asyncHandler = require("../utils/asyncHandler");
const { sendWelcome } = require("../utils/mailer");
const { logChange } = require("../utils/activityLog");

const list = asyncHandler(async (req, res) => {
  res.json(await SubscriberModel.list());
});

const create = asyncHandler(async (req, res) => {
  const email = String((req.body || {}).email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ message: "मान्य इमेल ठेगाना लेख्नुहोस्" });
  }
  const row = await SubscriberModel.create({ email });
  if (!row) return res.status(409).json({ message: "यो इमेल पहिले नै सब्सक्राइब भइसकेको छ" });
  sendWelcome(email).catch((err) => console.error("[mailer] स्वागत इमेल पठाउन सकिएन:", err.message));
  res.json(row);
});

const remove = asyncHandler(async (req, res) => {
  await SubscriberModel.remove(req.params.id);
  res.json({ ok: true });
  await logChange(req, "subscriber_delete", "subscribers", `सब्सक्राइबर हटाइयो #${req.params.id}`);
});

module.exports = { list, create, remove };