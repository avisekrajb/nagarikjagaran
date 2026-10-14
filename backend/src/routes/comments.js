const router = require("express").Router({ mergeParams: true });
const ctrl = require("../controllers/commentController");

router.get("/", ctrl.list);
router.post("/", ctrl.create);

module.exports = router;