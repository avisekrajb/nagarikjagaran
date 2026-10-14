const router = require("express").Router();
const auth = require("../middleware/auth");
const { adsUpload } = require("../middleware/upload");
const verifyImage = require("../middleware/verifyImage");
const ctrl = require("../controllers/adsController");

router.get("/", ctrl.list);
router.post("/:id/view", ctrl.incrementView);
router.post("/:id/click", ctrl.incrementClick);
router.post("/", auth, adsUpload.single("image"), verifyImage, ctrl.create);
router.put("/:id", auth, adsUpload.single("image"), verifyImage, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;