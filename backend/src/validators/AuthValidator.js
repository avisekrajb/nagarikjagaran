module.exports = class AuthValidator {
  static login(body = {}) {
    if (!body.email || !body.password) return "इमेल र पासवर्ड आवश्यक छ";
    return null;
  }
};