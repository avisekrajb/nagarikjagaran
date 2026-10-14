const { pool } = require("../config/db");

const CommentModel = {
  async findByNews(newsId) {
    const [rows] = await pool.query(
      "SELECT id,news_id,name,comment,created_at FROM comments WHERE news_id = ? ORDER BY id DESC",
      [newsId]
    );
    return rows;
  },

  async create({ news_id, name, comment }) {
    const [r] = await pool.query(
      "INSERT INTO comments(news_id,name,comment) VALUES (?,?,?)",
      [news_id, String(name || "पाठक").slice(0, 80), String(comment).slice(0, 1000)]
    );
    const [rows] = await pool.query("SELECT * FROM comments WHERE id = ?", [r.insertId]);
    return rows[0];
  },

  async listAll() {
    const [rows] = await pool.query(
      "SELECT c.id, c.news_id, c.name, c.comment, c.created_at, n.title AS news_title FROM comments c LEFT JOIN news n ON n.id = c.news_id ORDER BY c.id DESC"
    );
    return rows;
  },

  async remove(id) {
    await pool.query("DELETE FROM comments WHERE id = ?", [id]);
  }
};

module.exports = CommentModel;