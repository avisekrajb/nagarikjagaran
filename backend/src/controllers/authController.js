const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/AdminModel");
const AuthValidator = require("../validators/AuthValidator");
const { jwtSecret } = require("../config");
const asyncHandler = require("../utils/asyncHandler");
const { isSeedAdmin } = require("../utils/seedAdmin");
const { sendSecurityAlert, reqInfo } = require("../utils/securityAlert");
const { logChange } = require("../utils/activityLog");
const ChangeRequestModel = require("../v2/models/changeRequest");
const alert = require("../v2/controllers/alert");
const cred = require("./password");

/** वेबसाइटको सार्वजनिक ठेगाना — इमेलको लिंक यही बनाउँछ */
const SITE_URL = () => String(process.env.SITE_URL || "http://localhost:3001").replace(/\/+$/, "");
const approveUrl = (key) => `${SITE_URL()}/approve/${key}`;

/**
 * सुपर एडमिनले आफ्नै पासवर्ड बदाल्दा **गुप्त master पासवर्ड** चाहिन्छ।
 * यो .env को होइन — password/superadmincred.js मा hardcoded छ।
 */
const MASTER_OK = async (plain) => {
  try { return await cred.checkMaster(plain); } catch (e) { return false; }
};

/**
 * Hardcoded (seeded) खाताले आफ्नै पासवर्ड बद्न सक्दैन।
 * बद्नुपर्ने भए OTP चाहिन्छ — OTP मालिकको इमेलमा जान्छ।
 */
const CONTACT_DEV_MSG =
  "यो खाताको पासवर्ड आफैँ बद्न मिल्दैन।\n" +
  "OTP चाहिन्छ — कृपया डेभलपर(मालिक) सँग सम्पर्क गरी OTP लिनुहोस्, " +
  "र त्यही OTP यहाँ टाँसेर मात्र पासवर्ड बदलिनेछ।";

/* भूमिका: supersuper > superadmin > admin */
const normRole = (r) => (r === "supersuper" || r === "superadmin" ? r : "admin");

const shape = (a) => ({
  id: a.id,
  name: a.name,
  email: a.email,
  is_active: Number(a.is_active) === 1,
  /* भूमिका : "supersuper" सबैभन्दा माथि, "superadmin" ले सबै खण्ड,
     "admin" ले सीमित खण्डहरू मात्र */
  role: normRole(a.role),
  is_locked: Number(a.is_locked) === 1,
  last_login: a.last_login || null
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const err = AuthValidator.login(req.body || {});
  if (err) return res.status(400).json({ message: err });

  const admin = await AdminModel.findByEmail(String(email).trim());
  const i = reqInfo(req);

  if (!admin) {
    /* अज्ञात इमेल — चोरी/अनधिकृत प्रयास हुन सक्छ */
    sendSecurityAlert("अज्ञात इमेलबाट लगइन प्रयास", "warn", [
      ["इमेल", String(email).trim()],
      ["IP", i.ip],
      ["ब्राउजर", i.ua],
      ["मिति", new Date().toString()],
    ]);
    return res.status(401).json({ message: "इमेल वा पासवर्ड गलत छ" });
  }

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) {
    sendSecurityAlert("गलत पासवर्डले लगइन प्रयास", "danger", [
      ["खाता", admin.email],
      ["भूमिका", admin.role || "admin"],
      ["IP", i.ip],
      ["ब्राउजर", i.ua],
      ["मिति", new Date().toString()],
    ]);
    return res.status(401).json({ message: "इमेल वा पासवर्ड गलत छ" });
  }

  await AdminModel.touchLogin(admin.id);

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: shape(admin).role },
    jwtSecret,
    { expiresIn: "7d" }
  );
  req.admin = admin;
  await logChange(req, "login", "auth", `लगइन — ${admin.email}`);

  res.json({ token, user: shape(admin) });
});

const me = asyncHandler(async (req, res) => {
  res.json(shape(req.admin));
});

/* ==========================================================
   परिवर्तन अनुरोध → ४ अङ्कको OTP इमेल → सही OTP ले मात्र लागू
   ========================================================== */
const submitRequest = async ({ req, admin, changeType, payload, summary }) => {
  const cr = await ChangeRequestModel.create({ admin, changeType, payload, summary });
  const ci = reqInfo(req);

  await logChange(req, `request_${changeType}`, "change_request", `${admin.email} — ${cr.summary}`);

  await alert.notify(
    `OTP चाहिने — ${ChangeRequestModel.TYPE_LABEL[changeType] || changeType}`,
    "warn",
    [
      ["OTP", cr.otp],
      ["खाता", `${admin.name} (${admin.email})`],
      ["के बदलिँदैछ", cr.summary],
      ["अनुरोधकर्ता", ci.ip],
      ["ब्राउजर", ci.ua],
      ["म्याद", new Date(cr.otp_expires_at).toLocaleString("ne-NP")],
    ],
    {
      title: `यो OTP ${ChangeRequestModel.OTP_MAX_TRIES} पटकसम्म मिलाउन सकिन्छ। मिलाएपछि मात्र परिवर्तन हुन्छ।`,
      button: `OTP ${cr.otp} लेख्ने पेज खोल्नुहोस्`,
      url: approveUrl(cr.req_key),
    }
  );

  return cr;
};

/* -------------------------------------------------------------
   पासवर्ड बदल्ने।
   • सुपर एडमिन आफ्नै पासवर्ड → लुकेर मास्टर पासवर्ड (789456) पनि चाहिन्छ
   • सबै अरू → OTP बाट मालिकको अनुमति
   ------------------------------------------------------------- */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, masterPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "पुरानो र नयाँ पासवर्ड दुवै लेख्नुहोस्" });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ" });
  }

  const admin = await AdminModel.findByIdWithPassword(req.admin.id);
  const ci = reqInfo(req);
  const isSuperSelf = normRole(admin.role) === "superadmin";
  const isSeeded = cred.isSeededCred(admin.email);

  /* ---- seeded खाता आफैँ पासवर्ड बद्दैन : OTP चाहिन्छ ---- */
  if (isSeeded) {
    sendSecurityAlert("Hardcoded खाताले आफ्नै पासवर्ड बद्ने प्रयास — OTP बाटो देखाइयो", "warn", [
      ["खाता", admin.email],
      ["भूमिका", normRole(admin.role)],
      ["IP", ci.ip],
      ["मिति", new Date().toString()],
    ]);
  }

  /* ---- सुपर एडमिनले आफ्नै पासवर्ड बदाल्दा गुप्त पासवर्ड पनि चाहिन्छ ---- */
  if (isSuperSelf) {
    if (!masterPassword) {
      return res.status(403).json({
        needMaster: true,
        seeded: isSeeded,
        message: isSeeded
          ? CONTACT_DEV_MSG
          : "सुपर एडमिनको आफ्नै पासवर्ड बद्दा गुप्त पासवर्ड (master password) पनि चाहिन्छ।",
      });
    }
    if (!(await MASTER_OK(masterPassword))) {
      sendSecurityAlert("गुप्त (master) पासवर्ड गलत — सुपर पासवर्ड बदल्ने प्रयास — रोकियो", "danger", [
        ["खाता", admin.email],
        ["IP", ci.ip],
        ["ब्राउजर", ci.ua],
        ["मिति", new Date().toString()],
      ]);
      return res.status(403).json({
        seeded: isSeeded,
        message: isSeeded ? CONTACT_DEV_MSG : "गुप्त पासवर्ड मिलेन।",
      });
    }
  }

  const ok = await bcrypt.compare(String(currentPassword), admin.password);
  if (!ok) {
    sendSecurityAlert("पुरानो पासवर्ड मिलेन — पासवर्ड बदल्ने प्रयास", "danger", [
      ["खाता", admin.email],
      ["IP", ci.ip],
      ["ब्राउजर", ci.ua],
      ["मिति", new Date().toString()],
    ]);
    return res.status(401).json({ message: "पुरानो पासवर्ड मिलेन" });
  }

  const cr = await submitRequest({
    req,
    admin,
    changeType: "password",
    payload: { adminId: admin.id, newPassword: String(newPassword) },
    summary: `पासवर्ड बदल्ने — ${admin.email} (${String(newPassword).length} अक्षर)`,
  });

  res.status(202).json({
    ok: true,
    pending: true,
    seeded: isSeeded,
    requestKey: cr.req_key,
    message: isSeeded
      ? "OTP मागिएको छ र मालिकको इमेलमा पठिएको छ। " + CONTACT_DEV_MSG
      : isSuperSelf
        ? "गुप्त पासवर्ड ठीक छ। अब मालिकको इमेलमा पठिएको ४ अङ्कको OTP लेख्नुहोस् — मिलाएपछि मात्र बदलिन्छ।"
        : "पासवर्ड अहिले बदलिएको छैन। मालिकको इमेलमा ४ अङ्कको OTP गएको छ — सही OTP ले मात्र बदलिन्छ।",
  });
});

/* -------------------------------------------------------------
   नाम/इमेल बदल्ने — उही अनुमति बाटो।
   ------------------------------------------------------------- */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body || {};
  const admin = req.admin;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const payload = {};
  const bits = [];

  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ message: "नाम खाली हुन सक्दैन" });
    payload.name = String(name).trim();
    bits.push(`नाम → ${payload.name}`);
  }
  if (email !== undefined) {
    const clean = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) return res.status(400).json({ message: "सही इमेल ठेगाना लेख्नुहोस्" });
    if (clean !== admin.email) {
      const dupe = await AdminModel.findByEmail(clean);
      if (dupe) return res.status(409).json({ message: "यो इमेल पहिले नै दर्ता छ" });
    }
    payload.email = clean;
    bits.push(`इमेल → ${clean}`);
  }

  if (!bits.length) return res.status(400).json({ message: "बदल्ने कुरा लेख्नुहोस्" });

  /* नाम र इमेल एउटै अनुरोधमा — profile मा दुवै राखिन्छ */
  const changeType = Object.keys(payload).length === 1 && payload.email ? "email" : "profile";
  if (changeType === "email") delete payload.name;

  const cr = await submitRequest({
    req,
    admin,
    changeType,
    payload,
    summary: bits.join(" , "),
  });

  res.status(202).json({
    ok: true,
    pending: true,
    requestKey: cr.req_key,
    message: "परिवर्तन अहिले लागू भएको छैन। मालिकको इमेलमा ४ अङ्कको OTP गएको छ — सही OTP ले मात्र लागू हुन्छ।",
  });
});

module.exports = { login, me, changePassword, updateProfile };
