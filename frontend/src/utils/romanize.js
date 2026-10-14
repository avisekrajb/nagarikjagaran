/* ===================================================================
   नेपाली (देवनागरी) ⇄ अंग्रेजी (रोमन) वर्ण रूपान्तरण
   - पुरानो रूपान्तरणले केवल अंक (०-९) बदल्थ्यो; यसले पूरा पाठ बदल्छ।
   - स्वर, व्यंजन, संयुक्ताक्षर (conjunct), अनुस्वार, नुक्ता अक्षर समेत।
   =================================================================== */

/* ---------- व्यंजन ---------- */
const CONSONANTS = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v",
  "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "ळ": "l", "क़": "q", "ख़": "kh", "ग़": "gh", "ज़": "z",
  "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y"
};

/* ---------- स्वर (स्वतन्त्र + मात्रा) ---------- */
const VOWELS = { "अ": "a", "आ": "aa", "इ": "i", "ई": "ii", "उ": "u", "ऊ": "uu", "ऋ": "ri", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au" };
const MATRAS = { "ा": "a", "ि": "i", "ी": "ii", "ु": "u", "ू": "uu", "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o" };

const VIRAMA = "्";
const ANUSVARA = "ं";
const CHANDRABINDU = "ँ";
const VISARGA = "ः";
const DIGITS = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };
const PUNCT = "।॥,.;:!?()[]{}<>\"'`/\\-–—%&@#$*+=|~^`\"'";

const isDev = (c) => Object.prototype.hasOwnProperty.call(CONSONANTS, c) || Object.prototype.hasOwnProperty.call(VOWELS, c);

/* ------------------------------------------------------------------
   देवनागरी → रोमन
   ------------------------------------------------------------------ */
export function devToRoman(input = "") {
  const s = String(input);
  let out = "";

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (Object.prototype.hasOwnProperty.call(DIGITS, c)) { out += DIGITS[c]; continue; }
    if (PUNCT.includes(c) || /\s/.test(c)) { out += c; continue; }

    if (Object.prototype.hasOwnProperty.call(CONSONANTS, c)) {
      let syl = CONSONANTS[c];
      let j = i + 1;

      // नुक्ता (क् + ़) — माथिको नक्सामै व्यंजन छ, तर 'छ'/'ठ' मा छैन
      const nukt = s[j];
      const pair = c + nukt;
      if (nukt === "़" && Object.prototype.hasOwnProperty.call(CONSONANTS, pair)) {
        syl = CONSONANTS[pair];
        j++;
      }

      // अनुस्वार / विसर्ग
      if (s[j] === ANUSVARA || s[j] === CHANDRABINDU) { syl += "n"; j++; }
      else if (s[j] === VISARGA) { syl += "h"; j++; }
      // मात्रा
      else if (Object.prototype.hasOwnProperty.call(MATRAS, s[j])) { syl += MATRAS[s[j]]; j++; }
      // हलन्त — अन्तिम व्यंजनमा स्वार लाग्दैन
      else if (s[j] === VIRAMA) { j++; }
      // अन्यथा स्वतः 'a'
      else syl += "a";

      out += syl;
      i = j - 1;
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(VOWELS, c)) { out += VOWELS[c]; continue; }
    if (c === VIRAMA) { continue; }
    if (c === ANUSVARA || c === CHANDRABINDU) { out += "n"; continue; }
    if (c === VISARGA) { out += "h"; continue; }
    if (c === "ँ") { out += "n"; continue; }
    if (c === "ॐ") { out += "om"; continue; }

    out += c;
  }
  return out;
}

/* ------------------------------------------------------------------
   रोमन → देवनागरी (शब्द-अक्षर अनुसार)
   नोट : यो ध्वनिक अनुमान हो — "नेपाल"↔"nepal" जस्ता शब्दमा रोमन लेखमा
   स्वतन्त्र "a" नपर्ने भएकाले पूर्ण उल्टो-सटीक सम्भव छैन। devToRoman भने
   ठीक छ। यहाँ नियम: अन्तिम व्यंजनलाई हलन्त (ा) दिइँदैन।
   ------------------------------------------------------------------ */
const R2D_CONS = {
  kh: "ख", ch: "च", chh: "छ", gh: "घ", jh: "झ", th: "थ", dh: "ध",
  ph: "फ", bh: "भ", sh: "श", ss: "ष", ny: "ञ", ng: "ङ", nh: "ञ", nh2: "ञ",
  k: "क", g: "ग", j: "ज", t: "ट", d: "ड", n: "न", p: "प",
  b: "ब", m: "म", y: "य", r: "र", l: "ल", v: "व", w: "व",
  s: "स", h: "ह", f: "फ़", q: "क़", z: "ज़", x: "क्ष"
};
const R2D_VOW = { a: "अ", aa: "आ", i: "इ", ii: "ई", u: "उ", uu: "ऊ", ri: "ऋ", e: "ए", ai: "ऐ", o: "ओ", au: "औ" };
const R2D_MATRA = { a: "ा", i: "ि", ii: "ी", u: "ु", uu: "ू", ri: "ृ", e: "े", ai: "ै", o: "ो", au: "ौ" };

const VOWEL_KEYS = ["aa", "ai", "au", "ii", "uu", "ri", "a", "e", "i", "o", "u"];
const CONS_KEYS = Object.keys(R2D_CONS).sort((a, b) => b.length - a.length);

export function romanToDev(input = "") {
  const s = String(input).toLowerCase();
  let out = "";
  let i = 0;
  const WORD_END = /[\s.,;:!?()[\]{}<>"'`/\\\-–—।॥]/;

  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c) || PUNCT.includes(c)) { out += c; i++; continue; }
    if (/[0-9]/.test(c)) { out += "०१२३४५६७८९"[+c]; i++; continue; }

    /* व्यंजन (लामो संयोजन अगाडि) */
    let cons = null;
    for (const k of CONS_KEYS) {
      if (s.startsWith(k, i)) { cons = k; break; }
    }

    if (cons) {
      let j = i + cons.length;
      // यस व्यंजनपछिको स्वर
      let matra = null;
      let consumed = cons.length;
      for (const v of VOWEL_KEYS) {
        if (s.startsWith(v, j)) { matra = R2D_MATRA[v]; consumed += v.length; break; }
      }

      if (matra) {
        out += R2D_CONS[cons] + matra;
        i += consumed;
        continue;
      }

      // स्वर छैन — अर्को व्यंजन/शब्द-अन्त्य हुने होइन भने संयुक्ताक्षर (हलन्त)
      const next = s[j];
      const nextIsCons = next && CONS_KEYS.some((k) => k[0] === next);
      if (nextIsCons) { out += R2D_CONS[cons] + "्"; i = j; continue; }
      // शब्दको अन्तमा — स्वतः 'a' हुँदैन
      if (!next || WORD_END.test(next)) { out += R2D_CONS[cons]; i = j; continue; }
      // अर्को कुनै अक्षर — अन्तिम व्यंजनजस्तै
      out += R2D_CONS[cons];
      i = j;
      continue;
    }

    /* स्वतन्त्र स्वर */
    let v = null;
    for (const k of VOWEL_KEYS) {
      if (s.startsWith(k, i)) { v = k; break; }
    }
    if (v) {
      const prev = i > 0 ? s[i - 1] : "";
      const isWordStart = i === 0 || WORD_END.test(prev);
      // व्यंजनपछि आएको स्वरलाई मात्रा बनाइसके छिलो — यहाँ आउँदैन
      if (isWordStart) out += R2D_VOW[v];
      else if (R2D_MATRA[v]) out += R2D_MATRA[v];
      i += v.length;
      continue;
    }

    out += c;
    i++;
  }
  return out;
}

export default { devToRoman, romanToDev };