const router = require("express").Router();
const auth = require("../middleware/auth");
const { genericUpload } = require("../middleware/upload");
const verifyImage = require("../middleware/verifyImage");
const ctrl = require("../controllers/reelController");

router.get("/", ctrl.list);
router.post("/", auth, genericUpload.single("image"), verifyImage, ctrl.create);
router.put("/:id", auth, genericUpload.single("image"), verifyImage, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;