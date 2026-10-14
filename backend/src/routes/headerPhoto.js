const router = require("express").Router();
const { genericUpload } = require("../middleware/upload");
const verifyImage = require("../middleware/verifyImage");
const auth = require("../middleware/auth");
const ctrl = require("../controllers/headerPhotoController");

router.get("/", ctrl.get);
router.put("/", auth, genericUpload.single("image"), verifyImage, ctrl.update);

module.exports = router;