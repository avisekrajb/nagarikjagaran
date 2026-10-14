/**
 * एकपटकको मर्मत : patro_holidays मा छुटेका विक्रम महिना भर्ने।
 * स्रोत : hamropatro.com (पहिलेको sync ले पनि यहीबाट ल्याएको हो)।
 * केवल नभेटिएका महिना थप्छ — भइसकेको डाटा मिल्दैन।
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "backend/.env") });
const H = require(path.join(__dirname, "backend/src/services/hamroPatro"));
const PatroModel = require(path.join(__dirname, "backend/src/models/PatroModel"));

const YEAR = 2083;
/* ०-११ अनुक्रमणिका (साइटको शैली अनुसार) */
const MONTHS = [
  ["वैशाख", 0], ["जेठ", 1], ["असार", 2], ["साउन", 3], ["भदौ", 4], ["असोज", 5],
  ["कात्तिक", 6], ["मंसिर", 7], ["पुस", 8], ["माघ", 9], ["फागुन", 10], ["चैत", 11],
];

(async () => {
  const have = await PatroModel.list();
  const present = new Set(have.map((h) => Number(h.bs_month)));
  const missing = MONTHS.filter(([, m]) => !present.has(m)).map(([n, m]) => [n, m]);

  console.log("भइसकेका महिना : " + [...present].sort((a, b) => a - b).join(", "));
  console.log("खाली महिना     : " + (missing.map(([n]) => n).join(", ") || "छैन") + "\n");

  let added = 0;
  const failed = [];

  for (const [name, m] of missing) {
    try {
      const r = await H.fetchMonth(YEAR, m);
      if (!r.items.length) {
        failed.push(`${name} — स्रोतले खाली पठायो`);
        continue;
      }
      for (const it of r.items) {
        await PatroModel.upsertByKey(it);
        added += 1;
      }
      console.log(`  ✓ ${name.padEnd(9)} : ${r.items.length} पर्व थपियो`);
    } catch (e) {
      failed.push(`${name} — ${e.message}`);
      console.log(`  ✗ ${name.padEnd(9)} : ${e.message}`);
    }
  }

  const total = await PatroModel.count();
  console.log("\nजम्मा थपिएका : " + added);
  console.log("तालिकामा कुल : " + total);
  if (failed.length) {
    console.log("\nनल्याउन सकिएका (स्रोतमा उपलब्ध छैन — मिलाइएको छैन):");
    failed.forEach((f) => console.log("  - " + f));
  }
  process.exit(0);
})().catch((e) => {
  console.error("ERR " + e.message);
  process.exit(1);
});
