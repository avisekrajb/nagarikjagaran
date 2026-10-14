const { pool } = require("../../config/db");

/**
 * ================= v2 · सुपर एडमिन सम्बन्धी मोडल =================
 * यहाँ मात्र सुपर एडमिनले व्यवस्थापन गर्ने डाटा (settings, roles) हुन्छ।
 */

/** seed खाता हो कि छैन — seed को पासवर्ड बद्लिँदैन */
const SEED_EMAIL = () => String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();

const isSeedAdmin = (email) => {
  const seed = SEED_EMAIL();
  return !!seed && String(email || "").trim().toLowerCase() === seed;
};

const isSuper = (admin) => !!admin && admin.role === "superadmin";

/* ------------------------------------------------------------------
   site_settings — key/value। न्युबार, फिचर टगल, मर्मत मोड आदि यहाँ।
   ------------------------------------------------------------------ */
const DEFAULTS = {
  maintenance_on: false,
  maintenance_msg: "साइट मर्मतमा छ। कृपया केही बेरपर्खी लागि पर्नुहोस्।",
  show_patro: true,
  show_dark_mode: true,
  nav_buttons: "",       /* खाली भए असली मेनु प्रयोग हुन्छ */
  copyright: "",
  powered_by: "",
};

const SiteSettingModel = {
  all: async () => {
    const [rows] = await pool.query("SELECT setting_key, setting_value FROM site_settings");
    const out = { ...DEFAULTS };
    rows.forEach((r) => { out[r.setting_key] = r.setting_value; });
    /* "true"/"false" स्ट्रिङ -> boolean */
    ["maintenance_on", "show_patro", "show_dark_mode"].forEach((k) => {
      out[k] = String(out[k]) === "true";
    });
    return out;
  },

  set: async (key, value) => {
    const v = typeof value === "boolean" ? String(value) : String(value ?? "");
    await pool.query(
      `INSERT INTO site_settings(setting_key, setting_value) VALUES (?,?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, v, v]
    );
    return SiteSettingModel.all();
  },

  setMany: async (obj) => {
    for (const [k, v] of Object.entries(obj || {})) await SiteSettingModel.set(k, v);
    return SiteSettingModel.all();
  },
};

/** admins तालिकाको role/is_locked */
const AdminRoleModel = {
  list: async () => {
    const [rows] = await pool.query(
      "SELECT id, name, email, is_active, role, is_locked, last_login, created_at FROM admins ORDER BY id"
    );
    return rows.map((a) => ({ ...a, is_locked: Number(a.is_locked) === 1, role: a.role || "admin" }));
  },

  setRole: async (id, role) => {
    const r = role === "superadmin" ? "superadmin" : "admin";
    await pool.query("UPDATE admins SET role = ? WHERE id = ?", [r, id]);
    return AdminRoleModel.list();
  },

  setLocked: async (id, locked) => {
    await pool.query("UPDATE admins SET is_locked = ? WHERE id = ?", [Number(locked) === 1 ? 1 : 0, id]);
    return AdminRoleModel.list();
  },
};

module.exports = { SiteSettingModel, AdminRoleModel, isSeedAdmin, isSuper, DEFAULTS };
