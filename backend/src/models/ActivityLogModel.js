const { pool } = require("../config/db");

// हाम्रो लगत साँच्चै "change log" हो — बढी भए यति मात्र राखिन्छ।
// .env मा MAX_LOG_ROWS ले यो सङ्ख्या तोक्छ (डिफल्ट ५०००)।
const MAX_LOGS = Number(process.env.MAX_LOG_ROWS || 5000);

const trim = async () => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS c FROM activity_logs"
  );
  if (Number(rows[0].c) <= MAX_LOGS) return;
  await pool.query(
    `DELETE FROM activity_logs ORDER BY id ASC LIMIT ?`,
    [Number(rows[0].c) - MAX_LOGS]
  );
};

const ActivityLogModel = {
  MAX: MAX_LOGS,

  create: async ({ adminId, adminName, adminEmail, action, entity, details }) => {
    await pool.query(
      `INSERT INTO activity_logs(admin_id, admin_name, admin_email, action, entity, details)
       VALUES (?,?,?,?,?,?)`,
      [
        adminId || null,
        adminName || "",
        adminEmail || "",
        action,
        entity || "",
        String(details || "").slice(0, 500)
      ]
    );
    await trim();
    return true;
  },

  list: async (limit = MAX_LOGS) => {
    const [rows] = await pool.query(
      "SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?",
      [Math.min(Number(limit) || MAX_LOGS, MAX_LOGS)]
    );
    return rows;
  },

  clear: async () => {
    await pool.query("TRUNCATE TABLE activity_logs");
  }
};

module.exports = ActivityLogModel;
