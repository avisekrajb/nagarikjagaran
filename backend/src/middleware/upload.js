const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadPath } = require("../config");
const { folder, sanitize } = require("../utils/category");

function makeStorage(sub) {
  return multer.diskStorage({
    destination(req, file, cb) {
      let dir;
      if (sub === "news") dir = path.join(uploadPath, folder(req.body.category));
      else if (sub === "generic") dir = path.join(uploadPath, sanitize(req.body.category));
      else dir = path.join(uploadPath, sub);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname || ".jpg");
      cb(null, Date.now() + "-" + Math.round(Math.random() * 1e6) + ext);
    }
  });
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const imageFilter = (req, file, cb) => {
  if (IMAGE_TYPES.includes(String(file.mimetype || "").toLowerCase())) return cb(null, true);
  cb(new Error("JPG / PNG / WebP / GIF छवि मात्र अपलोड गर्नुहोस्"));
};

const newsUpload = multer({ storage: makeStorage("news"), limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: imageFilter });
const adsUpload = multer({ storage: makeStorage("ads"), fileFilter: imageFilter });
const genericUpload = multer({ storage: makeStorage("generic"), limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: imageFilter });

module.exports = { newsUpload, adsUpload, genericUpload, sanitize, folder, uploadPath };