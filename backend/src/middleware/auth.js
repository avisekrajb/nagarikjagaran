const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");
const AdminModel = require("../models/AdminModel");
const asyncHandler = require("../utils/asyncHandler");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "कृपया पहिले लगइन गर्नुहोस्" });

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (e) {
    return res.status(401).json({ message: "सत्र समाप्त भयो, फेरि लगइन गर्नुहोस्" });
  }

  const admin = await AdminModel.findById(payload.id);
  if (!admin) return res.status(401).json({ message: "एडमिन खाता भेटिएन" });

  req.user = { id: admin.id, email: admin.email };
  req.admin = admin;

  // निष्क्रिय (inactive) एडमिनले हेर्न सक्छ, तर बदल्न सक्दैन।
  if (Number(admin.is_active) !== 1 && !SAFE_METHODS.has(req.method)) {
    return res.status(403).json({
      message: "तपाईंको एडमिन खाता निष्क्रिय छ — अहिले सम्पादन गर्न मिल्दैन",
      inactive: true
    });
  }

  next();
});
