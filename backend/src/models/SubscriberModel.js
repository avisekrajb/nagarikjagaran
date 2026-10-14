const { pool } = require("../config/db");

const SubscriberModel = {
  async list() {
    const [rows] = await pool.query("SELECT * FROM subscribers ORDER BY id DESC");
    return rows;
  },

  async create({ email }) {
    const [r] = await pool.query("INSERT IGNORE INTO subscribers(email) VALUES (?)", [
      String(email).trim().toLowerCase()
    ]);
    if (!r.affectedRows) return null;
    const [rows] = await pool.query("SELECT * FROM subscribers WHERE id = ?", [r.insertId]);
    return rows[0];
  },

  async remove(id) {
    await pool.query("DELETE FROM subscribers WHERE id = ?", [id]);
  }
};

module.exports = SubscriberModel;