const { pool } = require("../config/db");

const ContactModel = {
  async find() {
    return (await pool.query("SELECT * FROM contacts ORDER BY id DESC"))[0];
  },

  async create(d) {
    const [r] = await pool.query("INSERT INTO contacts(name,email,message) VALUES (?,?,?)", [
      d.name, d.email, d.message
    ]);
    return { id: r.insertId };
  },

  async remove(id) {
    await pool.query("DELETE FROM contacts WHERE id=?", [id]);
  }
};

module.exports = ContactModel;