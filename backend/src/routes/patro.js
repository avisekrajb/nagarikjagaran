const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/patroController");

// सार्वजनिक
router.get("/", ctrl.getPatro);

// एडमिन
router.get("/settings", auth, ctrl.getSettings);
router.put("/settings", auth, ctrl.updateSettings);
router.get("/holidays", auth, ctrl.listHolidays);
router.post("/holidays", auth, ctrl.createHoliday);
router.put("/holidays/:id", auth, ctrl.updateHoliday);
router.delete("/holidays/:id", auth, ctrl.removeHoliday);
router.post("/sync", auth, ctrl.sync);

module.exports = router;
