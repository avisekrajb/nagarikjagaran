const router = require("express").Router();
const auth = require("../middleware/auth");
const { genericUpload } = require("../middleware/upload");
const verifyImage = require("../middleware/verifyImage");
const ctrl = require("../controllers/uploadController");

router.post("/", auth, genericUpload.single("image"), verifyImage, ctrl.upload);

module.exports = router;