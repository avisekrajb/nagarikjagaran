const router = require("express").Router();
const auth = require("../middleware/auth");
const WatermarkModel = require("../models/WatermarkModel");
const asyncHandler = require("../utils/asyncHandler");
const { logChange } = require("../utils/activityLog");
const { requireSuper } = require("../utils/role");

// सार्वजनिक — समाचार पेजमा watermark चाहिन्छ
router.get("/", asyncHandler(async (req, res) => {
  res.json(await WatermarkModel.get());
}));

  /* सुपर एडमिन मात्र बदल्न सक्छ — regular admin ले हेर्न सक्छ, बदल्न सक्दैन */
  router.put("/", auth, requireSuper(async (req, res) => {
  const row = await WatermarkModel.update(req.body || {});
  await logChange(
    req,
    "watermark_update",
    "watermark",
    `Watermark — ${row.enabled ? "सक्रिय" : "बन्द"}, ${row.shape}, ${row.size}px, ` +
    `स्थान ${row.pos_x}/${row.pos_y}%, रङ ${row.bg_color}`
  );
  res.json(row);
}));

module.exports = router;
