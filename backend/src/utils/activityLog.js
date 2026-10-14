const ActivityLogModel = require("../models/ActivityLogModel");

/**
 * एउटा परिवर्तन रेकर्ड गर्ने सहायक।
 * लगइन बाहेक कुनै पनि अनुरोधमा req.admin नभए पनि चल्छ।
 *
 * कति लग राख्ने भन्ने नियम ActivityLogModel मा छ (MAX_LOG_ROWS,
 * डिफल्ट ५०००) — त्यहाँले नै INSERT पछि पुराना काटिदिन्छ।
 */
const logChange = (req, action, entity = "", details = "") => {
  const admin = req && req.admin;
  return ActivityLogModel.create({
    adminId: admin ? admin.id : null,
    adminName: admin ? admin.name : "प्रणाली",
    adminEmail: admin ? admin.email : "",
    action,
    entity,
    details
  }).catch((e) => {
    console.error("activity log failed:", e.message);
  });
};

module.exports = { logChange, KEEP: ActivityLogModel.MAX };
