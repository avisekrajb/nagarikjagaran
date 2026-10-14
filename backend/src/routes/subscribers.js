const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/subscriberController");

router.get("/", auth, ctrl.list);
router.post("/", ctrl.create);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;