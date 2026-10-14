const fs = require("fs");
const path = require("path");

const SRC = path.resolve(__dirname, "../frontend/src");

const walk = (d, o = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p, o) : /\.jsx?$/.test(e.name) && o.push(p);
  }
  return o;
};

const HOOKS = ["useState", "useEffect", "useMemo", "useRef", "useCallback", "useReducer", "useContext"];

let bad = 0;
for (const f of walk(SRC)) {
  const src = fs.readFileSync(f, "utf8");

  // सबै react import हटाएर बाँकी सोर्स
  const withoutImports = src.replace(/^import[\s\S]*?from\s*["'][^"']*["'];?$/gm, "");

  // React.useX( लेाई हटाउने — त्यो default import बाट चल्छ
  const bare = withoutImports.replace(/\bReact\s*\.\s*(useState|useEffect|useMemo|useRef|useCallback|useReducer|useContext)\b/g, "");

  const used = HOOKS.filter((h) => new RegExp(`(?<![.\\w$])${h}\\s*\\(`).test(bare));
  if (!used.length) continue;

  // named import छ कि छैन
  const named = used.some((h) =>
    new RegExp("import\\s*\\{[^}]*\\b" + h + "\\b").test(src)
  );

  if (!named) {
    bad++;
    const rel = path.relative(SRC, f);
    const reactImp = (src.match(/^import React.*$/m) || ["(कोइ react import छैन)"])[0];
    console.log(`BROKEN  ${rel}`);
    console.log(`          uses: ${used.join(", ")}`);
    console.log(`          ${reactImp.trim()}`);
  }
}

console.log(bad === 0 ? "\nसबै hook import ठीक छ — OK" : `\n${bad} file मा hook import छैन`);