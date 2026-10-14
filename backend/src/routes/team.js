const router = require("express").Router();
const auth = require("../middleware/auth");
const { genericUpload } = require("../middleware/upload");
const verifyImage = require("../middleware/verifyImage");
const c = require("../controllers/teamController");

router.get("/", c.list);
router.post("/", auth, genericUpload.single("image"), verifyImage, c.create);
router.put("/:id", auth, genericUpload.single("image"), verifyImage, c.update);
router.delete("/:id", auth, c.remove);

module.exports = router;