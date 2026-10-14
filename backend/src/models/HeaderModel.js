const { pool } = require("../config/db");

const defaultHeader = { photo: "" };

const HeaderModel = {
  default: defaultHeader,

  async get() {
    const [rows] = await pool.query("SELECT photo FROM header_settings WHERE id = 1");
    return rows[0] || defaultHeader;
  },

  async update(data) {
    await pool.query("INSERT INTO header_settings(id,photo) VALUES (1,?) ON DUPLICATE KEY UPDATE photo=?", [
      data.photo || "",
      data.photo || ""
    ]);
    const [rows] = await pool.query("SELECT photo FROM header_settings WHERE id = 1");
    return rows[0];
  }
};

module.exports = HeaderModel;