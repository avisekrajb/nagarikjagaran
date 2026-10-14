const { pool } = require("../config/db");

const StatsModel = {
  dashboard: async () => {
    const one = async (sql) => {
      const [rows] = await pool.query(sql);
      return Number(rows[0].v || 0);
    };

    const news = await one("SELECT COUNT(*) AS v FROM news");
    const newsPublished = await one(
      "SELECT COUNT(*) AS v FROM news WHERE status = 'published'"
    );
    const newsDraft = await one("SELECT COUNT(*) AS v FROM news WHERE status = 'draft'");
    const newsViews = await one("SELECT IFNULL(SUM(view_count),0) AS v FROM news");
    const newsClicks = await one("SELECT IFNULL(SUM(click_count),0) AS v FROM news");

    const ads = await one("SELECT COUNT(*) AS v FROM ads");
    const adsActive = await one("SELECT COUNT(*) AS v FROM ads WHERE enabled = 1");
    const adViews = await one("SELECT IFNULL(SUM(view_count),0) AS v FROM ads");
    const adClicks = await one("SELECT IFNULL(SUM(click_count),0) AS v FROM ads");

    const subscribers = await one("SELECT COUNT(*) AS v FROM subscribers");
    const comments = await one("SELECT COUNT(*) AS v FROM comments");
    const messages = await one("SELECT COUNT(*) AS v FROM contacts");
    const admins = await one("SELECT COUNT(*) AS v FROM admins");
    const adminsActive = await one("SELECT COUNT(*) AS v FROM admins WHERE is_active = 1");

    const [byCategory] = await pool.query(
      `SELECT category, COUNT(*) AS total, IFNULL(SUM(view_count),0) AS views
       FROM news GROUP BY category ORDER BY total DESC`
    );

    const [topNews] = await pool.query(
      `SELECT id, title, category, image, date, view_count, click_count
       FROM news ORDER BY view_count DESC, click_count DESC LIMIT 5`
    );

    const [recentNews] = await pool.query(
      `SELECT id, title, category, image, date, status, view_count
       FROM news ORDER BY id DESC LIMIT 5`
    );

    return {
      news,
      newsPublished,
      newsDraft,
      newsViews,
      newsClicks,
      ads,
      adsActive,
      adViews,
      adClicks,
      subscribers,
      comments,
      messages,
      admins,
      adminsActive,
      totalViews: newsViews + adViews,
      totalClicks: newsClicks + adClicks,
      byCategory,
      topNews,
      recentNews
    };
  }
};

module.exports = StatsModel;
