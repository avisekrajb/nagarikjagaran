const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/newsController");

// एडमिन प्यानलमा मात्र — सार्वजनिक GET /api/news को array जवाफ नबिग्रिन गर्न छुट्टै राखिएको
router.get("/", auth, ctrl.manage);

module.exports = router;
