const { pool } = require("../config/db");

const AdsModel = {
  async find(position = "", publicOnly = false) {
    let sql = "SELECT * FROM ads";
    const params = [];
    const conds = [];
    if (position) { conds.push("position = ?"); params.push(position); }
    if (publicOnly) {
      conds.push("enabled = 1");
      conds.push("(expire_date = '' OR expire_date IS NULL OR expire_date >= CURDATE())");
    }
    if (conds.length) sql += " WHERE " + conds.join(" AND ");
    sql += " ORDER BY id DESC";
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM ads WHERE id = ?", [id]);
    return rows[0];
  },

  async incrementView(id) {
    await pool.query("UPDATE ads SET view_count = view_count + 1 WHERE id = ?", [id]);
  },

  async incrementClick(id) {
    await pool.query("UPDATE ads SET click_count = click_count + 1 WHERE id = ?", [id]);
  },

  async create(data) {
    const [r] = await pool.query(
      "INSERT INTO ads(title,image,link,description,position,enabled,expire_date) VALUES (?,?,?,?,?,?,?)",
      [data.title || "विज्ञापन", data.image, data.link || "#", data.description || "", data.position || "sidebar", data.enabled, data.expire_date || ""]
    );
    return this.findById(r.insertId);
  },

  async update(id, data) {
    await pool.query(
      "UPDATE ads SET title=?,image=?,link=?,description=?,position=?,enabled=?,expire_date=? WHERE id=?",
      [data.title || "विज्ञापन", data.image, data.link || "#", data.description || "", data.position || "sidebar", data.enabled, data.expire_date || "", id]
    );
    return this.findById(id);
  },

  async remove(id) {
    await pool.query("DELETE FROM ads WHERE id = ?", [id]);
    return { ok: true };
  }
};

module.exports = AdsModel;