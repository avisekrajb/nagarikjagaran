/* अब सबै सूचना backend/src/controllers/v2/alert.js बाट जान्छ */
const v2 = require("../v2/controllers/alert");

/**
 * ================= सुरक्षा सूचना (security alert) =================
 *
 * जुनसुने प्रयास — पासवर्ड बदल्ने, गलत लगइन, अनधिकृत खाता —
 * यहाँबाट ALERT_EMAIL मा तुरुन्तै इमेल पठिन्छ।
 *
 * पठाउने चेष्टा कहिल्यै मुख्य प्रक्रियालाई नरोक्ने होइन: mail fail भए पनि
 * try/catch ले होला, error लाई log मात्र गरिन्छ।
 */

const ALERT_TO = process.env.ALERT_EMAIL || "";
const ENABLED = String(process.env.ALERT_ENABLED || "true") === "true";
const FROM = process.env.EMAIL_USER || "noreply@localhost";
const SITE = "नागरिक समाचार";

let transporter = null;
const getTransport = () => {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const rowsHtml = (rows) =>
  rows
    .map(
      ([k, v]) =>
        `<tr>
           <td style="padding:8px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;white-space:nowrap;">${esc(k)}</td>
           <td style="padding:8px 14px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:700;">${esc(v)}</td>
         </tr>`
    )
    .join("");

const SEVERITY = {
  danger: { bg: "#dc2626", label: "गम्भीर — तत्काल हेर्नुहोस्" },
  warn: { bg: "#d97706", label: "सावधानी" },
  info: { bg: "#2563eb", label: "सूचना" },
};

/**
 * @param {string} event    जस्ता : "पासवर्ड बदल्ने प्रयास"
 * @param {string} severity "danger" | "warn" | "info"
 * @param {Array<[string,string]>} rows  विवरण [["इमेल","x@gmail.com"], ...]
 */
async function sendSecurityAlert(event, severity = "warn", rows = []) {
  if (!ENABLED || !ALERT_TO) return false;

  const t = getTransport();
  if (!t) {
    console.warn("[alert] EMAIL_USER/EMAIL_PASS छैन — सूचना पठाउन सकिएन");
    return false;
  }

  const s = SEVERITY[severity] || SEVERITY.warn;
  const when = new Date().toString();
  const host = process.env.SERVER_NAME || "localhost";

  try {
    await t.sendMail({
      from: `"${SITE} सुरक्षा" <${FROM}>`,
      to: ALERT_TO,
      subject: `[${s.label}] ${event} — ${host}`,
      text:
        `${event}\n\n` +
        rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
        `\n\nसमय: ${when}\nसर्भर: ${host}\n` +
        `\nयदि यो तपाईंले नगर्नुभएको हो भने तुरुन्तै पासवर्ड बदल्नुहोस्।`,
      html: `
        <div style="font-family:'Noto Sans Devanagari','Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:28px 14px;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08);">
            <div style="background:${s.bg};color:#fff;padding:22px 26px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:.14em;opacity:.9;">सुरक्षा सूचना</div>
              <div style="font-size:20px;font-weight:800;margin-top:4px;">${esc(event)}</div>
              <div style="font-size:12px;opacity:.9;margin-top:2px;">${esc(s.label)}</div>
            </div>
            <div style="padding:22px 12px;">
              <table style="width:100%;border-collapse:collapse;">${rowsHtml(rows)}</table>
            </div>
            <div style="padding:16px 26px;background:#f8fafc;font-size:12px;color:#64748b;line-height:1.7;">
              समय : ${esc(when)}<br/>
              सर्भर : ${esc(host)}<br/><br/>
              यदि यो तपाईंले नगर्नुभएको हो भने तुरुन्तै पासवर्ड बदल्नुहोस्।
            </div>
          </div>
        </div>`,
    });
    console.log(`[alert] पठियो -> ${ALERT_TO} :: ${event}`);
    return true;
  } catch (e) {
    console.error("[alert] पठाउन सकिएन:", e.message);
    return false;
  }
}

/** req बाट IP / UA / path निकाल्ने (logger छैन भने पनि चल्छ) */
const reqInfo = (req) => {
  const ip =
    (req.headers && (req.headers["x-forwarded-for"] || req.headers["x-real-ip"])) ||
    (req.socket && req.socket.remoteAddress) ||
    req.ip ||
    "?";
  return {
    ip: String(ip).split(",")[0].trim(),
    ua: (req.headers && req.headers["user-agent"]) || "?",
    path: req.originalUrl || req.url || "?",
  };
};

module.exports = { sendSecurityAlert: v2.notify, reqInfo: v2.info };
