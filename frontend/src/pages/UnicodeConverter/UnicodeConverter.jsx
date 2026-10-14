import React, { useMemo, useState } from "react";
import { adToBs, bsToAd, BS_MONTHS, BS_MONTHS_EN, BS_YEAR_MIN, BS_YEAR_MAX, toIsoDate } from "../../utils/formatDate";
import { CURRENCIES, byCode, convert, searchCurrencies } from "../../utils/currencies";
import { devToRoman, romanToDev } from "../../utils/romanize";

const DEV = "०१२३४५६७८९";
const LAT = "0123456789";
const dev = (n) => String(n).replace(/[0-9]/g, (d) => DEV[+d]);

/* ===================================================================
   आधार शैली
   =================================================================== */
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-current focus:bg-white focus:ring-4";

const Tool = ({ tone, title, desc, children }) => (
  <section className={`tool tool-${tone} overflow-hidden rounded-3xl bg-blue-50 shadow-soft ring-1 ring-blue-100`}>
    <header className={`tool-head tone-${tone} bg-blue-600 px-5 py-5 transition-colors duration-300 sm:px-6`}>
      <h2 className="text-lg font-black tracking-tight text-white transition-colors duration-300 sm:text-xl">
        {title}
      </h2>
      {desc && <p className="mt-1 text-sm font-semibold text-white/80">{desc}</p>}
    </header>
    <div className="p-4 transition-colors duration-300 sm:p-5">{children}</div>
  </section>
);

const Label = ({ children, tone = "slate" }) => (
  <span className={`mb-2 block text-[11px] font-black uppercase tracking-[.12em] text-${tone}-500`}>
    {children}
  </span>
);

/* ===================================================================
   १. पाठ रूपान्तरण (पूरा पाठ — अंक मात्र होइन)
   =================================================================== */
function UnicodeTool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("np2en");

  /* पहिले ०-९ अंक बदल्थ्यो; अब पूरा पाठ वर्ण रूपान्तरण हुन्छ,
     अंक भित्र पनि समेटिन्छ। */
  const out = useMemo(
    () => (mode === "np2en" ? devToRoman(text) : romanToDev(text)),
    [text, mode]
  );
  const chars = (out.match(/[^\s]/g) || []).length;
  const digits = (out.match(/[०-९0-9]/g) || []).length;

  const copy = async () => {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
    } catch (e) {}
  };

  return (
    <Tool
      tone="blue"
      title="पाठ रूपान्तरण"
      desc="नेपाली पाठ ⇄ अंग्रेजी — स्वर, व्यंजन, संयुक्ताक्षर र अंक सबै"
    >
      <div className="flex flex-wrap items-center gap-2">
        {[
          ["np2en", "नेपाली → अंग्रेजी"],
          ["en2np", "अंग्रेजी → नेपाली"]
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            className={`seg-btn ${mode === k ? "is-on tone-blue" : ""}`}
          >
            {l}
          </button>
        ))}
        <button
          onClick={() => { setText(out); setMode(mode === "np2en" ? "en2np" : "np2en"); }}
          disabled={!out}
          className="seg-btn"
        >
          उल्टो
        </button>
        <button onClick={copy} disabled={!out} className="seg-btn">
          प्रतिलिपि
        </button>
        {text && (
          <button onClick={() => setText("")} className="seg-btn ml-auto">
            खाली गर्नुहोस्
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="io-card">
          <Label tone={mode === "np2en" ? "blue" : "violet"}>
            {mode === "np2en" ? "नेपाली पाठ" : "अंग्रेजी पाठ"}
          </Label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder={
              mode === "np2en"
                ? "काठमाडौँमा आज मौसम — ०५०६७८९०"
                : "kathmandu ma aaj mausam"
            }
            className={`${inputCls} resize-none text-lg leading-relaxed tone-blue-focus`}
          />
        </div>

        <div className="io-card is-out">
          <Label tone="emerald">नतिजा</Label>
          <div className="min-h-[170px] rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
            <p className="break-words text-xl font-black leading-relaxed text-emerald-900 sm:text-2xl">
              {out || <span className="text-base font-bold text-emerald-500/70">यहाँ नतिजा देखिनेछ</span>}
            </p>
          </div>
          <p className="mt-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
            {chars > 0
              ? `${dev(chars)} अक्षर${digits ? ` (मध्ये ${dev(digits)} अंक)` : ""}`
              : "केही लेख्नुहोस्"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[11px] font-bold leading-5 text-slate-400">
        नोट : नेपाली → अंग्रेजी पूर्ण सटीक छ। अंग्रेजी → नेपाली ध्वन्यात्मक अनुमान हो —
        रोमन लेखमा छुटेका स्वर (जस्तै “nepal” मा अन्तिम “a”) फर्काउन सकिँदैन।
      </p>

      <p className="mb-2 mt-5 text-[11px] font-black uppercase tracking-[.12em] text-slate-400">
        अंक थिचेर थप्नुहोस्
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {LAT.split("").map((d, i) => (
          <button
            key={d}
            onClick={() => setText((v) => v + d)}
            className="num-btn"
          >
            <span className="block text-base font-black text-slate-800 group-hover:text-white">{d}</span>
            <span className="block text-xs font-bold text-slate-400 group-hover:text-white/80">{DEV[i]}</span>
          </button>
        ))}
      </div>
    </Tool>
  );
}

/* ===================================================================
   २. मिति
   =================================================================== */
function DateTool() {
  const today = useMemo(() => new Date(), []);
  const bsNow = useMemo(() => adToBs(today) || { year: 2082, month: 0, day: 1 }, [today]);

  const [ad, setAd] = useState(() => toIsoDate(today));
  const [bs, setBs] = useState({ y: bsNow.year, m: bsNow.month + 1, d: bsNow.day });

  const adFromBs = bsToAd(bs.y, bs.m - 1, bs.d);
  const adIso = adFromBs ? toIsoDate(adFromBs) : "";

  const bsFromAd = useMemo(() => {
    if (!ad) return null;
    const d = new Date(ad.replace(/-/g, "/"));
    if (isNaN(d.getTime())) return null;
    return adToBs(d);
  }, [ad]);

  const swap = () => {
    if (!bsFromAd || !adIso) return;
    setAd(adIso);
    setBs({ y: bsFromAd.year, m: bsFromAd.month + 1, d: bsFromAd.day });
  };

  const years = Array.from({ length: BS_YEAR_MAX - BS_YEAR_MIN + 1 }, (_, i) => BS_YEAR_MAX - i);

  return (
    <Tool
      tone="emerald"
      title="मिति रूपान्तरण"
      desc="ई.सं. ⇄ विक्रम सम्वत् — आजको मितिबाट सुरु"
    >
      <div className="mb-5 flex flex-wrap justify-end gap-2">
        <button onClick={swap} disabled={!bsFromAd || !adIso} className="seg-btn">उल्टो</button>
        <button
          onClick={() => { setAd(toIsoDate(today)); setBs({ y: bsNow.year, m: bsNow.month + 1, d: bsNow.day }); }}
          className="seg-btn is-on tone-emerald"
        >
          आजको मिति
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* AD */}
        <div className="conv-panel tone-emerald-panel">
          <Label tone="emerald">ई.सं. — ग्रेगोरियन</Label>
          <input
            type="date"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className={`${inputCls} tone-emerald-focus`}
          />
          <div className="mt-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
            <Label>विक्रम सम्वत्</Label>
            <p className="text-2xl font-black text-emerald-700">
              {bsFromAd
                ? `${dev(bsFromAd.day)} ${BS_MONTHS[bsFromAd.month]} ${dev(bsFromAd.year)}`
                : <span className="text-base font-bold text-slate-400">मिति छान्नुहोस्</span>}
            </p>
          </div>
        </div>

        {/* BS */}
        <div className="conv-panel tone-emerald-panel">
          <Label tone="emerald">विक्रम सम्वत्</Label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={bs.m}
              onChange={(e) => setBs({ ...bs, m: Number(e.target.value) })}
              className={`${inputCls} tone-emerald-focus px-2`}
            >
              {BS_MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={bs.d}
              onChange={(e) => setBs({ ...bs, d: Number(e.target.value) })}
              className={`${inputCls} tone-emerald-focus px-2`}
            >
              {Array.from({ length: 40 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{dev(d)}</option>
              ))}
            </select>
            <select
              value={bs.y}
              onChange={(e) => setBs({ ...bs, y: Number(e.target.value) })}
              className={`${inputCls} tone-emerald-focus px-2`}
            >
              {years.map((y) => <option key={y} value={y}>{dev(y)}</option>)}
            </select>
          </div>
          <div className="mt-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
            <Label>ई.सं.</Label>
            {adIso ? (
              <>
                <p className="text-2xl font-black text-emerald-700">
                  {dev(adIso.split("-").reverse().join("/"))}
                </p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {BS_MONTHS_EN[bs.m - 1]} {bs.d}, {bs.y}
                </p>
              </>
            ) : (
              <p className="text-base font-black text-rose-600">यो मिति मान्य छैन</p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] font-bold text-slate-400">
        समर्थित विक्रम वर्ष — {dev(BS_YEAR_MIN)} देखि {dev(BS_YEAR_MAX)} सम्म
      </p>
    </Tool>
  );
}

/* ===================================================================
   ३. मुद्रा
   =================================================================== */
function CurrencyTool() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("NPR");
  const [to, setTo] = useState("USD");
  const [rate, setRate] = useState(null);
  const [q, setQ] = useState("");

  const list = useMemo(() => searchCurrencies(q), [q]);
  const f = byCode(from);
  const t = byCode(to);
  const effectiveFrom = rate || f.perUsd;

  const result = useMemo(() => {
    const n = Number(amount);
    if (!Number.isFinite(n) || !effectiveFrom) return "";
    return (n / effectiveFrom * t.perUsd).toLocaleString("en-US", { maximumFractionDigits: 4 });
  }, [amount, effectiveFrom, t.perUsd]);

  const implied = f.perUsd / t.perUsd;

  const swapCodes = () => {
    setFrom(to);
    setTo(from);
    setRate(null);
    const back = Number(String(result).replace(/,/g, ""));
    if (Number.isFinite(back) && back > 0) setAmount(String(Number(back.toFixed(4))));
  };

  const pick = (label, value, setValue, inputId) => (
    <div>
      <Label tone="violet">{label}</Label>
      <input
        id={inputId}
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase().slice(0, 3))}
        className={`${inputCls} tone-violet-focus font-black uppercase`}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {list.map((c) => (
          <button
            key={c.code}
            onClick={() => { setValue(c.code); setRate(null); }}
            className={`code-chip ${value === c.code ? "is-on" : ""}`}
            title={`${c.name} · ${c.nameEn}`}
          >
            {c.code}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Tool
      tone="violet"
      title="मुद्रा रूपान्तरण"
      desc="रकम बदल्नुहोस् — नेपाली रुपैयाँ पहिलो"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="मुद्रा खोज्नुहोस् — नेपाली, अंग्रेजी वा कोड"
        className={`${inputCls} tone-violet-focus mb-5`}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-4">
          <div>
            <Label tone="violet">रकम</Label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputCls} tone-violet-focus text-lg`}
            />
          </div>
          {pick("बाट", from, setFrom, "cur-from")}
        </div>

        <button
          onClick={swapCodes}
          title="उल्टो"
          className="swap-btn lg:mt-[86px]"
        >
          उल्टो
        </button>

        <div className="space-y-4">
          <div>
            <Label tone="violet">नतिजा</Label>
            <div className="rounded-xl bg-violet-50 px-4 py-3 ring-1 ring-violet-200">
              <p className="break-all text-3xl font-black leading-tight text-violet-900">{result || "—"}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-violet-600">
                {t.code} · {t.name}
              </p>
            </div>
          </div>
          {pick("मा", to, setTo, "cur-to")}
        </div>
      </div>

      {/* दर */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Label tone="violet">१ {from} = ? {to}</Label>
            <input
              type="number"
              step="any"
              value={rate ?? ""}
              onChange={(e) => setRate(e.target.value === "" ? null : Number(e.target.value))}
              placeholder={String(Number(implied.toFixed(6)))}
              className={`${inputCls} tone-violet-focus`}
            />
          </div>
          {rate !== null && (
            <button onClick={() => setRate(null)} className="seg-btn">सन्दर्भ दरमा फर्कनुहोस्</button>
          )}
        </div>
        <p className="mt-2.5 text-[11px] font-bold text-slate-500">
          १ USD ≈ {dev(f.perUsd)} {f.code} · १ USD ≈ {dev(t.perUsd)} {t.code}
          <span className={`ml-1.5 font-black ${rate !== null ? "text-violet-600" : "text-slate-400"}`}>
            {rate !== null ? "· आफ्नो दर लागू" : "· सन्दर्भ दर"}
          </span>
        </p>
      </div>

      {/* तालिका */}
      <p className="mb-2 mt-6 text-[11px] font-black uppercase tracking-[.12em] text-slate-400">
        २० मुद्रा — नेपाली रुपैयाँ पहिलो (थिचेर छान्नुहोस्)
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">कोड</th>
              <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">मुद्रा</th>
              <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-500">१ USD ≈</th>
              <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-500">१ NPR ≈</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr
                key={c.code}
                onClick={() => { setFrom("NPR"); setTo(c.code); setRate(null); }}
                className={`cur-row cursor-pointer ${to === c.code ? "is-on" : ""}`}
              >
                <td className="px-4 py-3 font-black text-slate-800">{c.code}</td>
                <td className="px-4 py-3 text-slate-600">
                  {c.name}
                  <span className="ml-2 hidden text-[11px] font-bold text-slate-400 sm:inline">{c.nameEn}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">{dev(c.perUsd)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                  {dev(Number((CURRENCIES[0].perUsd / c.perUsd).toFixed(2)))}
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan="4" className="px-4 py-10 text-center text-sm font-bold text-slate-400">
                  यो नाम वा कोडको मुद्रा भेटिएन
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Tool>
  );
}

/* ===================================================================
   पेज
   =================================================================== */
export default function UnicodeConverter() {
  return (
    <main className="conv-page">
      <div className="container-shell py-8">
        {/* दुईवटा ५०% फ्रेम */}
        <div className="grid gap-5 lg:grid-cols-2">
          <UnicodeTool />
          <DateTool />
        </div>

        {/* एउटा १००% फ्रेम */}
        <div className="mt-5">
          <CurrencyTool />
        </div>

        <p className="mt-6 rounded-xl bg-blue-50 px-4 py-3 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
          मुद्रा दरहरू सन्दर्भका लागि मात्र हुन् — कारोबार गर्नुअघि आजको वास्तविक दर जाँच्नुहोस्।
        </p>
      </div>
    </main>
  );
}
