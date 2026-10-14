/**
 * फोटो अनुकूलन : JPEG/PNG  ->  WebP  (+ सही आकारका थम्बनेल)
 *
 * चलाउन :  node scripts/optimize-images.cjs
 * पहिले हेर्न (आफै नबदल्ने) :  node scripts/optimize-images.cjs --dry
 *
 * अहिले सबै फोटो .jpg छन् (44 MB, WebP एकैपनि पनि छैन)।
 * WebP सामान्यतया ३०–५०% सानो हुन्छ, र browsers ले support गर्छन्।
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "..", "backend");
const UPLOADS = path.join(ROOT, "uploads");
const DRY = process.argv.includes("--dry");

/* थम्बनेल चौडाइ (px) */
const WIDTHS = [400, 800, 1280];

const IMAGES = /\.(jpe?g|png)$/i;

const kb = (n) => (n / 1024).toFixed(0) + " KB";

(async () => {
  if (!fs.existsSync(UPLOADS)) {
    console.log("uploads फोल्डर छैन:", UPLOADS);
    return;
  }

  /* सबै फोटो खोज्ने (@w थम्बनेल बाहेक) */
  const walk = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, out);
      else if (IMAGES.test(e.name) && !/@\d+\./.test(e.name)) out.push(p);
    }
    return out;
  };

  const files = walk(UPLOADS);
  if (!files.length) {
    console.log("प्रशोध गर्ने फोटो भेटिएन।");
    return;
  }

  console.log(`\n${files.length} वटा फोटो छन्। ${DRY ? "(DRY — केही बदलिँदैन)" : "WebP मा रूपान्तरण हुँदैछ..."}\n`);

  let before = 0;
  let after = 0;
  let failed = 0;
  let skippedSmall = 0;

  for (const f of files) {
    const origSize = fs.statSync(f).size;
    before += origSize;

    /* सानो फोटो (<? 40 KB) — बद्ल्नको फाइदा छैन */
    if (origSize < 40 * 1024) {
      after += origSize;
      skippedSmall++;
      continue;
    }

    try {
      const img = sharp(f);
      const meta = await img.metadata();

      /* --- थम्बनेल (यदि छैनन् वा ठूलो भए) --- */
      for (const w of WIDTHS) {
        if (meta.width && meta.width <= w) continue;
        const tp = f.replace(IMAGES, `@${w}.jpg`);
        if (!DRY) {
          await sharp(f).rotate().resize(w, null, { withoutEnlargement: true })
            .jpeg({ quality: 78, progressive: true }).toFile(tp);
        }
      }

      /* --- WebP --- */
      const wp = f.replace(IMAGES, ".webp");
      const buf = await sharp(f).rotate().webp({ quality: 78 }).toBuffer();

      if (!DRY) {
        /* .webp ठूलो भए मूल नै राख्ने */
        if (buf.length < origSize) fs.writeFileSync(wp, buf);
        after += Math.min(buf.length, origSize);
      } else {
        after += Math.min(buf.length, origSize);
      }
    } catch (e) {
      failed++;
      after += origSize;
      console.log(`  ✗ ${path.basename(f)} — ${e.message}`);
    }
  }

  const saved = before - after;
  const pct = before ? ((saved / before) * 100).toFixed(1) : "0";
  console.log(`\nमूल      : ${kb(before)}`);
  console.log(`पछि     : ${kb(after)}`);
  console.log(`बचत     : ${kb(saved)}  (${pct}%)`);
  console.log(`सानो छुटे: ${skippedSmall}   असफल: ${failed}\n`);
  if (DRY) console.log("DRY चलाइयो — कुनै फाइल बदलिएन।\n");
})();
