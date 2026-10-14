module.exports = class AdsValidator {
  static create(body = {}) {
    if (!String(body.title || "").trim()) return "विज्ञापनको शीर्षक आवश्यक छ";
    return null;
  }
};