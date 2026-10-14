const { pool } = require("../config/db");

const TeamModel = {
  async find() {
    return (await pool.query("SELECT * FROM team ORDER BY id ASC"))[0];
  },

  async findById(id) {
    return (await pool.query("SELECT * FROM team WHERE id=?", [id]))[0][0] || null;
  },

  async create(d) {
    const [r] = await pool.query(
      "INSERT INTO team(name,photo,role,email,phone) VALUES (?,?,?,?,?)",
      [d.name, d.photo, d.role, d.email, d.phone]
    );
    return this.findById(r.insertId);
  },

  async update(id, d) {
    await pool.query(
      "UPDATE team SET name=?, photo=?, role=?, email=?, phone=? WHERE id=?",
      [d.name, d.photo, d.role, d.email, d.phone, id]
    );
    return this.findById(id);
  },

  async remove(id) {
    await pool.query("DELETE FROM team WHERE id=?", [id]);
  }
};

module.exports = TeamModel;