const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

router.get("/", auth, ctrl.list);
router.post("/", auth, ctrl.create);

/* :id सम्बन्धी सबै काममा पहिले गार्ड — regular एडमिनले
   सुपर एडमिनको खाता हेर्न/बदल्न/मेट्न सक्दैन। */
router.put("/:id", auth, ctrl.guardSuperHidden, ctrl.update);
router.patch("/:id/password", auth, ctrl.guardSuperHidden, ctrl.resetPassword);
router.delete("/:id", auth, ctrl.guardSuperHidden, ctrl.remove);

module.exports = router;
