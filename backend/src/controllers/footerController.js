const FooterModel = require("../models/FooterModel");
const FooterValidator = require("../validators/FooterValidator");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");

const get = asyncHandler(async (req, res) => {
  res.json(await FooterModel.get());
});

const update = asyncHandler(async (req, res) => {
  FooterValidator.update(req.body || {});
  const row = await FooterModel.update(req.body || {});
  res.json(row);
  await logChange(req, "footer_update", "footer", "फुटर सेटिङ बदलियो");
});

module.exports = { get, update };