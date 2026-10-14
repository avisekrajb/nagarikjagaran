module.exports = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "nagarik_admin_secret_2026",
  uploadPath: require("path").join(__dirname, "..", "..", "uploads")
};