const { pool } = require("../config/db");

const VisitorModel = {
  // एउटै browser/डिभाइसले दोहोर्‍याएर नगरी, दिनमा एकपटक मात्र गन counted।
  track: async ({ visitorKey, path = "", referrer = "", device = "desktop", ip = "" }) => {
    const key = String(visitorKey || "").slice(0, 64);
    if (!key) return false;
    const [existing] = await pool.query(
      "SELECT id FROM visitor_logs WHERE visitor_key = ? AND created_at >= CURDATE() LIMIT 1",
      [key]
    );
    if (existing.length) return false;

    await pool.query(
      "INSERT INTO visitor_logs(visitor_key, path, referrer, device) VALUES (?,?,?,?)",
      [key, String(path).slice(0, 255), String(referrer).slice(0, 255), String(device).slice(0, 30)]
    );
    return true;
  },

  totals: async () => {
    const q = async (sql) => {
      const [r] = await pool.query(sql);
      return r;
    };

    const overall = await q(
      "SELECT COUNT(*) AS visits, COUNT(DISTINCT visitor_key) AS uniques FROM visitor_logs"
    );
    const d = await q(
      "SELECT COUNT(*) AS visits, COUNT(DISTINCT visitor_key) AS uniques FROM visitor_logs WHERE created_at >= CURDATE()"
    );
    const w = await q(
      "SELECT COUNT(*) AS visits, COUNT(DISTINCT visitor_key) AS uniques FROM visitor_logs WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)"
    );
    const m = await q(
      "SELECT COUNT(*) AS visits, COUNT(DISTINCT visitor_key) AS uniques FROM visitor_logs WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')"
    );
    const y = await q(
      "SELECT COUNT(*) AS visits, COUNT(DISTINCT visitor_key) AS uniques FROM visitor_logs WHERE created_at >= DATE_FORMAT(NOW(), '%Y-01-01')"
    );

    return {
      all: Number(overall[0]?.visits || 0),
      allUnique: Number(overall[0]?.uniques || 0),
      today: Number(d[0]?.visits || 0),
      todayUnique: Number(d[0]?.uniques || 0),
      week: Number(w[0]?.visits || 0),
      weekUnique: Number(w[0]?.uniques || 0),
      month: Number(m[0]?.visits || 0),
      monthUnique: Number(m[0]?.uniques || 0),
      year: Number(y[0]?.visits || 0),
      yearUnique: Number(y[0]?.uniques || 0)
    };
  },

  // range = week | month | year
  series: async (range = "week") => {
    let sql;
    if (range === "year") {
      sql = `SELECT DATE_FORMAT(created_at, '%Y-%m') AS label,
                    COUNT(*) AS visits,
                    COUNT(DISTINCT visitor_key) AS uniques
             FROM visitor_logs
             WHERE created_at >= DATE_FORMAT(NOW(), '%Y-01-01')
             GROUP BY label ORDER BY label ASC`;
    } else if (range === "month") {
      sql = `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS label,
                    COUNT(*) AS visits,
                    COUNT(DISTINCT visitor_key) AS uniques
             FROM visitor_logs
             WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
             GROUP BY label ORDER BY label ASC`;
    } else {
      sql = `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS label,
                    COUNT(*) AS visits,
                    COUNT(DISTINCT visitor_key) AS uniques
             FROM visitor_logs
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
             GROUP BY label ORDER BY label ASC`;
    }
    const [rows] = await pool.query(sql);
    return { range, data: rows };
  },

  topPages: async (limit = 8) => {
    const [rows] = await pool.query(
      `SELECT path, COUNT(*) AS visits FROM visitor_logs
       WHERE path <> '' AND path <> '/'
       GROUP BY path ORDER BY visits DESC LIMIT ?`,
      [Number(limit) || 8]
    );
    return rows;
  },

  recent: async (limit = 12) => {
    const [rows] = await pool.query(
      `SELECT visitor_key, path, device, referrer, ip, created_at FROM visitor_logs
       ORDER BY id DESC LIMIT ?`,
      [Number(limit) || 12]
    );
    return rows;
  }
};

module.exports = VisitorModel;
