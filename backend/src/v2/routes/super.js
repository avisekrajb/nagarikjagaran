const express = require("express");
const auth = require("../../middleware/auth");
const { requireSuper } = require("../../utils/role");
const alert = require("../controllers/alert");
const ctrl = require("../controllers/superController");

/**
 * ================= v2 · सुपर एडमिनका route =================
 * /api/superadmin/*  — सबैमा requireSuper।
 */
const router = express.Router();
const S = (fn) => [auth, requireSuper(fn)];

/* ---- सेटिङ ---- */
router.get("/settings", ...S(ctrl.getSettings));
router.put("/settings", ...S(ctrl.updateSettings));

/* ---- न्युबार बटन ---- */
router.get("/nav", ...S(ctrl.getNav));
router.put("/nav", ...S(ctrl.saveNav));

/* ---- एडमिन भूमिका ---- */
router.get("/admins", ...S(ctrl.listAdmins));
router.put("/admins/:id/role", ...S(ctrl.setRole));
router.put("/admins/:id/lock", ...S(ctrl.setLocked));

/* ---- पोल ---- */
router.get("/polls", ...S(ctrl.listPolls));
router.post("/polls", ...S(ctrl.createPoll));
router.delete("/polls/:id", ...S(ctrl.removePoll));
router.put("/polls/:id/active", ...S(ctrl.togglePoll));

/* ---- स्कोरबोर्ड ---- */
router.get("/scores", ...S(ctrl.listScores));
router.post("/scores", ...S(ctrl.createScore));
router.put("/scores/:id", ...S(ctrl.updateScore));
router.delete("/scores/:id", ...S(ctrl.removeScore));

/* ---- विज्ञापन स्थान ---- */
router.get("/ad-positions", ...S(ctrl.listAdPositions));
router.post("/ad-positions", ...S(ctrl.createAdPosition));
router.put("/ad-positions/:id", ...S(ctrl.updateAdPosition));
router.delete("/ad-positions/:id", ...S(ctrl.removeAdPosition));

/* ---- परिवर्तन अनुरोध (मालिकको अनुमति बाटो) ---- */
router.get("/changes", ...S(ctrl.listChanges));
router.delete("/changes/:id", ...S(ctrl.cancelChange));

/* ---- परीक्षण इमेल ---- */
router.get("/alert-test", ...S(ctrl.testAlert));

module.exports = router;
module.exports.alert = alert;
