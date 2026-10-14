const HeaderModel = require("../models/HeaderModel");
const asyncHandler = require("../utils/asyncHandler");
const { pickGeneric } = require("../services/imageService");
const { logChange } = require("../utils/activityLog");

const get = asyncHandler(async (req, res) => {
  res.json(await HeaderModel.get());
});

const update = asyncHandler(async (req, res) => {
  const photo = req.file ? pickGeneric(req) : String(req.body.imageUrl || "");
  const row = await HeaderModel.update({ photo });
  res.json(row);
  await logChange(req, "header_photo_update", "header", "हेडर फोटो बदलियो");
});

module.exports = { get, update };