const { pickGeneric } = require("../services/imageService");
const asyncHandler = require("../utils/asyncHandler");

const upload = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "कृपया फोटो छान्नुहोस्" });
  res.json({ url: pickGeneric(req) });
});

module.exports = { upload };