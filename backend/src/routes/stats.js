const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/statsController");

router.get("/dashboard", auth, ctrl.dashboard);
router.get("/visitors", auth, ctrl.visitorStats);
router.get("/logs", auth, ctrl.logs);

module.exports = router;
