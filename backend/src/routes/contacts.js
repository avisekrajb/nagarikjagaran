const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/contactController");

router.get("/", auth, c.list);
router.post("/", c.create);
router.delete("/:id", auth, c.remove);

module.exports = router;