/**
 * ============================================================
 *  🔐 साधारण एडमिन खाता (hardcoded)
 * ============================================================
 *  साँछेदारको database मा यो खाता पनि आफैँ बस्न्छ।
 *  .env को ADMIN_EMAIL/ADMIN_PASSWORD भन्दा **मान्यता** यही हुन्छ;
 *  .env खाली भए पनि खाता बस्छ।
 *
 *  यहाँ plaintext पासवर्ड छैन — bcrypt hash मात्र।
 * ============================================================
 */
module.exports = {
  ROLE: "admin",
  NAME: "Administrator",
  EMAIL: "a@gmail.com",

  PASSWORD_HASH: "$2a$10$F/jk3OR9HQFfXwNDHujiXuwK2IoFwvSZSjgFLi/l1TM3zIDOuauvG",

  IS_LOCKED: false,
};
