const { pool } = require("../config/db");

const defaultFooter = {
  description:
    "विश्वसनीय समाचार, तथ्यमा आधारित विश्लेषण र नेपाली समाजका आवाजहरूलाई एउटै डिजिटल घरमा जोड्ने आधुनिक समाचार पोर्टल।",
  email: "hello@nagariknews.example",
  phone: "+९७७ १ ४१२३४५६",
  facebook: "https://facebook.com/nagariknews",
  instagram: "https://instagram.com/nagariknews",
  youtube: "https://youtube.com/nagariknews",
  logo: "",
  motto: "निष्पक्ष र विश्वसनीय पत्रकारिता",
  editor: "सम्पादक: कृष्णप्रसाद मरासिनी / ९८४१३७२४६०",
  registration: "दर्ता प्रमाणपत्र नं.: ३१३१-२०७८/७९",
  press_council: "प्रेस काउन्सिल नं.: ३१४७-२०७८/७९",
  company_reg: "कम्पनी रजिस्टरको कार्यालय.: २७०१६९/०७८/०७९",
  mini_navbar_color: "#1e3a8a",
  marquee_color: "#064e3b"
};

const FooterModel = {
  default: defaultFooter,

  async get() {
    const [rows] = await pool.query("SELECT * FROM footer_data WHERE id = 1");
    return rows[0] || defaultFooter;
  },

  async update(data) {
    await pool.query(
      "UPDATE footer_data SET description=?,email=?,phone=?,facebook=?,instagram=?,youtube=?,logo=?,motto=?,editor=?,registration=?,press_council=?,company_reg=?,mini_navbar_color=?,marquee_color=? WHERE id=1",
      [
        data.description || "",
        data.email || "",
        data.phone || "",
        data.facebook || "",
        data.instagram || "",
        data.youtube || "",
        data.logo || "",
        data.motto || "",
        data.editor || "",
        data.registration || "",
        data.press_council || "",
        data.company_reg || "",
        data.mini_navbar_color || "#1e3a8a",
        data.marquee_color || "#064e3b"
      ]
    );
    const [rows] = await pool.query("SELECT * FROM footer_data WHERE id = 1");
    return rows[0];
  }
};

module.exports = FooterModel;