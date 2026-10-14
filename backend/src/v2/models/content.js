const { pool } = require("../../config/db");

/* ==========================================================
   v2 · पोल (Polls) — प्रश्न + विकल्प, एकजना मानिसले एकपटक मात्र
   ========================================================== */
const PollModel = {
  list: async () => {
    const [polls] = await pool.query("SELECT * FROM polls ORDER BY id DESC");
    if (!polls.length) return [];
    const ids = polls.map((p) => p.id);
    const [opts] = await pool.query(
      `SELECT * FROM poll_options WHERE poll_id IN (${ids.map(() => "?").join(",")}) ORDER BY id`,
      ids
    );
    const [votes] = await pool.query(
      `SELECT poll_id, COUNT(*) n FROM poll_votes GROUP BY poll_id`
    );
    const vMap = Object.fromEntries(votes.map((v) => [v.poll_id, Number(v.n)]));

    return polls.map((p) => {
      const options = opts.filter((o) => o.poll_id === p.id).map((o) => ({ ...o, votes: Number(o.votes) || 0 }));
      const total = vMap[p.id] || 0;
      return {
        ...p,
        is_active: Number(p.is_active) === 1,
        show_in_sidebar: Number(p.show_in_sidebar) === 1,
        options,
        total_votes: total,
        options: options.map((o) => ({
          ...o,
          percent: total ? Math.round((o.votes / total) * 100) : 0,
        })),
      };
    });
  },

  create: async ({ question, options = [], show_in_sidebar = true }) => {
    const [r] = await pool.query(
      "INSERT INTO polls(question, is_active, show_in_sidebar) VALUES (?,1,?)",
      [String(question).trim(), show_in_sidebar ? 1 : 0]
    );
    for (const label of options) {
      const t = String(label || "").trim();
      if (t) await pool.query("INSERT INTO poll_options(poll_id,label) VALUES (?,?)", [r.insertId, t]);
    }
    return PollModel.list();
  },

  remove: async (id) => {
    await pool.query("DELETE FROM polls WHERE id = ?", [id]);
    return PollModel.list();
  },

  setActive: async (id, active) => {
    await pool.query("UPDATE polls SET is_active = ? WHERE id = ?", [active ? 1 : 0, id]);
    return PollModel.list();
  },

  /** एकजना मानिसले एकपटक मात्र (UNIQUE key ले नै रोक्छ) */
  vote: async (pollId, optionId, voterKey) => {
    const [dup] = await pool.query(
      "SELECT id FROM poll_votes WHERE poll_id = ? AND voter_key = ?",
      [pollId, voterKey]
    );
    if (dup.length) return { ok: false, message: "तपाईंले यो पोलमा पहिले नै मतदान गर्नुभएको छ।" };

    const [opt] = await pool.query("SELECT id FROM poll_options WHERE id = ? AND poll_id = ?", [optionId, pollId]);
    if (!opt.length) return { ok: false, message: "विकल्प मिलेन" };

    await pool.query("INSERT INTO poll_votes(poll_id,option_id,voter_key) VALUES (?,?,?)", [pollId, optionId, voterKey]);
    await pool.query("UPDATE poll_options SET votes = votes + 1 WHERE id = ?", [optionId]);
    return { ok: true };
  },
};

/* ==========================================================
   v2 · स्कोरबोर्ड — दुवै टोलीको live स्कोर
   ========================================================== */
const ScoreboardModel = {
  list: async (onlyActive = false) => {
    const sql = onlyActive
      ? "SELECT * FROM scoreboard WHERE is_active = 1 ORDER BY id DESC"
      : "SELECT * FROM scoreboard ORDER BY id DESC";
    const [rows] = await pool.query(sql);
    return rows.map((r) => ({ ...r, is_active: Number(r.is_active) === 1, show_float: Number(r.show_float) === 1 }));
  },

  create: async (d) => {
    const [r] = await pool.query(
      `INSERT INTO scoreboard(match_label,home_team,away_team,home_score,away_score,home_logo,away_logo,status,is_active,show_float)
       VALUES (?,?,?,?,?,?,?,?,1,1)`,
      [
        d.match_label || "खेल",
        d.home_team, d.away_team,
        Number(d.home_score) || 0, Number(d.away_score) || 0,
        d.home_logo || "", d.away_logo || "",
        d.status || "live",
      ]
    );
    return ScoreboardModel.list();
  },

  update: async (id, d) => {
    const cur = {};
    ["match_label","home_team","away_team","home_score","away_score","home_logo","away_logo","status","is_active","show_float"]
      .forEach((k) => { if (d[k] !== undefined) cur[k] = d[k]; });
    const keys = Object.keys(cur);
    if (!keys.length) return ScoreboardModel.list();

    const bool = { is_active: 1, show_float: 1 };
    const set = keys.map((k) => `${k} = ?`).join(", ");
    const vals = keys.map((k) => (bool[k] !== undefined ? (cur[k] ? 1 : 0) : cur[k]));
    await pool.query(`UPDATE scoreboard SET ${set} WHERE id = ?`, [...vals, id]);
    return ScoreboardModel.list();
  },

  remove: async (id) => {
    await pool.query("DELETE FROM scoreboard WHERE id = ?", [id]);
    return ScoreboardModel.list();
  },
};

/* ==========================================================
   v2 · विज्ञापन स्थान — सुपर एडमिनले थप्छ/मेट्छ/मार्छ
   ========================================================== */
const AdPositionModel = {
  list: async () => {
    const [rows] = await pool.query("SELECT * FROM ad_positions ORDER BY sort_order, id");
    return rows.map((r) => ({ ...r, is_enabled: Number(r.is_enabled) === 1 }));
  },

  create: async ({ key_name, label, page_hint, sort_order }) => {
    const k = String(key_name || "").trim().replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    if (!k) throw new Error("key (अङ्रेजी) चाहिन्छ");
    await pool.query(
      "INSERT INTO ad_positions(key_name,label,page_hint,sort_order,is_enabled) VALUES (?,?,?,?,1)",
      [k, label || k, page_hint || "", Number(sort_order) || 99]
    );
    return AdPositionModel.list();
  },

  update: async (id, d) => {
    const cur = {};
    ["label", "page_hint", "sort_order", "is_enabled"].forEach((k) => { if (d[k] !== undefined) cur[k] = d[k]; });
    const keys = Object.keys(cur);
    if (!keys.length) return AdPositionModel.list();
    const vals = keys.map((k) => (k === "is_enabled" ? (cur[k] ? 1 : 0) : cur[k]));
    await pool.query(`UPDATE ad_positions SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`, [...vals, id]);
    return AdPositionModel.list();
  },

  remove: async (id) => {
    await pool.query("DELETE FROM ad_positions WHERE id = ?", [id]);
    return AdPositionModel.list();
  },
};

module.exports = { PollModel, ScoreboardModel, AdPositionModel };
