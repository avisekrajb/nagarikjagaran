/**
 * पहिचान (नाम/इमेल/कपीराइट) कहाँ-कहाँ छ — एकपटक खोज्ने स्क्रिप्ट।
 *
 *   node find-identity.js
 *
 * सबै हिस्सा (git config, .env, DB, कोड) हेरेर एकै ठाउँमा देखाउँछ।
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const SKIP = /node_modules|[\\/]build[\\/]|[\\/]dist[\\/]|\.git[\\/]/;
const NEEDLES = ["abhishek", "rajbanshi", "zeroinfinity"];

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.test(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

console.log("=".repeat(66));
console.log("  पहिचान खोजी — नाम / इमेल / कपीराइट");
console.log("=".repeat(66));

/* ---------- 1. कोडभित्र ---------- */
console.log("\n[1] कोडभित्र (frontend + backend)\n");
const files = walk(ROOT).filter((f) => /\.(js|jsx|css|json|html|md|env)$/.test(f));
let codeHits = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  src.split(/\r?\n/).forEach((line, i) => {
    if (NEEDLES.some((n) => line.toLowerCase().includes(n))) {
      codeHits++;
      console.log(`  ${path.relative(ROOT, f)}:${i + 1}`);
      console.log(`      ${line.trim()}`);
    }
  });
}
if (!codeHits) console.log("  (कुनै छैन)");

/* ---------- 2. git ---------- */
console.log("\n[2] git पहिचान\n");
try {
  const name = execSync("git config --get user.name", { cwd: ROOT }).toString().trim();
  const email = execSync("git config --get user.email", { cwd: ROOT }).toString().trim();
  console.log(`  user.name  = ${name}`);
  console.log(`  user.email = ${email}`);
} catch (e) {
  console.log("  (git config छैन)");
}

/* ---------- 3. .env ---------- */
console.log("\n[3] backend/.env\n");
const envPath = path.join(ROOT, "backend", ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => /EMAIL|PASSWORD|SECRET|TOKEN/i.test(l) && l.includes("="))
    .forEach((l) => {
      const k = l.split("=")[0];
      console.log(`  ${k} = ${k.includes("PASSWORD") || k.includes("SECRET") || k.includes("TOKEN") ? "••••••" : l.split("=").slice(1).join("=")}`);
    });
} else {
  console.log("  (backend/.env छैन)");
}

/* ---------- 4. DB ---------- */
console.log("\n[4] डाटाबेस\n");
try {
  require("dotenv").config({ path: path.join(ROOT, "backend", ".env") });
  const mysql = require(path.join(ROOT, "backend", "node_modules", "mysql2", "promise"));
  (async () => {
    const c = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    const [t] = await c.query("SELECT name, email FROM team");
    console.log("  team.name / email :");
    t.forEach((r) => console.log(`      ${r.name}  <${r.email || "—"}>`));
    const [a] = await c.query("SELECT DISTINCT author FROM news");
    console.log("  news.author :");
    a.forEach((r) => console.log(`      ${r.author}`));
    await c.end();
  })().catch((e) => console.log("  (DB छुँदैन: " + e.message + ")"));
} catch (e) {
  console.log("  (DB जोड्न सकिएन)");
}

console.log("\n" + "=".repeat(66));
console.log("  कोडभित्रको सबै नाम/कपीराइट यहाँ छ :");
console.log("  frontend/src/config/siteIdentity.js");
console.log("=".repeat(66) + "\n");
