const nodemailer = require("nodemailer");

/**
 * ================= v2 · सुरक्षा सूचना (security alert) =================
 * सुपर एडमिन सम्बन्धी।
 * सबै "कसैले पासवर्ड/database चोर्न खोजे" प्रयास यहाँबाट पठिन्छ।
 *
 * ⚠ ALERT_EMAIL यहाँ **हार्डकोड** छ — .env बदलिए पनि यो नबदलिने।
 */

const ALERT_EMAIL = "abhishekrajbanshi999@gmail.com"; /* ← हार्डकोड */

const FROM = process.env.EMAIL_USER || "noreply@localhost";
const SITE = "नागरिक समाचार";
const ENABLED = String(process.env.ALERT_ENABLED || "true") === "true";

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

const SEVERITY = {
  danger: { bg: "#dc2626", label: "गम्भीर — तत्काल हेर्नुहोस्" },
  warn: { bg: "#d97706", label: "सावधानी" },
  info: { bg: "#2563eb", label: "सूचना" },
};

/**
 * @param {string} event
 * @param {"danger"|"warn"|"info"} severity
 * @param {Array<[string,string]>} rows
 * @param {{title?:string, button?:string, url?:string, note?:string}} [action]
 *        action दिइए इमेलमा वेबसाइटको बटन आउँछ — थिच्दा सम्बन्धित
 *        पेज खुल्छ (जस्तै अनुमति दिने popup)।
 */
async function notify(event, severity = "warn", rows = [], action = {}) {
  if (!ENABLED) return false;
  const t = getTransport();
  if (!t) {
    console.warn("[alert:v2] EMAIL_USER/EMAIL_PASS छैन — सूचना पठाउन सकिएन");
    return false;
  }

  const s = SEVERITY[severity] || SEVERITY.warn;
  const when = new Date().toString();
  const host = process.env.SERVER_NAME || "localhost";

  /* ---- वेबसाइटको लिंक + बटन (अनुमति दिने/नदिने popup खोल्ने) ---- */
  const siteUrl = String(process.env.SITE_URL || "http://localhost:3001").replace(/\/+$/, "");
  const linkUrl = action.url ? String(action.url) : siteUrl;
  const btnLabel = action.button || "वेबसाइट खोल्नुहोस्";
  const btnTitle = action.title || btnLabel;
  const btnBg = action.url ? "#0f172a" : "#2563eb";

  const htmlButton = `
        <div style="padding:8px 26px 22px;text-align:center;">
          <a href="${esc(linkUrl)}"
             style="display:inline-block;background:${btnBg};color:#fff;text-decoration:none;
                    font-size:14px;font-weight:800;padding:14px 30px;border-radius:10px;">
            ${esc(btnLabel)}
          </a>
          <div style="margin-top:12px;font-size:11px;color:#94a3b8;word-break:break-all;">
            ${action.url ? "माथिको बटन थिच्नुहोस् — वेबसाइट खुलेर" : "वेबसाइट:"}
            ${action.url ? esc(btnTitle) + "<br/>" : ""}
            <a href="${esc(linkUrl)}" style="color:#2563eb;">${esc(linkUrl)}</a>
          </div>
        </div>`;

  const textButton =
    `\n\n${action.title ? action.title + "\n" : ""}` +
    `${btnLabel}: ${linkUrl}\n\n`;

  const table = rows
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:8px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;white-space:nowrap;">${esc(k)}</td>
          <td style="padding:8px 14px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:700;word-break:break-all;">${esc(v)}</td>
        </tr>`
    )
    .join("");

  try {
    await t.sendMail({
      from: `"${SITE} सुरक्षा" <${FROM}>`,
      to: ALERT_EMAIL,
      subject: `[${s.label}] ${event} — ${host}`,
      text:
        `${event}\n\n` +
        rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
        `\n\nसमय: ${when}\nसर्भर: ${host}\n` +
        textButton +
        `यदि यो तपाईंले नगर्नुभएको हो भने तुरुन्तै पासवर्ड बदल्नुहोस्।`,
      html: `
        <div style="font-family:'Noto Sans Devanagari','Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:28px 14px;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08);">
            <div style="background:${s.bg};color:#fff;padding:22px 26px;">
              <div style="font-size:11px;font-weight:800;letter-spacing:.14em;opacity:.9;">सुरक्षा सूचना</div>
              <div style="font-size:20px;font-weight:800;margin-top:4px;">${esc(event)}</div>
              <div style="font-size:12px;opacity:.9;margin-top:2px;">${esc(s.label)}</div>
            </div>
            <div style="padding:22px 12px;">
              <table style="width:100%;border-collapse:collapse;">${table}</table>
            </div>
            ${htmlButton}
            <div style="padding:16px 26px;background:#f8fafc;font-size:12px;color:#64748b;line-height:1.7;">
              समय : ${esc(when)}<br/>
              सर्भर : ${esc(host)}<br/><br/>
              यदि यो तपाईंले नगर्नुभएको हो भने तुरुन्तै पासवर्ड बदल्नुहोस्।
            </div>
          </div>
        </div>`,
    });
    console.log(`[alert:v2] पठियो -> ${ALERT_EMAIL} :: ${event}`);
    return true;
  } catch (e) {
    console.error("[alert:v2] पठाउन सकिएन:", e.message);
    return false;
  }
}

/** req बाट IP / UA / path */
const info = (req) => {
  const ip =
    (req.headers && (req.headers["x-forwarded-for"] || req.headers["x-real-ip"])) ||
    (req.socket && req.socket.remoteAddress) ||
    req.ip ||
    "?";
  return {
    ip: String(ip).split(",")[0].trim(),
    ua: (req.headers && req.headers["user-agent"]) || "?",
    path: (req && req.originalUrl) || "?",
  };
};

const rows = (obj) => Object.entries(obj).map(([k, v]) => [k, v]);

module.exports = { notify, info, rows, ALERT_EMAIL };
