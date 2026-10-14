const router = require("express").Router();
const auth = require("../middleware/auth");
const { newsUpload } = require("../middleware/upload");
const verifyImage = require("../middleware/verifyImage");
const ctrl = require("../controllers/newsController");

router.get("/", ctrl.list);
router.get("/trending", ctrl.trending);
router.get("/:id", ctrl.getOne);
router.post("/:id/view", ctrl.incrementView);
router.post("/:id/click", ctrl.incrementClick);
router.post("/", auth, newsUpload.single("image"), verifyImage, ctrl.create);
router.put("/:id", auth, newsUpload.single("image"), verifyImage, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;