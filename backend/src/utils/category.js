module.exports = {
  sanitize: (s = "") => String(s).replace(/[^\w\u0900-\u097F-]+/g, "").slice(0, 30) || "misc",

  categoryFolder: {
    "समाचार": "news",
    "विश्व": "world",
    "स्थानीय तह": "local-level",
    "कला": "art",
    "राजनीति": "politics",
    "विचार": "opinion",
    "खेलकुद": "sports",
    "विविध": "miscellaneous"
  },

  folder: (cat) => module.exports.categoryFolder[cat] || module.exports.sanitize(cat)
};