const express = require("express");
const auth = require("../../middleware/auth");
const { requireSuperSuper } = require("../../utils/role");
const asyncHandler = require("../../utils/asyncHandler");
const AdminModel = require("../../models/AdminModel");
const ChangeRequestModel = require("../models/changeRequest");
const { logChange } = require("../../utils/activityLog");
const alert = require("../controllers/alert");

/**
 * ==========================================================
 *  /api/supersuper/*
 *  सुपर-सुपर एडमिन — सबै हेर्न सक्छ।
 *  तर आफैं केही बदल्दैन : **पासवर्ड मात्र।**
 * ==========================================================
 */
const router = express.Router();
const S = (fn) => [auth, requireSuperSuper(fn)];

const shape = (a) => ({
  id: a.id,
  name: a.name,
  email: a.email,
  is_active: Number(a.is_active) === 1,
  role: a.role || "admin",
  is_locked: Number(a.is_locked) === 1,
  last_login: a.last_login || null,
});

/** सबै खाता हेर्न */
router.get("/admins", ...S(asyncHandler(async (req, res) => {
  res.json((await AdminModel.list()).map(shape));
})));

/** परिवर्तन अनुरोध हेर्न */
router.get("/changes", ...S(asyncHandler(async (req, res) => {
  res.json(await ChangeRequestModel.list(req.query.status));
})));

/**
 * पासवर्ड बदल्ने — अघिल्लो खाताको **पुरानो पासवर्ड अनिवार्य**।
 * सबै परिवर्तन मालिकको ४ अङ्कको OTP बाट मात्र लागू हुन्छ।
 */
router.post("/admins/:id/password", ...S(asyncHandler(async (req, res) => {
  const { previousPassword, newPassword } = req.body || {};
  const bcrypt = require("bcryptjs");
  const { pool } = require("../../config/db");

  const id = Number(req.params.id);
  const [rows] = await pool.query("SELECT id,name,email,role FROM admins WHERE id = ?", [id]);
  if (!rows.length) return res.status(404).json({ ok: false, message: "खाता भेटिएन।" });
  const target = rows[0];

  if (!previousPassword || !newPassword) {
    return res.status(400).json({ ok: false, message: "अघिल्लो र नयाँ पासवर्ड दुवै चाहिन्छ।" });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ ok: false, message: "नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।" });
  }

  const full = await AdminModel.findByIdWithPassword(id);
  const ok = await bcrypt.compare(String(previousPassword), full.password);
  if (!ok) {
    await alert.notify("सुपर-सुपरले गलत अघिल्लो पासवर्ड लेख्यो — रोकियो", "danger", [
      ["लक्ष्य खाता", target.email],
      ["IP", alert.info(req).ip],
      ["समय", new Date().toString()],
    ]);
    return res.status(401).json({ ok: false, message: "अघिल्लो पासवर्ड मिलेन।" });
  }

  /* OTP अनुरोध — मालिकको इमेलमा ४ अङ्कको OTP जान्छ */
  const cr = await ChangeRequestModel.create({
    admin: { id: target.id, email: target.email, name: target.name },
    changeType: "password",
    payload: { adminId: target.id, newPassword: String(newPassword) },
    summary: `${target.name} (${target.email}) को पासवर्ड — सुपर-सुपरबाट`,
  });

  await logChange(req, "ss_password_request", "change_request", cr.summary);
  const seeded = require("../../controllers/password").isSeededCred(target.email);
  await alert.notify(
    `OTP चाहिने — पासवर्ड परिवर्तन (सुपर-सुपर)`,
    "warn",
    [
      ["OTP", cr.otp],
      ["खाता", `${target.name} (${target.email})`],
      ["के बदलिँदैछ", cr.summary],
      ["अनुरोधकर्ता", `सुपर-सुपर — ${req.admin.email}`],
      ["IP", alert.info(req).ip],
      ["म्याद", new Date(cr.otp_expires_at).toLocaleString("ne-NP")],
    ],
    {
      title: `सही OTP लेखेपछि मात्र पासवर्ड बदलिन्छ।`,
      button: `OTP ${cr.otp} लेख्ने पेज खोल्नुहोस्`,
      url: `${String(process.env.SITE_URL || "http://localhost:3001").replace(/\/+$/, "")}/approve/${cr.req_key}`,
    }
  );

  res.status(202).json({
    ok: true, pending: true, seeded, requestKey: cr.req_key,
    message: seeded
      ? "यो hardcoded खाता हो — आफैँ बद्न मिल्दैन। OTP चाहिन्छ; कृपया डेभलपर(मालिक) सँग सम्पर्क गरी OTP लिनुहोस् र यहीँ टाँस्नुहोस्।"
      : "मालिकको इमेलमा ४ अङ्कको OTP गएको छ। सही OTP ले मात्र पासवर्ड बदलिन्छ।",
  });
})));

module.exports = router;
