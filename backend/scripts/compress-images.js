/**
 * सबै छवि थिच्ने (image compressor)
 *
 * दुई काम गर्छ :
 *  1) मुख्य फाइल — 1280px सम्म, JPEG q72 + mozjpeg (गुणस्तर फरक पर्दैन)
 *  2) @400 / @800 / @1280 thumb — कार्डले srcset बाट आफैँ सानो छनी लिन्छ
 *
 * चलाउने :  node scripts/compress-images.js
 * गुणस्तर जाँच  :  --check   (केवल आकार रिपोर्ट, केही बदल्दैन)
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");

let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error("sharp छैन — पहिले:  npm install sharp");
  process.exit(1);
}

const UPLOADS = path.resolve(__dirname, "..", "uploads");
const WIDTHS = [400, 800, 1280];
const MAX_MAIN = 1280;
const QUALITY = 72;
const CHECK_ONLY = process.argv.includes("--check");
/* "ads" सकिएन (विज्ञापन साइज चाहिन्छ), "reel" पनि छोडिन्छ —
   किनभने त्यहाँ poster हुन्छ, thumb चाहिँदैन (पूरा एउटै सानो हुन्छ)। */
const SKIP_DIRS = new Set(["ads", "reel"]);

const thumbPath = (f, w) => f.replace(/(\.[a-z0-9]+)$/i, `@${w}.jpg`);
const sizeOf = (f) => {
  try { return fs.statSync(f).size; } catch (e) { return 0; }
};

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(p, out);
    } else if (/\.(jpe?g|png|webp)$/i.test(e.name) && !/@\d+\.jpg$/i.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

(async () => {
  const files = walk(UPLOADS);
  console.log(`छवि फाइल: ${files.length}   ${CHECK_ONLY ? "(check मात्र — केही बदलिँदैन)" : "(थिच्दै)"}\n`);

  let mainBefore = 0, mainAfter = 0, thumbBytes = 0, thumbNew = 0, reencoded = 0;
  const rows = [];

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    const before = sizeOf(f);
    mainBefore += before;

    // thumbs छैनन्
    const missing = WIDTHS.filter((w) => !fs.existsSync(thumbPath(f, w)));

    let meta = null;
    try {
      const buf = fs.readFileSync(f);
      meta = await sharp(buf).metadata();

      if (!CHECK_ONLY) {
        for (const w of missing) {
          const out = thumbPath(f, w);
          const t = await sharp(buf)
            .rotate()
            .resize({ width: w, withoutEnlargement: true })
            .jpeg({ quality: QUALITY, mozjpeg: true })
            .toBuffer();
          fs.writeFileSync(out, t);
          thumbBytes += t.length;
          thumbNew++;
        }

        // मुख्य फाइल धेरै ठूलो भए मात्र थिच्ने (idempotent)
        if ((meta.width || 0) > MAX_MAIN || before > 400 * 1024) {
          const pipe = sharp(buf).rotate().resize({ width: MAX_MAIN, withoutEnlargement: true });
          const out =
            ext === ".png"
              ? await pipe.png({ quality: 80, compressionLevel: 9 }).toBuffer()
              : await pipe.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
          if (out.length < before) {
            fs.writeFileSync(f, out);
            mainAfter += out.length;
            reencoded++;
          } else {
            mainAfter += before;
          }
        } else {
          mainAfter += before;
        }
      } else {
        mainAfter += before;
        for (const w of missing) {
          const t = await sharp(buf)
            .rotate()
            .resize({ width: w, withoutEnlargement: true })
            .jpeg({ quality: QUALITY, mozjpeg: true })
            .toBuffer();
          thumbBytes += t.length;
        }
      }
    } catch (e) {
      mainAfter += before;
      console.log(`  ERR ${path.relative(UPLOADS, f)} — ${e.message}`);
      continue;
    }

    rows.push({
      file: path.relative(UPLOADS, f),
      px: `${meta.width}x${meta.height}`,
      before: Math.round(before / 1024),
      thumbs: missing.length ? "नयाँ" : "छ",
      at400: Math.round(sizeOf(thumbPath(f, 400)) / 1024)
    });
  }

  console.table(rows.slice(0, 18));
  if (rows.length > 18) console.log(`… र ${rows.length - 18} अन्य`);

  console.log(`\nमुख्य फाइल पहिले : ${(mainBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`मुख्य फाइल पछि   : ${(mainAfter / 1024 / 1024).toFixed(2)} MB`);
  if (mainBefore) {
    console.log(`बचत              : ${(((mainBefore - mainAfter) / mainBefore) * 100).toFixed(0)}%`);
  }
  console.log(`नयाँ thumbs       : ${thumbNew} (${(thumbBytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`पुनः-थिचिएका     : ${reencoded}`);
})().catch((e) => { console.error(e); process.exit(1); });