const fs = require("fs");

const MAGIC = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
  ],
  "image/webp": null,
  "image/avif": null
};

function verifyImage(req, res, next) {
  if (!req.file) return next();
  const path = req.file.path;
  try {
    const buf = fs.readFileSync(path);
    if (buf.length < 32) throw new Error("फाइल बिग्रिएको वा खाली छ — मान्य फोटो अपलोड गर्नुहोस्");
    const type = String(req.file.mimetype || "").toLowerCase();
    let ok = false;
    if (type === "image/webp") ok = buf.slice(0, 4).toString("latin1") === "RIFF" && buf.slice(8, 12).toString("latin1") === "WEBP";
    else if (type === "image/avif") ok = buf.slice(4, 12).toString("latin1") === "ftypavif";
    else {
      const sigs = MAGIC[type] || [];
      ok = sigs.some((s) => s.every((b, i) => buf[i] === b));
    }
    if (!ok) throw new Error("छवि फाइल मिलेन — PNG / JPG / WebP / GIF मान्य फोटो मात्र अपलोड गर्नुहोस्");
  } catch (e) {
    if (path) fs.unlink(path, () => {});
    return next(e);
  }
  next();
}

module.exports = verifyImage;