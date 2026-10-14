module.exports = (content = "") =>
  `${Math.max(1, Math.ceil(String(content).split(/\s+/).filter(Boolean).length / 50))} मिनेट`;