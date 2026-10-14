const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/commentController");

router.get("/", auth, ctrl.listAll);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;