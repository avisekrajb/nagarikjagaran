const { pool } = require("../config/db");

const ReelModel = {
  async list() {
    const [rows] = await pool.query("SELECT * FROM reels ORDER BY id DESC");
    return rows;
  },

  async create({ title, video_url, thumbnail }) {
    const [r] = await pool.query("INSERT INTO reels(title,video_url,thumbnail) VALUES (?,?,?)", [
      title, video_url, thumbnail
    ]);
    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [r.insertId]);
    return rows[0];
  },

  async update(id, { title, video_url, thumbnail }) {
    await pool.query("UPDATE reels SET title=?, video_url=?, thumbnail=? WHERE id=?", [
      title, video_url, thumbnail, id
    ]);
    const [rows] = await pool.query("SELECT * FROM reels WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async remove(id) {
    await pool.query("DELETE FROM reels WHERE id = ?", [id]);
  }
};

module.exports = ReelModel;