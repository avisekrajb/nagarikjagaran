const { folder } = require("../utils/category");
const { sanitize } = require("../utils/category");

const pickNewsImage = (req) =>
  req.file ? `/uploads/${folder(req.body.category)}/${req.file.filename}` : (req.body.imageUrl || "").trim();

const pickAdsImage = (req) =>
  req.file ? `/uploads/ads/${req.file.filename}` : (req.body.imageUrl || "").trim();

const pickGeneric = (req) =>
  req.file ? `/uploads/${sanitize(req.body.category)}/${req.file.filename}` : "";

const pickAuthorImage = (req) =>
  req.file ? `/uploads/author/${req.file.filename}` : "";

module.exports = { pickNewsImage, pickAdsImage, pickGeneric, pickAuthorImage };