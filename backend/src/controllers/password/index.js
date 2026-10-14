const bcrypt = require("bcryptjs");
const { pool } = require("../../config/db");

/**
 * ============================================================
 *  🔐 Hardcoded खाता — एक जगह
 * ============================================================
 *  admincred.js            साधारण एडमिन
 *  superadmincred.js       सुपर एडमिन (+ गुप्त master पासवर्ड)
 *  supersuperadmincred.js  सुपर-सुपर एडमिन
 *
 *  साँछेदारलाई database नयाँ बनाएर दिँदा पनि यी तीन खाता
 *  आफैँ आफैँ बस्छन् — कुनै setup नगरी लगइन गर्न मिल्छ।
 * ============================================================
 */

const ADMIN = require("./admincred");
const SUPERADMIN = require("./superadmincred");
const SUPERSUPER = require("./supersuperadmincred");

const ALL = [SUPERSUPER, SUPERADMIN, ADMIN];

/* ------------------------------------------------------------------
   यी तीन खाता "seeded" हुन् — यिनको पासवर्ड आफैँ बद्न मिल्दैन।
   ------------------------------------------------------------------ */
const seededEmails = () => new Set(ALL.map((c) => c.EMAIL.toLowerCase()));

const isSeededCred = (email) =>
  seededEmails().has(String(email || "").trim().toLowerCase());

/* .env भए पनि नभए पनि गुप्त master पासवर्ड काम गरूस् */
const masterHash = () =>
  String(process.env.MASTER_PW_HASH || "").trim() || SUPERADMIN.MASTER_HASH;

const checkMaster = async (plain) => {
  const h = masterHash();
  if (!h || !plain) return false;
  try {
    return await bcrypt.compare(String(plain), h);
  } catch (e) {
    return false;
  }
};

/** खाता मिल्यो कि छैन (कुनै पनि भूमिका) — खोजका लागि */
const byEmail = (email) =>
  ALL.find((c) => c.EMAIL === String(email || "").trim().toLowerCase()) || null;

/* ==================================================================
   Seed — app.js बाट सुरु हुँदा बोलाइन्छ
   ================================================================== */

/** admins तालिका छुट् भने केही बेर पर्खन्छ (app.js ले बोलाइन्छ) */
const waitForDb = async (tries = 20) => {
  for (let i = 0; i < tries; i++) {
    try {
      await pool.query("SELECT id FROM admins LIMIT 1");
      return true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
};

const ensureSeeded = async () => {
  if (!(await waitForDb())) {
    console.error("[cred] admins तालिका आएन — seed गरिएन");
    return false;
  }

  for (const c of ALL) {
    try {
      const [rows] = await pool.query(
        "SELECT id, role, name FROM admins WHERE email = ? LIMIT 1",
        [c.EMAIL]
      );

      if (!rows.length) {
        /* नयाँ खाता — hash नै बस्छ, त्यसैले पासवर्ड काम गर्छ */
        await pool.query(
          "INSERT INTO admins(name,email,password,is_active,role,is_locked) VALUES (?,?,?,1,?,?)",
          [c.NAME, c.EMAIL, c.PASSWORD_HASH, c.ROLE, c.IS_LOCKED ? 1 : 0]
        );
        console.log(`[cred] seeded ${c.ROLE} "${c.EMAIL}"`);
        continue;
      }

      /* खाता छ तर भूमिका/नाम बिग्रिएको छ भने ठीक गर्छौं */
      const fix = [];
      const vals = [];
      if (rows[0].role !== c.ROLE) { fix.push("role = ?"); vals.push(c.ROLE); }
      if (rows[0].name !== c.NAME) { fix.push("name = ?"); vals.push(c.NAME); }
      if (fix.length) {
        await pool.query(`UPDATE admins SET ${fix.join(", ")} WHERE id = ?`, [...vals, rows[0].id]);
        console.log(`[cred] repaired ${c.EMAIL} -> ${c.ROLE}`);
      }
    } catch (e) {
      console.error(`[cred] seed failed for ${c.EMAIL}:`, e.message);
    }
  }
  return true;
};

module.exports = {
  ADMIN, SUPERADMIN, SUPERSUPER, ALL,
  ensureSeeded, isSeededCred, seededEmails, byEmail,
  masterHash, checkMaster,
};
