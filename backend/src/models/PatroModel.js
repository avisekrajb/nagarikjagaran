const { pool } = require("../config/db");

const shape = (r) => ({
  id: r.id,
  title: r.title,
  holiday_date: r.holiday_date || "",
  bs_year: r.bs_year || "",
  bs_month: r.bs_month || "",
  bs_day: r.bs_day || "",
  description: r.description || "",
  is_enabled: Number(r.is_enabled) === 1
});

const PatroModel = {
  // ---- सेटिङ : आइतबार (एडमिनले mark गर्ने) / शनिबार (डिफल्ट बिदा) ----
  getSettings: async () => {
    const [rows] = await pool.query("SELECT * FROM patro_settings WHERE id = 1");
    const s = rows[0];
    return {
      sunday_holiday: s ? Number(s.sunday_holiday) === 1 : false,
      saturday_holiday: s ? Number(s.saturday_holiday) === 1 : true
    };
  },

  updateSettings: async ({ sunday_holiday, saturday_holiday }) => {
    const cur = await PatroModel.getSettings();
    const next = {
      sunday_holiday: sunday_holiday === undefined ? cur.sunday_holiday : Number(sunday_holiday) === 1,
      saturday_holiday: saturday_holiday === undefined ? cur.saturday_holiday : Number(saturday_holiday) === 1
    };
    await pool.query(
      `INSERT INTO patro_settings(id, sunday_holiday, saturday_holiday) VALUES (1,?,?)
       ON DUPLICATE KEY UPDATE sunday_holiday=?, saturday_holiday=?`,
      [
        next.sunday_holiday ? 1 : 0, next.saturday_holiday ? 1 : 0,
        next.sunday_holiday ? 1 : 0, next.saturday_holiday ? 1 : 0
      ]
    );
    return next;
  },

  // ---- बिदा / पर्व ----
  list: async ({ onlyEnabled = false, from = "", to = "" } = {}) => {
    const where = [];
    const params = [];
    if (onlyEnabled) where.push("is_enabled = 1");
    if (from) { where.push("holiday_date >= ?"); params.push(from); }
    if (to) { where.push("holiday_date <= ?"); params.push(to); }
    const sql = `SELECT * FROM patro_holidays${where.length ? " WHERE " + where.join(" AND ") : ""}
                 ORDER BY (holiday_date = '' ) ASC, holiday_date ASC, id ASC`;
    const [rows] = await pool.query(sql, params);
    return rows.map(shape);
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM patro_holidays WHERE id = ?", [id]);
    return rows[0] ? shape(rows[0]) : null;
  },

  create: async (data) => {
    const [r] = await pool.query(
      `INSERT INTO patro_holidays(title, holiday_date, bs_year, bs_month, bs_day, description, is_enabled)
       VALUES (?,?,?,?,?,?,?)`,
      [
        String(data.title).trim(),
        data.holiday_date || "",
        data.bs_year || "",
        data.bs_month || "",
        data.bs_day || "",
        data.description || "",
        data.is_enabled === false || data.is_enabled === 0 || data.is_enabled === "0" ? 0 : 1
      ]
    );
    return PatroModel.findById(r.insertId);
  },

  update: async (id, data) => {
    const sets = [];
    const vals = [];
    if (data.title !== undefined) { sets.push("title = ?"); vals.push(String(data.title).trim()); }
    if (data.holiday_date !== undefined) { sets.push("holiday_date = ?"); vals.push(data.holiday_date || ""); }
    if (data.bs_year !== undefined) { sets.push("bs_year = ?"); vals.push(data.bs_year || ""); }
    if (data.bs_month !== undefined) { sets.push("bs_month = ?"); vals.push(data.bs_month || ""); }
    if (data.bs_day !== undefined) { sets.push("bs_day = ?"); vals.push(data.bs_day || ""); }
    if (data.description !== undefined) { sets.push("description = ?"); vals.push(data.description || ""); }
    if (data.is_enabled !== undefined) {
      sets.push("is_enabled = ?");
      vals.push(Number(data.is_enabled) ? 1 : 0);
    }
    if (sets.length) {
      vals.push(id);
      await pool.query(`UPDATE patro_holidays SET ${sets.join(", ")} WHERE id = ?`, vals);
    }
    return PatroModel.findById(id);
  },

  remove: async (id) => {
    const [r] = await pool.query("DELETE FROM patro_holidays WHERE id = ?", [id]);
    return r.affectedRows > 0;
  },

  /** एउटै विक्रम मिति/नाम भएकोलाई मेटेर नयाँ राख्छ (sync बाट पुनः आउँछ) */
  upsertByKey: async (data) => {
    const title = String(data.title).trim();
    const y = String(data.bs_year || "");
    const m = String(data.bs_month ?? "");
    const d = String(data.bs_day || "");
    const [rows] = await pool.query(
      "SELECT id FROM patro_holidays WHERE title = ? AND bs_year = ? AND bs_month = ? AND bs_day = ?",
      [title, y, m, d]
    );
    if (rows.length) {
      await pool.query("UPDATE patro_holidays SET description = ? WHERE id = ?", [
        data.description || "",
        rows[0].id
      ]);
      return { id: rows[0].id, created: false };
    }
    const [r] = await pool.query(
      `INSERT INTO patro_holidays(title, bs_year, bs_month, bs_day, description, is_enabled)
       VALUES (?,?,?,?,?,1)`,
      [title, y, m, d, data.description || ""]
    );
    return { id: r.insertId, created: true };
  },

  count: async () => {
    const [rows] = await pool.query("SELECT COUNT(*) AS c FROM patro_holidays");
    return Number(rows[0].c);
  }
};

module.exports = PatroModel;
