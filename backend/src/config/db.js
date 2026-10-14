const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 12,
  charset: "utf8mb4_unicode_ci"
});

async function initDB() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
  });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_active TINYINT DEFAULT 1,
    role VARCHAR(20) DEFAULT 'admin',
    is_locked TINYINT DEFAULT 0,
      last_login DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  try {
    await pool.query("ALTER TABLE admins ADD COLUMN is_active TINYINT DEFAULT 1");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE admins ADD COLUMN last_login DATETIME NULL");
  } catch (e) {}
  try {
    await pool.query("UPDATE admins SET is_active = 1 WHERE is_active IS NULL");
  } catch (e) {}

  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitor_logs(
      id INT AUTO_INCREMENT PRIMARY KEY,
      visitor_key VARCHAR(64) NOT NULL,
      path VARCHAR(255) DEFAULT '',
      referrer VARCHAR(255) DEFAULT '',
      device VARCHAR(30) DEFAULT 'desktop',
      country VARCHAR(80) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_visitor_key (visitor_key),
      INDEX idx_visitor_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs(
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT DEFAULT NULL,
      admin_name VARCHAR(120) DEFAULT '',
      admin_email VARCHAR(160) DEFAULT '',
      action VARCHAR(40) NOT NULL,
      entity VARCHAR(60) DEFAULT '',
      details VARCHAR(500) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_activity_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS news(
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) DEFAULT '',
      summary TEXT,
      content LONGTEXT,
      category VARCHAR(80) NOT NULL,
      image VARCHAR(500) DEFAULT '',
      date VARCHAR(80) DEFAULT '',
      author VARCHAR(120) DEFAULT '',
      author_photo VARCHAR(500) DEFAULT '',
      author_bio TEXT,
      yt_link VARCHAR(500) DEFAULT '',
      tags VARCHAR(255) DEFAULT '',
      status VARCHAR(20) DEFAULT 'published',
      reading_time VARCHAR(40) DEFAULT '',
      view_count INT DEFAULT 0,
      click_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ads(
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(160) NOT NULL,
      image VARCHAR(500) DEFAULT '',
    link VARCHAR(500) DEFAULT '',
    description VARCHAR(500) DEFAULT '',
    position VARCHAR(40) DEFAULT 'sidebar',
      enabled TINYINT DEFAULT 1,
      expire_date VARCHAR(40) DEFAULT '',
      view_count INT DEFAULT 0,
      click_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  try {
    await pool.query("ALTER TABLE ads ADD COLUMN expire_date VARCHAR(40) DEFAULT ''");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE ads ADD COLUMN view_count INT DEFAULT 0");
  } catch (e) {}
  /* ---- एडमिन भूमिका (role) : superadmin ले सबै गर्न सक्छ, admin ले सीमित ---- */
  try {
    await pool.query("ALTER TABLE admins ADD COLUMN role VARCHAR(20) DEFAULT 'admin' AFTER is_active");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE admins ADD COLUMN is_locked TINYINT DEFAULT 0 AFTER role");
  } catch (e) {}

  /* ---- v2 : सुपर एडमिनका सेटिङ (मर्मत मोड, फिचर टगल, न्युबार …) ---- */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings(
      setting_key VARCHAR(80) PRIMARY KEY,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  const seedSettings = [
    ["maintenance_on", "false"],
    ["show_patro", "true"],
    ["show_dark_mode", "true"],
    ["marquee_color", "#064e3b"],
  ];
  for (const [k, v] of seedSettings) {
    await pool.query("INSERT IGNORE INTO site_settings(setting_key, setting_value) VALUES (?,?)", [k, v]);
  }

  /* ---- visitor_logs मा IP ---- */
  try { await pool.query("ALTER TABLE visitor_logs ADD COLUMN ip VARCHAR(64) DEFAULT ''"); } catch (e) {}

  /* ================= v2 : पोल (Polls) ================= */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS polls(
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(300) NOT NULL,
      is_active TINYINT DEFAULT 1,
      show_in_sidebar TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS poll_options(
      id INT AUTO_INCREMENT PRIMARY KEY,
      poll_id INT NOT NULL,
      label VARCHAR(200) NOT NULL,
      votes INT DEFAULT 0,
      INDEX idx_poll_opt (poll_id),
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS poll_votes(
      id INT AUTO_INCREMENT PRIMARY KEY,
      poll_id INT NOT NULL,
      option_id INT NOT NULL,
      voter_key VARCHAR(80) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_vote (poll_id, voter_key),
      INDEX idx_vote_poll (poll_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  /* ================= v2 : परिवर्तन अनुमति (Approval) ================= */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS change_requests(
      id INT AUTO_INCREMENT PRIMARY KEY,
      req_key VARCHAR(80) NOT NULL UNIQUE,
      admin_id INT NOT NULL,
      admin_email VARCHAR(190) NOT NULL,
      admin_name VARCHAR(120) DEFAULT '',
      change_type VARCHAR(40) NOT NULL,
      summary VARCHAR(255) DEFAULT '',
      payload JSON,
      status VARCHAR(20) DEFAULT 'pending',
      otp_hash VARCHAR(120) DEFAULT '',
      otp_salt VARCHAR(64) DEFAULT '',
      otp_tries INT DEFAULT 0,
      otp_expires_at DATETIME DEFAULT NULL,
      note VARCHAR(255) DEFAULT '',
      decided_by VARCHAR(190) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME DEFAULT NULL,
      decided_at DATETIME DEFAULT NULL,
      INDEX idx_cr_status (status),
      INDEX idx_cr_admin (admin_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  /* पुरानो तालिकामा OTP काेलम छैन भने थप */
  for (const c of [
    "otp_hash VARCHAR(120) DEFAULT ''",
    "otp_salt VARCHAR(64) DEFAULT ''",
    "otp_tries INT DEFAULT 0",
    "otp_expires_at DATETIME DEFAULT NULL",
  ]) {
    try { await pool.query(`ALTER TABLE change_requests ADD COLUMN ${c}`); } catch (e) {}
  }

  /* ================= v2 : स्कोरबोर्ड ================= */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scoreboard(
      id INT AUTO_INCREMENT PRIMARY KEY,
      match_label VARCHAR(200) NOT NULL,
      home_team VARCHAR(120) NOT NULL,
      away_team VARCHAR(120) NOT NULL,
      home_score INT DEFAULT 0,
      away_score INT DEFAULT 0,
      home_logo VARCHAR(500) DEFAULT '',
      away_logo VARCHAR(500) DEFAULT '',
      status VARCHAR(20) DEFAULT 'live',
      is_active TINYINT DEFAULT 1,
      show_float TINYINT DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  /* ================= v2 : विज्ञापन स्थान ================= */
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ad_positions(
      id INT AUTO_INCREMENT PRIMARY KEY,
      key_name VARCHAR(60) NOT NULL UNIQUE,
      label VARCHAR(160) NOT NULL,
      page_hint VARCHAR(255) DEFAULT '',
      sort_order INT DEFAULT 0,
      is_enabled TINYINT DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  try {
    await pool.query(`INSERT IGNORE INTO ad_positions(key_name,label,page_hint,sort_order) VALUES
      ('sidebar','साइडबार (सबै पेज)','दायाँ स्तम्भ — सबै पेजको साइडबारमा',1),
      ('splash','स्प्ल्यास (पर्दा स्क्रिन)','सबै पेज — खुल्दा देखिने पूरा स्क्रिन विज्ञापन',2),
      ('header','हेडर (माथि)','सबै पेज — हेडरको ठीक माथि',3),
      ('ticker-after','ताजा खबर मार्की पछि','गृहपृष्ठ — मार्कीको ठीक तल',4),
      ('page-top','पेजको माथि (फुल-विड्थ)','सबै पेज — हेडरको ठीक तल',5),
      ('page-end','पेजको अन्त्य (फुल-विड्थ)','सबै पेज — फुटरको ठीक तल',6),
      ('home-main','गृहपृष्ठ — मुख्य खण्ड','गृहपृष्ठ — ताजा खबरको माथि',7),
      ('home-bulletin','गृहपृष्ठ — बुलेटिन पछि','गृहपृष्ठ — समाचार बुलेटिनको ठीक तल',8),
      ('home-marquee','गृहपृष्ठ — मार्की पछि','गृहपृष्ठ — फोटो मार्कीको ठीक तल',9),
      ('article-top','समाचार — शीर्षक पछि','विवरण पेज — मुख्य फोटोको ठीक तल',10),
      ('article-middle','समाचार — बीचमा','विवरण पेज — सामग्रीको बीचमा',11),
      ('article-bottom','समाचार — अन्त्यमा','विवरण पेज — सामग्री सकिएपछि',12),
      ('article-after-comments','समाचार — टिप्पणी पछि','विवरण पेज — टिप्पणीको ठीक तल',13),
      ('article-after-related','समाचार — सम्बन्धित पछि','विवरण पेज — सम्बन्धित सामग्रीको ठीक तल',14)
    `);
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE ads ADD COLUMN click_count INT DEFAULT 0");
  } catch (e) {}

  try {
    await pool.query("UPDATE ads SET position='banner' WHERE position='header-right'");
    await pool.query("UPDATE ads SET position='sidebar' WHERE id=1 AND position='banner'");
  } catch (e) {
    // ads may not exist yet
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers(
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(160) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reels(
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      video_url VARCHAR(500) NOT NULL,
      thumbnail VARCHAR(500) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS footer_data(
      id INT PRIMARY KEY,
      description TEXT,
      email VARCHAR(160),
      phone VARCHAR(80),
      facebook VARCHAR(500),
      instagram VARCHAR(500),
      youtube VARCHAR(500),
      logo VARCHAR(500) DEFAULT '',
      motto TEXT,
      editor TEXT,
      registration TEXT,
      press_council TEXT,
      company_reg TEXT,
      mini_navbar_color VARCHAR(50) DEFAULT '#1e3a8a',
      marquee_color VARCHAR(50) DEFAULT '#064e3b'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS header_settings(
      id INT PRIMARY KEY,
      photo VARCHAR(500) DEFAULT ''
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  try {
    await pool.query("INSERT IGNORE INTO header_settings(id,photo) VALUES (1,'')");
  } catch (e) {}

  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments(
      id INT AUTO_INCREMENT PRIMARY KEY,
      news_id INT NOT NULL,
      name VARCHAR(120) DEFAULT 'पाठक',
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      email VARCHAR(160) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS team(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      photo VARCHAR(500) DEFAULT '',
      role VARCHAR(160) DEFAULT '',
      email VARCHAR(160) DEFAULT '',
      phone VARCHAR(80) DEFAULT ''
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // "नयाँ समाचार माथि" ORDER BY created_at DESC, id DESC छ — यही index ले त्यसलाई
  // full table scan बिना सोर्छ। डाटा बढ्दै जाँदा पनि सूची पेज ढिलो नहोस्।
  try { await pool.query("CREATE INDEX idx_news_status_created ON news(status, created_at DESC, id DESC)"); } catch (e) {}
  try { await pool.query("CREATE INDEX idx_news_cat_created ON news(category, created_at DESC, id DESC)"); } catch (e) {}
  // "ट्रेन्डिङ" छनोट: ORDER BY click_count DESC, view_count DESC छुन्छ —
  // यसैका लागि index। "SELECT *" बाट LONGTEXT content नहटाए यो slow हुन्थ्यो।
  try { await pool.query("CREATE INDEX idx_news_trend ON news(status, click_count DESC, view_count DESC)"); } catch (e) {}

  try {
    await pool.query("ALTER TABLE news ADD COLUMN subtitle VARCHAR(255) DEFAULT ''");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE news ADD COLUMN yt_link VARCHAR(500) DEFAULT ''");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE news ADD COLUMN tags VARCHAR(255) DEFAULT ''");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE news ADD COLUMN author_photo VARCHAR(500) DEFAULT ''");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE news ADD COLUMN status VARCHAR(20) DEFAULT 'published'");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE news ADD COLUMN reading_time VARCHAR(40) DEFAULT ''");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE news ADD COLUMN view_count INT DEFAULT 0");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE news ADD COLUMN click_count INT DEFAULT 0");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE news ADD COLUMN author_bio TEXT");
  } catch (e) {}

  await pool.query(`
    CREATE TABLE IF NOT EXISTS watermark_settings(
      id INT PRIMARY KEY,
      enabled TINYINT DEFAULT 1,
      pos_x VARCHAR(10) DEFAULT '78',
      pos_y VARCHAR(10) DEFAULT '80',
      size VARCHAR(10) DEFAULT '150',
      shape VARCHAR(20) DEFAULT 'rounded',
      opacity VARCHAR(10) DEFAULT '0.4',
      bg_color VARCHAR(20) DEFAULT '#ffffff',
        rotation VARCHAR(10) DEFAULT '0',
        logo VARCHAR(500) DEFAULT '',
        reel_enabled TINYINT DEFAULT 1,
        reel_pos_x VARCHAR(10) DEFAULT '88',
        reel_pos_y VARCHAR(10) DEFAULT '30',
        reel_size VARCHAR(10) DEFAULT '34',
        reel_opacity VARCHAR(10) DEFAULT '0.9',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    /* पुरानो तालिकामा नयाँ स्तम्भ छैनन् — थप्ने */
    const ensureWatermarkColumn = async (name, ddl) => {
      const [cols] = await pool.query("SHOW COLUMNS FROM watermark_settings LIKE ?", [name]);
      if (!cols.length) await pool.query(`ALTER TABLE watermark_settings ADD COLUMN ${ddl}`);
    };
    await ensureWatermarkColumn("reel_enabled", "reel_enabled TINYINT DEFAULT 1 AFTER logo");
    await ensureWatermarkColumn("reel_pos_x", "reel_pos_x VARCHAR(10) DEFAULT '88' AFTER reel_enabled");
    await ensureWatermarkColumn("reel_pos_y", "reel_pos_y VARCHAR(10) DEFAULT '30' AFTER reel_pos_x");
    await ensureWatermarkColumn("reel_size", "reel_size VARCHAR(10) DEFAULT '34' AFTER reel_pos_y");
    await ensureWatermarkColumn("reel_opacity", "reel_opacity VARCHAR(10) DEFAULT '0.9' AFTER reel_size");

  try {
    await pool.query("INSERT IGNORE INTO watermark_settings(id,enabled) VALUES (1,1)");
  } catch (e) {}

  await pool.query(`
    CREATE TABLE IF NOT EXISTS patro_holidays(
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(160) NOT NULL,
      holiday_date VARCHAR(20) DEFAULT '',
      bs_year VARCHAR(10) DEFAULT '',
      bs_month VARCHAR(10) DEFAULT '',
      bs_day VARCHAR(10) DEFAULT '',
      description VARCHAR(255) DEFAULT '',
      is_enabled TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_patro_date (holiday_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS patro_settings(
      id INT PRIMARY KEY,
      sunday_holiday TINYINT DEFAULT 1,
      saturday_holiday TINYINT DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  try {
    await pool.query("INSERT IGNORE INTO patro_settings(id,sunday_holiday,saturday_holiday) VALUES (1,0,1)");
  } catch (e) {}

  try {
    await pool.query("ALTER TABLE patro_holidays ADD COLUMN description VARCHAR(255) DEFAULT ''");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE patro_holidays ADD COLUMN is_enabled TINYINT DEFAULT 1");
  } catch (e) {}

  try {
    await pool.query("ALTER TABLE patro_settings ADD COLUMN sunday_holiday TINYINT DEFAULT 1");
  } catch (e) {}
  try {
    await pool.query("ALTER TABLE patro_settings ADD COLUMN saturday_holiday TINYINT DEFAULT 1");
  } catch (e) {}

  /* ---- तीनवटै hardcoded खाता (password/ फोल्डर) यहाँ आउँछन् ---- */
  await require("../controllers/password").ensureSeeded();

  /* ---- पुरानो 'कला/मनोरञ्जन' श्रेणीलाई canonical 'कला' मा migrate ---- */
  await pool.query("UPDATE news SET category='कला' WHERE category='कला/मनोरञ्जन'").catch(() => {});

  /* ---- समाचार seed : प्रत्येक श्रेणी (७) × ६ (idempotent top-up) ---- */
  const seedByCategory = {
    "स्थानीय तह": [
      { title: "काठमाडौं महानगरपालिकाले सडक विस्तारको लागि ५० करोड बजेट बाँडफाँड", summary: "काठमाडौं महानगरपालिकाले सडक विस्तार तथा मरम्मतका लागि ५० करोड रुपैयाँको बजेट बाँडफाँड गरेको छ।", image: "https://picsum.photos/seed/local1/800/450", author: "राम श्रेष्ठ" },
      { title: "ललितपुरमा नयाँ अस्पताल भवन निर्माण सुरु", summary: "ललितपुर महानगरपालिकाले ३० बेडको नयाँ अस्पताल भवन निर्माण सुरु गरेको छ।", image: "https://picsum.photos/seed/local2/800/450", author: "सीता गुरुङ" },
      { title: "भक्तपुरमा परम्परागत जात्रा धूमधामका साथ सम्पन्न", summary: "भक्तपुर नगरपालिकाको वार्षिक जात्रा धूमधामका साथ सम्पन्न भयो, हजारौं सहभागी।", image: "https://picsum.photos/seed/local3/800/450", author: "कृष्ण प्रसाद" },
      { title: "काभ्रेमा बिद्युत लाइन विस्तार योजना सुरु", summary: "काभ्रे जिल्लाका ग्रामीण क्षेत्रमा बिद्युत लाइन विस्तार योजना सुरु भएको छ।", image: "https://picsum.photos/seed/local4/800/450", author: "गोपाल अधिकारी" },
      { title: "धादिङमा सिँचाइ योजनाको शिलान्यास", summary: "धादिङ जिल्लामा किसानहरूका लागि नयाँ सिँचाइ योजनाको शिलान्यास भयो।", image: "https://picsum.photos/seed/local5/800/450", author: "माया तामाङ" },
      { title: "नुवाकोटमा विद्यालय भवन निर्माण पुरा", summary: "नुवाकोट जिल्लाका दुई विद्यालयहरूको नयाँ भवन निर्माण पुरा भएको छ।", image: "https://picsum.photos/seed/local6/800/450", author: "हरि अधिकारी" }
    ],
    "कला": [
      { title: "प्रसिद्ध गायक नारायण गोपालको स्मृति दिवस मनाइयो", summary: "नेपालका प्रसिद्ध गायक नारायण गोपालको स्मृति दिवस काठमाडौंमा धूमधामका साथ मनाइयो।", image: "https://picsum.photos/seed/art1/800/450", author: "अनिल शर्मा" },
      { title: "नयाँ चलचित्र 'प्रेम गीत ४' को ट्रेलर सार्वजनिक", summary: "लोकप्रिय चलचित्र श्रृंखलाको चौथो भाग 'प्रेम गीत ४' को ट्रेलर सार्वजनिक भएको छ।", image: "https://picsum.photos/seed/art2/800/450", author: "प्रिया शाह" },
      { title: "लोक दोहोरी गायक पदम बहादुरको नयाँ एलबम बजारमा", summary: "प्रसिद्ध लोक दोहोरी गायक पदम बहादुरको नयाँ एलबम बजारमा आउने तयारीमा छ।", image: "https://picsum.photos/seed/art3/800/450", author: "संजय गुरुङ" },
      { title: "काठमाडौं अन्तर्राष्ट्रिय फिल्म महोत्सव सुरु", summary: "काठमाडौंमा आयोजित अन्तर्राष्ट्रिय फिल्म महोत्सव सुरु भएको छ, ३० मुलुकका फिल्म सहभागी।", image: "https://picsum.photos/seed/art4/800/450", author: "रञ्जना थापा" },
      { title: "लोकप्रिय हास्य कलाकार हरि बन्साको नयाँ कार्यक्रम", summary: "प्रसिद्ध हास्य कलाकार हरि बन्साले नयाँ टेलिभिजन कार्यक्रम सुरु गर्ने तयारीमा छन्।", image: "https://picsum.photos/seed/art5/800/450", author: "विक्रम राई" },
      { title: "शास्त्रीय नृत्यका युवा प्रतिभाहरूको प्रदर्शन", summary: "काठमाडौंमा आयोजित शास्त्रीय नृत्य प्रतियोगितामा युवा प्रतिभाहरूले उत्कृष्ट प्रदर्शन गरे।", image: "https://picsum.photos/seed/art6/800/450", author: "सुष्मिता कार्की" }
    ],
    "खेलकुद": [
      { title: "नेपाल राष्ट्रिय टोलीले जितेको दक्षिण एसियाली फुटबल", summary: "नेपालको राष्ट्रिय फुटबल टोलीले दक्षिण एसियाली च्याम्पियनशिप जितेर इतिहास रच्यो।", image: "https://picsum.photos/seed/sports1/800/450", author: "विजय थापा" },
      { title: "क्रिकेटमा नेपालले जय पाएको त्रिकोणीय श्रृंखला", summary: "नेपालले त्रिकोणीय क्रिकेट श्रृंखलामा दुवै प्रतिद्वन्द्वीलाई हराएर जय प्राप्त गरेको छ।", image: "https://picsum.photos/seed/sports2/800/450", author: "सुरज श्रेष्ठ" },
      { title: "ओलम्पिकका लागि नेपाली तैराकहरूको चयन", summary: "आउँदा ओलम्पिक खेलका लागि नेपाली तैराकहरूको चयन प्रक्रिया सुरु भएको छ।", image: "https://picsum.photos/seed/sports3/800/450", author: "निशा गुरुङ" },
      { title: "राष्ट्रिय खेलकुद महोत्सव पोखरामा सुरु", summary: "वार्षिक राष्ट्रिय खेलकुद महोत्सव पोखरामा भव्य उद्घाटनसहित सुरु भएको छ।", image: "https://picsum.photos/seed/sports4/800/450", author: "राम बाबु यादव" },
      { title: "नेपालले बालीबलमा क्षेत्रीय च्याम्पियन बनेको", summary: "नेपालको महिला बालीबल टोलीले क्षेत्रीय च्याम्पियनशिप जितेर इतिहास रच्यो।", image: "https://picsum.photos/seed/sports5/800/450", author: "गीता पौडेल" },
      { title: "युवा मुक्केबाजले एसियाली खेलमा पदक जिते", summary: "नेपाली युवा मुक्केबाजहरूले एसियाली मुक्केबाजी च्याम्पियनशिपमा रजत पदक जितेका छन्।", image: "https://picsum.photos/seed/sports6/800/450", author: "सुनील थापा" }
    ],
    "विश्व": [
      { title: "संयुक्त राष्ट्रसंघ महासभामा जलवायु संकटबारे नयाँ प्रस्ताव पारित", summary: "संयुक्त राष्ट्रसंघको महासभाले जलवायु संकटसम्बन्धी नयाँ प्रस्ताव पारित गरेको छ।", image: "https://picsum.photos/seed/world1/800/450", author: "सन्दीप केसी" },
      { title: "अमेरिका–चीन व्यापार वार्तामा महत्वपूर्ण सहमति नजिक", summary: "अमेरिका र चीनबीचको व्यापार वार्ताले महत्वपूर्ण सहमति नजिक पुगेको संकेत दिएको छ।", image: "https://picsum.photos/seed/world2/800/450", author: "प्रकाश जोशी" },
      { title: "युरोपेली संघले ऊर्जा सुरक्षामा नयाँ योजना सार्वजनिक गर्‍यो", summary: "युरोपेली संघले आगामी वर्षका लागि ऊर्जा सुरक्षा तथा स्वच्छ ऊर्जा योजना सार्वजनिक गरेको छ।", image: "https://picsum.photos/seed/world3/800/450", author: "अनु श्रेष्ठ" },
      { title: "जापानमा आएको शक्तिशाली भूकम्पपछि उद्धार कार्य जारी", summary: "जापानमा गएको शक्तिशाली भूकम्पपछि उद्धार तथा राहत कार्य पूर्ण रूपमा जारी छ।", image: "https://picsum.photos/seed/world4/800/450", author: "विनय तामाङ" },
      { title: "अफ्रिकी देशहरूले क्षेत्रीय शान्ति सम्झौतामा हस्ताक्षर गरे", summary: "अफ्रिकी राष्ट्रहरूले क्षेत्रीय शान्ति र सहकार्यका लागि नयाँ सम्झौतामा हस्ताक्षर गरेका छन्।", image: "https://picsum.photos/seed/world5/800/450", author: "कविता राई" },
      { title: "अन्तर्राष्ट्रिय मुद्रा कोषले विश्व अर्थतन्त्रको पूर्वानुमान सार्वजनिक गर्‍यो", summary: "अन्तर्राष्ट्रिय मुद्रा कोषले आगामी वर्षको विश्व आर्थिक वृद्धि सम्बन्धी पूर्वानुमान सार्वजनिक गरेको छ।", image: "https://picsum.photos/seed/world6/800/450", author: "दीपक अधिकारी" }
    ],
    "राजनीति": [
      { title: "संसदमा नयाँ बजेटबारे प्रतिनिधिसभामा बहस सुरु", summary: "प्रतिनिधिसभामा आगामी आर्थिक वर्षको नयाँ बजेटबारे विस्तृत बहस सुरु भएको छ।", image: "https://picsum.photos/seed/pol1/800/450", author: "रमेश खड्का" },
      { title: "प्रमुख राजनीतिक दलहरूबीच सामूहिक सहमतिको प्रयास", summary: "प्रमुख राजनीतिक दलहरूले राष्ट्रिय महत्वका विषयमा सामूहिक सहमति खोजिरहेका छन्।", image: "https://picsum.photos/seed/pol2/800/450", author: "सुजाता पौडेल" },
      { title: "निर्वाचन आयोगले आगामी चुनावको कार्यतालिका सार्वजनिक गर्‍यो", summary: "निर्वाचन आयोगले आगामी स्थानीय तह निर्वाचनको कार्यतालिका सार्वजनिक गरेको छ।", image: "https://picsum.photos/seed/pol3/800/450", author: "भीम बहादुर" },
      { title: "नयाँ कानुनमार्फत स्थानीय सुशासन सुदृढ गर्ने तयारी", summary: "नयाँ विधेयकमार्फत स्थानीय तहको सुशासन र जवाफदेहिता सुदृढ गर्ने तयारी भइरहेको छ।", image: "https://picsum.photos/seed/pol4/800/450", author: "कमला भट्ट" },
      { title: "प्रदेश सरकारले नयाँ नीति तथा कार्यक्रम सार्वजनिक गर्‍यो", summary: "प्रदेश सरकारले आगामी वर्षका लागि नयाँ नीति तथा कार्यक्रम सार्वजनिक गरेको छ।", image: "https://picsum.photos/seed/pol5/800/450", author: "निरजला शर्मा" },
      { title: "कानुन निर्माण प्रक्रियामा नागरिक सहभागिता बढाउने पहल", summary: "कानुन निर्माण प्रक्रियामा नागरिक सहभागिता बढाउने उद्देश्यले नयाँ पहल सुरु भएको छ।", image: "https://picsum.photos/seed/pol6/800/450", author: "रोशन गुरुङ" }
    ],
    "विचार": [
      { title: "शिक्षा प्रणाली सुधार्न चाहिने संरचनागत सोच", summary: "समावेशी र गुणस्तरीय शिक्षाका लागि संरचनागत सुधार आवश्यक रहेको विश्लेषण।", image: "https://picsum.photos/seed/opi1/800/450", author: "डा. हरि दाहाल" },
      { title: "जलवायु परिवर्तनसँग जुध्न स्थानीय स्तरको भूमिका", summary: "जलवायु परिवर्तनको असर न्यूनीकरणमा स्थानीय स्तरको सक्रिय भूमिका अपरिहार्य छ।", image: "https://picsum.photos/seed/opi2/800/450", author: "शान्ता लामिछाने" },
      { title: "सञ्चारमाध्यमको विश्वसनीयता जोगाउन आवश्यक सुधार", summary: "स्वतन्त्र र जवाफदेही सञ्चारका लागि आवश्यक संस्थागत सुधारबारे विचार।", image: "https://picsum.photos/seed/opi3/800/450", author: "गोपाल कँडेल" },
      { title: "स्वास्थ्य सेवामा समान पहुँचका लागि नीतिगत सुझाव", summary: "दुर्गम क्षेत्रमा पनि गुणस्तरीय स्वास्थ्य सेवा पुर्‍याउन नीतिगत सुझाव।", image: "https://picsum.photos/seed/opi4/800/450", author: "डा. सरिता थापा" },
      { title: "युवा रोजगारी समस्याको दिगो समाधान खोज्नुपर्छ", summary: "युवा पलायन रोक्न सीप विकास तथा स्वदेशी रोजगारीमा लगानी बढाउनुपर्ने विचार।", image: "https://picsum.photos/seed/opi5/800/450", author: "अनिश राई" },
      { title: "लोकतन्त्र सुदृढ गर्न जवाफदेहिताको महत्व", summary: "संस्थागत जवाफदेहिता र पारदर्शिता लोकतन्त्र सुदृढीकरणका आधारस्तम्भ हुन्।", image: "https://picsum.photos/seed/opi6/800/450", author: "बुद्धि प्रसाद" }
    ],
    "विविध": [
      { title: "नेपाली हस्तकलाको अन्तर्राष्ट्रिय बजारमा बढ्दो माग", summary: "नेपाली हस्तकलाका उत्पादनको अन्तर्राष्ट्रिय बजारमा माग उल्लेख्य रूपमा बढेको छ।", image: "https://picsum.photos/seed/misc1/800/450", author: "सञ्चिता महर्जन" },
      { title: "वातावरणमैत्री पर्यटन प्रवर्द्धनका नयाँ अभियान", summary: "वातावरणमैत्री तथा दिगो पर्यटन प्रवर्द्धनका लागि नयाँ अभियान सुरु भएको छ।", image: "https://picsum.photos/seed/misc2/800/450", author: "दिपेश शेर्पा" },
      { title: "सामुदायिक पुस्तकालयहरूको पुनर्जागरण", summary: "सामुदायिक पुस्तकालयहरूले पढ्ने संस्कृति फर्काउने अभियान सुरु गरेका छन्।", image: "https://picsum.photos/seed/misc3/800/450", author: "रिता तामाङ" },
      { title: "साइकल यात्रामार्फत सहरी प्रदूषण घटाउने अभियान", summary: "साइकल यात्रा प्रवर्द्धन गरेर सहरी प्रदूषण घटाउने अभियान चलेको छ।", image: "https://picsum.photos/seed/misc4/800/450", author: "किरण श्रेष्ठ" },
      { title: "स्थानीय उत्पादनमा आधारित उद्यमशीलता बढ्दो", summary: "स्थानीय कच्चा पदार्थमा आधारित साना उद्यमहरू विस्तार हुँदै गएका छन्।", image: "https://picsum.photos/seed/misc5/800/450", author: "पूजा अधिकारी" },
      { title: "पारम्परिक खानपान संरक्षणमा युवा पुस्ताको रुचि", summary: "परम्परागत नेपाली खानपान संरक्षणमा युवा पुस्ताको रुचि बढ्दो छ।", image: "https://picsum.photos/seed/misc6/800/450", author: "समीर तुलाधर" }
    ]
  };

  for (const [category, items] of Object.entries(seedByCategory)) {
    let added = 0;
    for (const n of items) {
      const [existsRows] = await pool.query("SELECT COUNT(*) AS c FROM news WHERE category = ? AND title = ?", [category, n.title]);
      if (existsRows[0].c > 0) continue;
      await pool.query(
        `INSERT INTO news(title, subtitle, summary, content, category, image, date, author, author_bio, status, reading_time) VALUES (?,?,?,?,?,?,?,?,?,'published','५ मिनेट')`,
        [n.title, '', n.summary, n.summary + ' विस्तृत विवरण यहाँ थप्न सकिनेछ।', category, n.image, new Date().toISOString().split('T')[0], n.author, 'यो लेखकको संक्षिप्त परिचय यहाँ लेख्न सकिनेछ।', '५ मिनेट']
      );
      added++;
    }
    if (added) console.log(`समाचार seed : '${category}' श्रेणीमा ${added} नयाँ थपियो`);
  }

  const [footers] = await pool.query("SELECT COUNT(*) AS c FROM footer_data");
  if (footers[0].c === 0) {
    await pool.query(
      "INSERT INTO footer_data(id,description,email,phone,facebook,instagram,youtube,logo,motto,editor,registration,press_council,company_reg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        1,
        "विश्वसनीय समाचार, तथ्यमा आधारित विश्लेषण र नेपाली समाजका आवाजहरूलाई एउटै डिजिटल घरमा जोड्ने आधुनिक समाचार पोर्टल।",
        "hello@nagariknews.example",
        "+९७७ १ ४१२३४५६",
        "https://facebook.com/nagariknews",
        "https://instagram.com/nagariknews",
        "https://youtube.com/nagariknews",
        "",
        "निष्पक्ष र विश्वसनीय पत्रकारिता",
        "सम्पादक: कृष्णप्रसाद मरासिनी / ९८४१३७२४६०",
        "दर्ता प्रमाणपत्र नं.: ३१३१-२०७८/७९",
        "प्रेस काउन्सिल नं.: ३१४७-२०७८/७९",
        "कम्पनी रजिस्टरको कार्यालय.: २७०१६९/०७८/०७९"
      ]
    );
  }

  const ensureFooterColumn = async (name, ddl) => {
    try {
      const [cols] = await pool.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'footer_data' AND COLUMN_NAME = ?",
        [name]
      );
      if (!cols.length) await pool.query(`ALTER TABLE footer_data ADD COLUMN ${name} ${ddl} NULL`);
    } catch (e) {}
  };
  await ensureFooterColumn("motto", "TEXT");
  await ensureFooterColumn("editor", "TEXT");
  await ensureFooterColumn("registration", "TEXT");
  await ensureFooterColumn("press_council", "TEXT");
  await ensureFooterColumn("company_reg", "TEXT");
  await ensureFooterColumn("mini_navbar_color", "VARCHAR(50)");
  await ensureFooterColumn("marquee_color", "VARCHAR(50)");
  await pool.query(
    "UPDATE footer_data SET motto=COALESCE(NULLIF(motto,''), 'निष्पक्ष र विश्वसनीय पत्रकारिता'), editor=COALESCE(NULLIF(editor,''), 'सम्पादक: कृष्णप्रसाद मरासिनी / ९८४१३७२४६०'), registration=COALESCE(NULLIF(registration,''), 'दर्ता प्रमाणपत्र नं.: ३१३१-२०७८/७९'), press_council=COALESCE(NULLIF(press_council,''), 'प्रेस काउन्सिल नं.: ३१४७-२०७८/७९'), company_reg=COALESCE(NULLIF(company_reg,''), 'कम्पनी रजिस्टरको कार्यालय.: २७०१६९/०७८/०७९') WHERE id=1"
  ).catch(() => {});

  const [adsCount] = await pool.query("SELECT COUNT(*) AS c FROM ads");
  if (adsCount[0].c === 0) {
    await pool.query("INSERT INTO ads(title,image,link,position,enabled) VALUES (?,?,?,?,?)", [
      "नागरिक प्रिमियम विज्ञापन",
      "",
      "#",
      "sidebar",
      1
    ]);
  }
}

module.exports = { pool, initDB };