const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/footerController");

router.get("/", ctrl.get);
router.put("/", auth, ctrl.update);

module.exports = router;