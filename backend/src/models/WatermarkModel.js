const { pool } = require("../config/db");

const DEFAULTS = {
  enabled: true,
  pos_x: 78,
  pos_y: 80,
  size: 150,
  shape: "rounded",
  opacity: 0.4,
  bg_color: "#ffffff",
  rotation: 0,
  logo: "",
  /* रील/भिडियोका लागि अलग स्थान (एडमिनबाट मिलाउन सकिने) */
  reel_enabled: true,
  reel_pos_x: 88,
  reel_pos_y: 30,
  reel_size: 34,
  reel_opacity: 0.9
};

const clamp = (v, lo, hi, fb) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fb;
  return Math.min(hi, Math.max(lo, n));
};

const shape = (s) => {
  const v = String(s || "").trim();
  return ["square", "rounded", "circle"].includes(v) ? v : DEFAULTS.shape;
};

const colour = (c) => {
  const v = String(c || "").trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : DEFAULTS.bg_color;
};

const shapeOut = (r) => ({
  enabled: Number(r.enabled) === 1,
  pos_x: clamp(r.pos_x, 0, 100, DEFAULTS.pos_x),
  pos_y: clamp(r.pos_y, 0, 100, DEFAULTS.pos_y),
  size: clamp(r.size, 40, 600, DEFAULTS.size),
  shape: shape(r.shape),
  opacity: clamp(r.opacity, 0.05, 1, DEFAULTS.opacity),
  bg_color: colour(r.bg_color),
  rotation: clamp(r.rotation, -180, 180, DEFAULTS.rotation),
  logo: r.logo || "",

  reel_enabled: r.reel_enabled === undefined ? DEFAULTS.reel_enabled : Number(r.reel_enabled) === 1,
  reel_pos_x: clamp(r.reel_pos_x, 0, 100, DEFAULTS.reel_pos_x),
  reel_pos_y: clamp(r.reel_pos_y, 0, 100, DEFAULTS.reel_pos_y),
  reel_size: clamp(r.reel_size, 14, 200, DEFAULTS.reel_size),
  reel_opacity: clamp(r.reel_opacity, 0.05, 1, DEFAULTS.reel_opacity)
});

const WatermarkModel = {
  defaults: () => ({ ...DEFAULTS }),

  get: async () => {
    const [rows] = await pool.query("SELECT * FROM watermark_settings WHERE id = 1");
    if (!rows[0]) return { ...DEFAULTS };
    return shapeOut(rows[0]);
  },

  update: async (data = {}) => {
    const cur = await WatermarkModel.get();
    const next = {
      enabled: data.enabled === undefined ? cur.enabled : Number(data.enabled) === 1,
      pos_x: data.pos_x === undefined ? cur.pos_x : clamp(data.pos_x, 0, 100, cur.pos_x),
      pos_y: data.pos_y === undefined ? cur.pos_y : clamp(data.pos_y, 0, 100, cur.pos_y),
      size: data.size === undefined ? cur.size : clamp(data.size, 40, 600, cur.size),
      shape: data.shape === undefined ? cur.shape : shape(data.shape),
      opacity: data.opacity === undefined ? cur.opacity : clamp(data.opacity, 0.05, 1, cur.opacity),
      bg_color: data.bg_color === undefined ? cur.bg_color : colour(data.bg_color),
      rotation: data.rotation === undefined ? cur.rotation : clamp(data.rotation, -180, 180, cur.rotation),
      logo: data.logo === undefined ? cur.logo : String(data.logo || ""),

      reel_enabled: data.reel_enabled === undefined ? cur.reel_enabled : Number(data.reel_enabled) === 1,
      reel_pos_x: data.reel_pos_x === undefined ? cur.reel_pos_x : clamp(data.reel_pos_x, 0, 100, cur.reel_pos_x),
      reel_pos_y: data.reel_pos_y === undefined ? cur.reel_pos_y : clamp(data.reel_pos_y, 0, 100, cur.reel_pos_y),
      reel_size: data.reel_size === undefined ? cur.reel_size : clamp(data.reel_size, 14, 200, cur.reel_size),
      reel_opacity: data.reel_opacity === undefined ? cur.reel_opacity : clamp(data.reel_opacity, 0.05, 1, cur.reel_opacity)
    };

    await pool.query(
      `INSERT INTO watermark_settings
        (id, enabled, pos_x, pos_y, size, shape, opacity, bg_color, rotation, logo,
         reel_enabled, reel_pos_x, reel_pos_y, reel_size, reel_opacity)
       VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         enabled=?, pos_x=?, pos_y=?, size=?, shape=?, opacity=?, bg_color=?, rotation=?, logo=?,
         reel_enabled=?, reel_pos_x=?, reel_pos_y=?, reel_size=?, reel_opacity=?`,
      [
        next.enabled ? 1 : 0, String(next.pos_x), String(next.pos_y), String(next.size),
        next.shape, String(next.opacity), next.bg_color, String(next.rotation), next.logo,
        next.reel_enabled ? 1 : 0, String(next.reel_pos_x), String(next.reel_pos_y),
        String(next.reel_size), String(next.reel_opacity),

        next.enabled ? 1 : 0, String(next.pos_x), String(next.pos_y), String(next.size),
        next.shape, String(next.opacity), next.bg_color, String(next.rotation), next.logo,
        next.reel_enabled ? 1 : 0, String(next.reel_pos_x), String(next.reel_pos_y),
        String(next.reel_size), String(next.reel_opacity)
      ]
    );

    return next;
  }
};

module.exports = WatermarkModel;
