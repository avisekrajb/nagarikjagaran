const router = require("express").Router();
const ctrl = require("../controllers/visitorController");

router.post("/", ctrl.track);

module.exports = router;
