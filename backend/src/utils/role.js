const { isSeedAdmin } = require("./seedAdmin");

/**
 * भूमिका जाँच।
 *
 *  admin      — साधारण एडमिन (साइट चलाउने)
 *  superadmin — सुपर एडमिन (सबै खण्ड)
 *  supersuper — सुपर-सुपर एडमिन (सबै हेर्छ, पासवर्ड मात्र बदल्छ)
 */
const SUPER_ONLY = [
  "/watermark",
  "/nav",
  "/maintenance",
  "/polls",
  "/scoreboard",
  "/activity",
  "/visitors",
];

const isSuper = (admin) => !!admin && (admin.role === "superadmin" || admin.role === "supersuper");
const isSuperSuper = (admin) => !!admin && admin.role === "supersuper";

/** route handler wrapper — superadmin / supersuper मा खुल्ने */
const requireSuper = (fn) => (req, res, next) => {
  if (!isSuper(req.admin)) {
    return res.status(403).json({ message: "यो खण्ड सुपर एडमिनलाई मात्र हो" });
  }
  return fn(req, res, next);
};

/** सबैभन्दा माथिल्लो खाता — सबै हेर्छ, तर आफैं बदल्दैन */
const requireSuperSuper = (fn) => (req, res, next) => {
  if (!isSuperSuper(req.admin)) {
    return res.status(403).json({ message: "यो खण्ड सुपर-सुपर एडमिनलाई मात्र हो" });
  }
  return fn(req, res, next);
};

/**
 * Auth middleware पछि चल्ने gate।
 * SUPER_ONLY prefix मा regular admin लाई 403 दिन्छ।
 */
const gateByRole = (req, res, next) => {
  if (isSuper(req.admin)) return next();
  const hit = SUPER_ONLY.some((p) => req.baseUrl === "/api" && req.path.startsWith(p));
  if (hit) {
    return res.status(403).json({ message: "यो खण्ड सुपर एडमिनलाई मात्र हो" });
  }
  return next();
};

module.exports = {
  isSuper, isSuperSuper,
  requireSuper, requireSuperSuper,
  gateByRole, SUPER_ONLY, isSeedAdmin,
};
