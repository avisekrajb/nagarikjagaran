const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { pool } = require("../../config/db");
const AdminModel = require("../../models/AdminModel");

/**
 * ==============================================================
 *  v2 · OTP-आधारित परिवर्तन अनुमति
 * ==============================================================
 *  सोच : कोड बाँडे साँछेदारले पासवर्ड बदाल्ला पर्न सक्दैन।
 *  परिवर्तनको अनुरोध बन्छ, मालिकको **हार्डकोड इमेल** मा **४ अङ्कको OTP**
 *  जान्छ। सही OTP ले खाता बदलिन्छ — मिलेन भने केही हुँदैन।
 *
 *  सुरक्षा :
 *   • OTP कहिल्यै plain text मा राखिँदैन — bcrypt hash + salt मात्र
 *     (त्यसैले database चोरे पनि OTP बुझ्न सकिँदैन)
 *   • ३० मिनेटपछि म्याद सकिन्छ
 *   • ५ पटक गलत OTP ले अनुरोध पूर्ण रद्द
 *   • एकपटक मात्र — दोस्रो पटक प्रयोग हुँदैन
 */

const OTP_TTL_MIN = 30;
const OTP_MAX_TRIES = 5;

const TYPE_LABEL = {
  password: "पासवर्ड परिवर्तन",
  profile: "प्रोफाइल परिवर्तन",
  email: "इमेल परिवर्तन",
  role: "भूमिका परिवर्तन",
  lock: "खाता लक/अनलक",
  active: "खाता सक्रिय/निष्क्रिय",
  new_admin: "नयाँ एडमिन खाता",
};

const maskPw = (p) => (p ? `•••••• (${String(p).length} अक्षर)` : "");

const summarize = (type, payload = {}) => {
  switch (type) {
    case "password": return `पासवर्ड बदल्ने — ${maskPw(payload.newPassword)}`;
    case "profile": return `नाम → ${payload.name || "—"}`;
    case "email": return `इमेल → ${payload.email || "—"}`;
    case "role": return `भूमिका → ${payload.role}`;
    case "lock": return payload.locked ? "खाता लक गर्ने" : "खाता अनलक गर्ने";
    case "active": return Number(payload.is_active) ? "सक्रिय पार्ने" : "निष्क्रिय पार्ने";
    case "new_admin": return `नयाँ खाता — ${payload.name} (${payload.email})`;
    default: return TYPE_LABEL[type] || type;
  }
};

const ChangeRequestModel = {
  TYPE_LABEL,

  create: async ({ admin, changeType, payload = {}, summary }) => {
    const reqKey = crypto.randomBytes(24).toString("hex");
    const otp = String(crypto.randomInt(1000, 10000));       /* ४ अङ्क */
    /* bcryptjs मा rounds genSalt मा दिन्छ, hash को ३rd arg मा होइन */
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(otp, salt);

    /* पुरानो पर्खाइदै रहेको अनुरोध झुन्डो नहोस् */
    await pool.query(
      "UPDATE change_requests SET status='superseded' WHERE admin_id = ? AND status='pending'",
      [admin.id]
    );

    const [r] = await pool.query(
      `INSERT INTO change_requests
        (req_key, admin_id, admin_email, admin_name, change_type, summary, payload,
         otp_hash, otp_salt, otp_tries, otp_expires_at, status)
       VALUES (?,?,?,?,?,?,?,?,?,0, DATE_ADD(NOW(), INTERVAL ? MINUTE), 'pending')`,
      [
        reqKey, admin.id, admin.email, admin.name || "",
        changeType, String(summary || summarize(changeType, payload)).slice(0, 255),
        JSON.stringify(payload), hash, salt, OTP_TTL_MIN
      ]
    );

    const row = await ChangeRequestModel.byId(r.insertId);
    /* OTP साँच्चै इमेलमा पठाउनुपर्ने भएकाले यहाँ मात्र फर्कन्छ */
    return { ...row, otp };
  },

  byId: async (id) => {
    const [rows] = await pool.query("SELECT * FROM change_requests WHERE id = ?", [id]);
    return rows.length ? ChangeRequestModel.shape(rows[0]) : null;
  },

  byKey: async (key) => {
    const [rows] = await pool.query("SELECT * FROM change_requests WHERE req_key = ?", [String(key || "")]);
    if (!rows.length) return null;
    let row = rows[0];
    if (row.status === "pending" && row.otp_expires_at && new Date(row.otp_expires_at) < new Date()) {
      await pool.query("UPDATE change_requests SET status='expired' WHERE id = ?", [row.id]);
      row = { ...row, status: "expired" };
    }
    return ChangeRequestModel.shape(row);
  },

  /** hash/salt कहिल्यै बाहिर पठाइँदैन */
  shape: (row) => {
    let payload = row.payload;
    if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch (e) { payload = {}; }
    }
    return {
      id: row.id,
      req_key: row.req_key,
      admin_id: row.admin_id,
      admin_email: row.admin_email,
      admin_name: row.admin_name,
      change_type: row.change_type,
      type_label: TYPE_LABEL[row.change_type] || row.change_type,
      summary: row.summary,
      payload,
      status: row.status,
      otp_tries: Number(row.otp_tries) || 0,
      otp_max_tries: OTP_MAX_TRIES,
      otp_expires_at: row.otp_expires_at,
      created_at: row.created_at,
      decided_at: row.decided_at,
    };
  },

  list: async (status) => {
    const sql = status
      ? "SELECT * FROM change_requests WHERE status = ? ORDER BY id DESC"
      : "SELECT * FROM change_requests ORDER BY id DESC LIMIT 100";
    const [rows] = await pool.query(sql, status ? [status] : undefined);
    return rows.map(ChangeRequestModel.shape);
  },

  cancel: async (id) => {
    await pool.query(
      "UPDATE change_requests SET status='cancelled' WHERE id = ? AND status='pending'",
      [id]
    );
    return ChangeRequestModel.list();
  },

  /**
   * OTP मिलाइ अनुरोध लागू पार्ने।
   * मिलेन → केही बदलिँदैन।
   */
  verify: async (key, otp) => {
    const req = await ChangeRequestModel.byKey(key);
    if (!req) return { ok: false, code: "notfound", message: "यो अनुरोध भेटिएन।" };

    if (req.status !== "pending") {
      const m = {
        expired: "OTP को म्याद सकिसक्यो। नयाँ अनुरोध पठाउनुहोस्।",
        approved: "यो अनुरोध पहिले नै पूरा भइसक्यो।",
        failed: "OTP बारम्बार गलत भएकाले यो अनुरोध रद्द भयो।",
        cancelled: "यो अनुरोध रद्द भइसक्यो।",
        superseded: "यो अनुरोध नयाँ अनुरोधले प्रतिस्थापन गरेको छ।",
      }[req.status] || "यो अनुरोध अब लागू हुने सक्दैन।";
      return { ok: false, code: "closed", message: m, request: req };
    }

    const code = String(otp || "").trim();
    if (!/^\d{4}$/.test(code)) {
      return { ok: false, code: "badformat", message: "४ अङ्कको OTP लेख्नुहोस्।", request: req };
    }

    const [rows] = await pool.query(
      "SELECT otp_hash FROM change_requests WHERE id = ?",
      [req.id]
    );
    /* bcrypt hash भित्रै salt हुन्छ — छुट्टै salt चाहिँदैन */
    const match = await bcrypt.compare(code, rows[0].otp_hash);

    if (!match) {
      const tries = req.otp_tries + 1;
      const dead = tries >= OTP_MAX_TRIES;
      await pool.query(
        "UPDATE change_requests SET otp_tries = ?, status = ? WHERE id = ?",
        [tries, dead ? "failed" : "pending", req.id]
      );
      return {
        ok: false,
        code: "wrong",
        message: dead
          ? `OTP ${OTP_MAX_TRIES} पटक गलत भयो — यो अनुरोध रद्द भयो।`
          : `OTP मिलेन। बाँकी ${OTP_MAX_TRIES - tries} पटक।`,
        request: { ...req, otp_tries: tries, status: dead ? "failed" : "pending" },
      };
    }

    try {
      await apply(req);
    } catch (e) {
      return { ok: false, code: "apply", message: "परिवर्तन लागू हुन सकेन : " + e.message, request: req };
    }

    await pool.query(
      "UPDATE change_requests SET status='approved', decided_at=NOW() WHERE id = ?",
      [req.id]
    );
    return {
      ok: true,
      message: "OTP मिल्यो। परिवर्तन लागू भयो।",
      request: await ChangeRequestModel.byId(req.id),
    };
  },
};

async function apply(req) {
  const p = req.payload || {};
  switch (req.change_type) {
    case "password":
      if (!p.newPassword || String(p.newPassword).length < 6) throw new Error("पासवर्ड छोटो छ");
      await AdminModel.setPassword(p.adminId || req.admin_id, String(p.newPassword));
      break;
    case "profile":
      await AdminModel.update(req.admin_id, { name: String(p.name || "").trim() });
      break;
    case "email":
      await AdminModel.update(req.admin_id, { email: String(p.email || "").trim().toLowerCase() });
      break;
    case "role":
      await pool.query("UPDATE admins SET role = ? WHERE id = ?",
        [p.role === "superadmin" ? "superadmin" : "admin", p.adminId || req.admin_id]);
      break;
    case "lock":
      await pool.query("UPDATE admins SET is_locked = ? WHERE id = ?",
        [Number(p.locked) ? 1 : 0, p.adminId || req.admin_id]);
      break;
    case "active":
      await pool.query("UPDATE admins SET is_active = ? WHERE id = ?",
        [Number(p.is_active) ? 1 : 0, p.adminId || req.admin_id]);
      break;
    case "new_admin":
      await AdminModel.create({ name: String(p.name).trim(), email: String(p.email).trim().toLowerCase(), password: String(p.password) });
      break;
    default:
      throw new Error("थिहिएको परिवर्तन थरि छ");
  }
}

module.exports = ChangeRequestModel;
module.exports.OTP_TTL_MIN = OTP_TTL_MIN;
module.exports.OTP_MAX_TRIES = OTP_MAX_TRIES;
