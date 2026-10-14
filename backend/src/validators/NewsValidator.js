module.exports = class NewsValidator {
  static create(body = {}) {
    if (!String(body.title || "").trim()) return "शीर्षक आवश्यक छ";
    if (!String(body.category || "").trim()) return "श्रेणी आवश्यक छ";
    return null;
  }
};