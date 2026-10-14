const { pool } = require("../config/db");

/**
 * सूची पेजका लागि हल्का कलमहरू — `content` (LONGTEXT) बाहक।
 * कार्डहरूले content प्रयोग गर्दैनन्, तर विवरण पेजले मात्र चाहिन्छ।
 * content_head summary बनाउनको लागि मात्र (content नै भएन भने)।
 */
const LIGHT_COLUMNS = `id,title,subtitle,summary,category,image,date,author,
  author_photo,yt_link,tags,status,reading_time,view_count,click_count,created_at,
  LEFT(content, 240) AS content_head`;

const NewsModel = {
  async find({ category, q, status, light = false } = {}) {
    let sql = light ? `SELECT ${LIGHT_COLUMNS} FROM news` : "SELECT * FROM news";
    const params = [];
    const conds = [];
    if (category) { conds.push("category = ?"); params.push(category); }
    if (status) { conds.push("status = ?"); params.push(status); }
    if (q) { conds.push("(title LIKE ? OR summary LIKE ? OR category LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    if (conds.length) sql += " WHERE " + conds.join(" AND ");
    // नयाँ हालेको पहिले — id सहित (id भन्दा created_at कम विश्वसनीय)
    sql += " ORDER BY created_at DESC, id DESC";
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  /**
   * एडमिन प्यानलका लागि : पेज-वाइज़ पागिनेसन + खोज + श्रेणी छानोटी।
   * श्रेणी गणना सधैं जम्मा डाटाबाट आउँछ (छानिएको श्रेणी होइन) — त्यसैले
   * गिनती सधैं वास्तविक र नयाँ समाचार थपिँदा बढ्दै जान्छ।
   */
  async manage({ page = 1, limit = 20, q = "", category = "" } = {}) {
    const perPage = Math.min(100, Math.max(5, Number(limit) || 20));

    const where = [];
    const params = [];
    if (q) {
      where.push("(title LIKE ? OR summary LIKE ? OR author LIKE ? OR tags LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category) { where.push("category = ?"); params.push(category); }
    const sqlWhere = where.length ? " WHERE " + where.join(" AND ") : "";

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM news${sqlWhere}`, params);

    // पेज पहिले नै सीमित गरौं — नत्र from/to बिग्रिन्छ र खाली पेज आउँछ
    const pages = Math.max(1, Math.ceil(Number(total) / perPage));
    const current = Math.min(pages, Math.max(1, Number(page) || 1));
    const offset = (current - 1) * perPage;

    const [items] = await pool.query(
      `SELECT * FROM news${sqlWhere} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    const [catRows] = await pool.query(
      "SELECT category AS name, COUNT(*) AS count FROM news GROUP BY category ORDER BY count DESC, name ASC"
    );
    const [[{ allCount }]] = await pool.query("SELECT COUNT(*) AS allCount FROM news");

    return {
      items,
      total: Number(total),
      page: current,
      limit: perPage,
      pages,
      from: Number(total) === 0 ? 0 : offset + 1,
      to: Number(total) === 0 ? 0 : Math.min(offset + perPage, Number(total)),
      allCount: Number(allCount),
      categories: catRows.map((r) => ({ name: r.name, count: Number(r.count) }))
    };
  },

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM news WHERE id = ?", [id]);
    return rows[0];
  },

  async incrementView(id) {
    await pool.query("UPDATE news SET view_count = view_count + 1 WHERE id = ?", [id]);
  },

  async incrementClick(id) {
    await pool.query("UPDATE news SET click_count = click_count + 1 WHERE id = ?", [id]);
  },

  /**
   * ट्रेन्डिङ = सबैभन्दा बढी click भएका।
   * पहिले `SELECT *` थियो — जसले LONGTEXT `content` पनि तान्थ्यो (कार्डलाई
   * चाहिँदैन)। अब हल्का कलमहरू मात्र।
   * छनोटका लागि idx_news_trend index छ (status, click_count, view_count)।
   */
  async findTrending(limit = 5, days = 30) {
    const [rows] = await pool.query(
      `SELECT ${LIGHT_COLUMNS} FROM news
       WHERE status = 'published'
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY click_count DESC, view_count DESC
       LIMIT ?`,
      [days, limit]
    );
    return rows;
  },

  async create(data) {
    const [r] = await pool.query(
      `INSERT INTO news(title,subtitle,summary,content,category,image,date,author,author_photo,yt_link,tags,status,reading_time)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [data.title, data.subtitle || "", data.summary || "", data.content || "", data.category, data.image,
       data.date || "", data.author || "नागरिक जागरण", data.author_photo || "", data.yt_link || "",
       data.tags || "", data.status || "published", data.reading_time]
    );
    return this.findById(r.insertId);
  },

  async update(id, data) {
    await pool.query(
      `UPDATE news SET title=?,subtitle=?,summary=?,content=?,category=?,image=?,date=?,author=?,author_photo=?,yt_link=?,tags=?,status=?,reading_time=? WHERE id=?`,
      [data.title, data.subtitle || "", data.summary || "", data.content || "", data.category, data.image,
       data.date || "", data.author || "नागरिक जागरण", data.author_photo || "", data.yt_link || "",
       data.tags || "", data.status || "published", data.reading_time, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    await pool.query("DELETE FROM news WHERE id = ?", [id]);
    return { ok: true };
  }
};

module.exports = NewsModel;