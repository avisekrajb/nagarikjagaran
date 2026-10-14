const nodemailer = require("nodemailer");

const SITE_NAME = "नागरिक समाचार";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const welcomeHtml = (email) => `
  <div style="font-family:'Noto Sans Devanagari','Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.08);">
      <div style="background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#ffffff;padding:26px 28px;">
        <div style="font-size:22px;font-weight:800;">नागरिक समाचार</div>
        <div style="font-size:13px;opacity:.85;">सब्सक्राइबर स्वागत पत्र</div>
      </div>
      <div style="padding:28px;">
        <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">धन्यवाद, तपाईं सब्सक्राइब भएकोमा बधाई!</h2>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">
          तपाईंको इमेल <strong>${email}</strong> सफलतापूर्वक हाम्रो न्युजलेटर सूचीमा थपिएको छ।
        </p>
        <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">
          अब हरेक महत्त्वपूर्ण खबर, विशेष रिपोर्ट र ताजा अपडेटहरू सिधै तपाईंको इमेलमा प्राप्त हुनेछन्।
        </p>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">
          हामीलाई पढ्नुभएकोमा धन्यवाद।<br>
          <span style="font-weight:700;color:#1d4ed8;">— नागरिक समाचार टिम</span>
        </p>
      </div>
      <div style="padding:14px 28px;background:#f8fafc;font-size:12px;color:#94a3b8;text-align:center;">
        नागरिक समाचार • नेपाली भाषा सेवा
      </div>
    </div>
  </div>
`;

async function sendWelcome(email) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  await transporter.sendMail({
    from: `"${SITE_NAME}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "सब्सक्राइब गर्नुभएकोमा धन्यवाद — नागरिक समाचार",
    html: welcomeHtml(email),
  });
}

module.exports = { sendWelcome };