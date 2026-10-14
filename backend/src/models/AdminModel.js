const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

const publicFields = "id, name, email, is_active, role, is_locked, last_login, created_at";

const AdminModel = {
  findByEmail: async (email) => {
    const [rows] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.query(`SELECT ${publicFields} FROM admins WHERE id = ?`, [id]);
    return rows[0];
  },

  findByIdWithPassword: async (id) => {
    const [rows] = await pool.query("SELECT * FROM admins WHERE id = ?", [id]);
    return rows[0];
  },

  list: async () => {
    const [rows] = await pool.query(`SELECT ${publicFields} FROM admins ORDER BY id DESC`);
    return rows;
  },

  count: async () => {
    const [rows] = await pool.query("SELECT COUNT(*) AS c FROM admins");
    return Number(rows[0].c);
  },

  countActive: async () => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS c FROM admins WHERE is_active = 1"
    );
    return Number(rows[0].c);
  },

  create: async ({ name, email, password }) => {
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      "INSERT INTO admins(name,email,password,is_active) VALUES (?,?,?,1)",
      [name, email, hash]
    );
    return AdminModel.findById(r.insertId);
  },

  update: async (id, { name, email, is_active }) => {
    const sets = [];
    const vals = [];
    if (name !== undefined) { sets.push("name = ?"); vals.push(name); }
    if (email !== undefined) { sets.push("email = ?"); vals.push(email); }
    if (is_active !== undefined) {
      sets.push("is_active = ?");
      vals.push(Number(is_active) ? 1 : 0);
    }
    if (!sets.length) return AdminModel.findById(id);
    vals.push(id);
    await pool.query(`UPDATE admins SET ${sets.join(", ")} WHERE id = ?`, vals);
    return AdminModel.findById(id);
  },

  setPassword: async (id, plain) => {
    const hash = await bcrypt.hash(plain, 10);
    await pool.query("UPDATE admins SET password = ? WHERE id = ?", [hash, id]);
    return true;
  },

  /* बिर्सनुभएको पासवर्ड — इमेलबाट OTP मिलाएपछि मात्र */
  setPasswordByEmail: async (email, plain) => {
    const hash = await bcrypt.hash(plain, 10);
    const [r] = await pool.query(
      "UPDATE admins SET password = ? WHERE email = ?", [hash, String(email).trim().toLowerCase()]
    );
    return r.affectedRows > 0;
  },

  touchLogin: async (id) => {
    await pool.query("UPDATE admins SET last_login = NOW() WHERE id = ?", [id]);
  },

  remove: async (id) => {
    const [r] = await pool.query("DELETE FROM admins WHERE id = ?", [id]);
    return r.affectedRows > 0;
  }
};

module.exports = AdminModel;
