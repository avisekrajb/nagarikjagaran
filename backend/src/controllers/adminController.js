const AdminModel = require("../models/AdminModel");
const asyncHandler = require("../utils/asyncHandler");
const { isSeedAdmin } = require("../utils/seedAdmin");
const { sendSecurityAlert, reqInfo } = require("../utils/securityAlert");
const { logChange } = require("../utils/activityLog");
const ChangeRequestModel = require("../v2/models/changeRequest");
const alert = require("../v2/controllers/alert");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = () => String(process.env.SITE_URL || "http://localhost:3001").replace(/\/+$/, "");
const approveUrl = (key) => `${SITE_URL()}/approve/${key}`;

const meIsSuper = (req) => !!req.admin && (req.admin.role === "superadmin" || req.admin.role === "supersuper");
const targetIsSuper = (a) => !!a && (a.role === "superadmin" || a.role === "supersuper");

/**
 * regular एडमिनलाई सुपर एडमिन नदेखाउने।
 * सुपर एडमिनले आफ्नो सबै खाता देख्छ।
 */
const guardSuperHidden = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const target = await AdminModel.findById(id);
  if (!target) return res.status(404).json({ message: "एडमिन भेटिएन" });

  if (targetIsSuper(target) && !meIsSuper(req)) {
    sendSecurityAlert("regular एडमिनले सुपर एडमिन खातामा प्रवेश गर्ने प्रयास — रोकियो", "danger", [
      ["प्रयासकारी", req.admin.email],
      ["लक्ष्य खाता", target.email],
      ["IP", reqInfo(req).ip],
      ["मिति", new Date().toString()],
    ]);
    return res.status(403).json({ message: "यो खातामा पहुँच छैन।" });
  }
  req.targetAdmin = target;
  next();
});

const shape = (a) => ({
  id: a.id,
  name: a.name,
  email: a.email,
  is_active: Number(a.is_active) === 1,
  role: (a.role === "supersuper" || a.role === "superadmin") ? a.role : "admin",
  is_locked: Number(a.is_locked) === 1,
  last_login: a.last_login || null,
  created_at: a.created_at || null
});

/** सूची — regular एडमिनलाई सुपर एडमिन देखिन्दैन */
const list = asyncHandler(async (req, res) => {
  const rows = await AdminModel.list();
  const out = rows
    .filter((a) => meIsSuper(req) || !targetIsSuper(a))
    .map(shape);
  res.json(out);
});

/** मालिकको इमेलमा लिंकसहित सूचना + activity log */
const submitRequest = async ({ req, changeType, payload, summary }) => {
  const cr = await ChangeRequestModel.create({ admin: req.admin, changeType, payload, summary });
  const ci = reqInfo(req);

  await logChange(req, `request_${changeType}`, "change_request", `${req.admin.email} — ${cr.summary}`);

  await alert.notify(
    `OTP चाहिने — ${ChangeRequestModel.TYPE_LABEL[changeType] || changeType}`,
    "warn",
    [
      ["OTP", cr.otp],
      ["खाता", `${req.admin.name} (${req.admin.email})`],
      ["के बदलिँदैछ", cr.summary],
      ["IP", ci.ip],
      ["ब्राउजर", ci.ua],
      ["म्याद", new Date(cr.otp_expires_at).toLocaleString("ne-NP")],
    ],
    {
      title: `यो OTP ${ChangeRequestModel.OTP_MAX_TRIES} पटकसम्म मिलाउन सकिन्छ। मिलाएपछि मात्र परिवर्तन हुन्छ।`,
      button: `OTP ${cr.otp} लेख्ने पेज खोल्नुहोस्`,
      url: approveUrl(cr.req_key)
    }
  );
  return cr;
};

const PENDING_MSG =
  "अहिले लागू भएको छैन। मालिकको इमेलमा ४ अङ्कको OTP गएको छ — सही OTP ले मात्र बदलिन्छ।";

/** Hardcoded (seeded) खाता हो कि छैन */
const isSeeded = (email) => require("./password").isSeededCred(email);

/** seeded खाताको सन्देश — "डेभलपरसँग सम्पर्क" */
const SEEDED_MSG =
  "यो hardcoded खाता हो — यसको पासवर्ड आफैँ बद्न मिल्दैन।\n" +
  "OTP चाहिन्छ — कृपया डेभलपर(मालिक) सँग सम्पर्क गरी OTP लिनुहोस्, " +
  "त्यही OTP यहाँ टाँसेर मात्र बदलिनेछ।";

/* नयाँ एडमिन — पहिले अनुरोध, अनुमति भएपछि मात्र खाता बन्ने */
const create = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !String(name).trim()) return res.status(400).json({ message: "नाम लेख्नुहोस्" });
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ message: "सही इमेल ठेगाना लेख्नुहोस्" });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ message: "पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const dupe = await AdminModel.findByEmail(cleanEmail);
  if (dupe) return res.status(409).json({ message: "यो इमेल पहिले नै दर्ता छ" });

  const cr = await submitRequest({
    req,
    changeType: "new_admin",
    payload: { name: String(name).trim(), email: cleanEmail, password: String(password) },
    summary: `नयाँ खाता — ${String(name).trim()} (${cleanEmail})`,
  });

  res.status(202).json({ ok: true, pending: true, seeded: isSeeded(req.admin.email), requestKey: cr.req_key, message: "नयाँ खाता अनुरोध पठियो। " + PENDING_MSG });
});

/* सम्पादन — नाम/इमेल/सक्रिय सबै अनुमति बाटो */
const update = asyncHandler(async (req, res) => {
  const existing = req.targetAdmin;
  const { name, email, is_active } = req.body || {};
  const bits = [];

  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ message: "नाम खाली हुन सक्दैन" });
    bits.push(`नाम → ${String(name).trim()}`);
  }

  if (email !== undefined) {
    const clean = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) return res.status(400).json({ message: "सही इमेल ठेगाना लेख्नुहोस्" });
    if (clean !== existing.email) {
      const dupe = await AdminModel.findByEmail(clean);
      if (dupe) return res.status(409).json({ message: "यो इमेल पहिले नै दर्ता छ" });
    }
    bits.push(`इमेल → ${clean}`);
  }

  if (is_active !== undefined) {
    const nextActive = Number(is_active) ? 1 : 0;
    if (!nextActive) {
      const activeCount = await AdminModel.countActive();
      if (activeCount <= 1 && Number(existing.is_active) === 1) {
        return res.status(400).json({ message: "अन्तिम सक्रिय एडमिनलाई निष्क्रिय पार्न मिल्दैन" });
      }
    }
    bits.push(nextActive ? "सक्रिय पार्ने" : "निष्क्रिय पार्ने");
  }

  if (!bits.length) return res.status(400).json({ message: "बदल्ने कुरा लेख्नुहोस्" });

  const cr = await submitRequest({
    req,
    changeType: "active",
    payload: {
      adminId: existing.id,
      name, email, is_active,
      summary: `${existing.name} — ${bits.join(" , ")}`
    },
    summary: `${existing.name} — ${bits.join(" , ")}`,
  });

  res.status(202).json({ ok: true, pending: true, requestKey: cr.req_key, message: "सम्पादन अनुरोध पठियो। " + PENDING_MSG });
});

/* पासवर्ड रिसेट — अनुमति बाटो (पहिले seed खातामा सधैँ 403 थियो) */
const resetPassword = asyncHandler(async (req, res) => {
  const existing = req.targetAdmin;

  const { password } = req.body || {};
  if (!password || String(password).length < 6) {
    return res.status(400).json({ message: "पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ" });
  }

  const cr = await submitRequest({
    req,
    changeType: "password",
    payload: { adminId: existing.id, newPassword: String(password) },
    summary: `${existing.email} को पासवर्ड रिसेट (${String(password).length} अक्षर)`,
  });

  const seeded = isSeeded(existing.email);
  res.status(202).json({
    ok: true, pending: true, seeded, requestKey: cr.req_key,
    message: seeded ? "OTP अनुरोध पठियो। " + SEEDED_MSG : "पासवर्ड अनुरोध पठियो। " + PENDING_MSG,
  });
});

/* मेट्ने — अनुमति बाटो */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (id === Number(req.admin.id)) {
    return res.status(400).json({ message: "आफ्नै खाता मेट्न मिल्दैन" });
  }
  const existing = req.targetAdmin;

  const cr = await submitRequest({
    req,
    changeType: "active",
    payload: { adminId: existing.id, is_active: 0, remove: 1 },
    summary: `${existing.name} (${existing.email}) लाई मेट्ने`,
  });

  res.status(202).json({ ok: true, pending: true, requestKey: cr.req_key, message: "मेट्ने अनुरोध पठियो। " + PENDING_MSG });
});

module.exports = { list, create, update, remove, resetPassword, guardSuperHidden };
