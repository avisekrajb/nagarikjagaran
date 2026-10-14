const { pool } = require("../config/db");
const bcrypt = require("bcrypt");

/**
 * Seed admin (.env बाट आएको ADMIN_EMAIL) ले पासवर्ड *बदल्न सक्दैन*।
 *
 * किन : यो खाता recovery/initial-access हो। असली एडमिनले आफ्नो पासवर्ड
 * बदल्दा पनि तपाईंसँग जुनचुन्डो entry point रहिरहुन्छ।
 * बदल्नुपरे .env मा ADMIN_EMAIL/ADMIN_PASSWORD सम्हाएर नयाँ खाता बनाउनुहोस्।
 */
const isSeedAdmin = (email) => {
  const seed = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  return !!seed && String(email || "").trim().toLowerCase() === seed;
};

module.exports = { isSeedAdmin };
