import React, { useEffect, useMemo, useState } from "react";
import {
  adToBs, bsToAd, BS_MONTHS, BS_YEAR_MIN, BS_YEAR_MAX, toIsoDate, nepaliDateTime
} from "../../../utils/formatDate";
import {
  CalendarRange, Plus, Pencil, Trash2, RefreshCw, Save,
  Power, CloudDownload, CheckCircle2, AlertCircle, Search
} from "lucide-react";
import { adminApi } from "../../../services/adminApi";
import { Btn, Modal, Input, TextArea, Th, Td } from "./AdminUI";

const dev = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[+d]);
const nf = (n) => Number(n || 0).toLocaleString("ne-NP");

/** 'YYYY-MM-DD' — विक्रम मितिबाट */
const adOf = (h) => {
  if (!h || h.bs_year === undefined || h.bs_month === undefined || !h.bs_day) return "";
  const d = bsToAd(Number(h.bs_year), Number(h.bs_month), Number(h.bs_day));
  return d ? toIsoDate(d) : "";
};
const bsSort = (h) =>
  Number(h.bs_year || 0) * 100000 + (Number(h.bs_month || -1) + 1) * 1000 + Number(h.bs_day || 0);
const when = (ts) => {
  if (!ts) return "कहिल्यै";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? "—" : nepaliDateTime(d);
};

/* ---------------- सेटिङ : आइतबार / शनिबार ---------------- */
function Settings({ setMsg }) {
  const [row, setRow] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setRow(await adminApi.patroSettings()); }
    catch (e) { setMsg("सेटिङ लोड हुन सकेन: " + e.message); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggle = async (key) => {
    const next = { ...row, [key]: !row[key] };
    setRow(next);
    setBusy(true);
    try {
      const saved = await adminApi.updatePatroSettings({ [key]: next[key] });
      setRow(saved);
      setMsg("पात्रो सेटिङ बदलियो");
    } catch (e) {
      setMsg(e.message || "बदल्न सकिएन");
      load();
    } finally { setBusy(false); }
  };

  if (!row) return <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { key: "sunday_holiday", label: "आइतबार बिदा", hint: "सक्रिय भए पात्रोमा सबै महिनाको आइतबार रातो देखिन्छ" },
        { key: "saturday_holiday", label: "शनिबार बिदा", hint: "नेपालमा शनिबार साप्ताहिक बिदा हो — सक्रिय रहन्छ" }
      ].map((o) => (
        <label
          key={o.key}
          className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border px-4 py-3.5 transition ${
            row[o.key] ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <span className="min-w-0">
            <b className="flex items-center gap-1.5 text-sm font-black text-slate-800">
              {row[o.key] ? <CheckCircle2 size={15} className="text-emerald-600" /> : <AlertCircle size={15} className="text-slate-400" />}
              {o.label}
            </b>
            <small className="mt-1 block text-[11px] font-bold leading-snug text-slate-500">{o.hint}</small>
          </span>
          <input
            type="checkbox"
            checked={!!row[o.key]}
            disabled={busy}
            onChange={() => toggle(o.key)}
            className="mt-1 h-5 w-5 flex-none"
          />
        </label>
      ))}
    </div>
  );
}

/* ---------------- बिदा मोडल ---------------- */
function HolidayModal({ edit, onClose, setMsg }) {
  const bsNow = adToBs(new Date()) || { year: 2082, month: 0, day: 1 };
  const [form, setForm] = useState({
    title: edit?.title || "",
    bs_year: edit?.bs_year ?? String(bsNow.year),
    bs_month: edit?.bs_month ?? String(bsNow.month),
    bs_day: edit?.bs_day ?? String(bsNow.day),
    description: edit?.description || "",
    is_enabled: edit ? (edit.is_enabled ? 1 : 0) : 1
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const years = useMemo(
    () => Array.from({ length: BS_YEAR_MAX - BS_YEAR_MIN + 1 }, (_, i) => BS_YEAR_MAX - i),
    []
  );
  const ad = bsToAd(Number(form.bs_year), Number(form.bs_month), Number(form.bs_day));
  const valid = !!ad;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.title.trim()) return setErr("बिदा/पर्वको नाम लेख्नुहोस्");
    if (!valid) return setErr("विक्रम मिति मान्य छैन");
    setBusy(true);
    try {
      if (edit) await adminApi.updatePatroHoliday(edit.id, form);
      else await adminApi.createPatroHoliday(form);
      setMsg(edit ? "बिदा अद्यावधिक भयो" : "नयाँ बिदा थपियो");
      onClose();
    } catch (ex) { setErr(ex.message || "बच्न सकिएन"); }
    finally { setBusy(false); }
  };

  const sel = "w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white";

  return (
    <Modal title={edit ? "बिदा सम्पादन" : "नयाँ बिदा / पर्व"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="बिदा / पर्वको नाम"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="जस्तै: दशैंको टीका"
        />

        <div>
          <span className="mb-1.5 block text-sm font-bold text-slate-600">विक्रम सम्वत् मिति</span>
          <div className="grid grid-cols-3 gap-2">
            <select value={form.bs_month} onChange={(e) => setForm({ ...form, bs_month: e.target.value })} className={sel}>
              {BS_MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={form.bs_day} onChange={(e) => setForm({ ...form, bs_day: e.target.value })} className={sel}>
              {Array.from({ length: 40 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{dev(d)}</option>
              ))}
            </select>
            <select value={form.bs_year} onChange={(e) => setForm({ ...form, bs_year: e.target.value })} className={sel}>
              {years.map((y) => <option key={y} value={y}>{dev(y)}</option>)}
            </select>
          </div>
          <p className={`mt-1.5 text-[11px] font-bold ${valid ? "text-slate-500" : "text-red-600"}`}>
            {valid ? `ई.सं. — ${dev(adOf({ bs_year: form.bs_year, bs_month: form.bs_month, bs_day: form.bs_day }))}` : "यो विक्रम मिति मान्य छैन"}
          </p>
        </div>

        <TextArea
          label="विवरण"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="जस्तै: नवरात्र आरम्भ"
        />

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span>
            <b className="block text-sm font-black text-slate-700">पात्रोमा देखाउने</b>
            <small className="text-xs font-bold text-slate-400">बन्द गरे पात्रोमा नदेखिने</small>
          </span>
          <input
            type="checkbox"
            checked={!!form.is_enabled}
            onChange={(e) => setForm({ ...form, is_enabled: e.target.checked ? 1 : 0 })}
            className="h-5 w-5"
          />
        </label>
        {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Btn kind="ghost" type="button" onClick={onClose}>रद्द</Btn>
          <Btn type="submit" disabled={busy}><Save size={15} /> {busy ? "बच्दै..." : "बचाउनुहोस्"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- मुख्य ---------------- */
export default function AdminPatro({ setMsg }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [only, setOnly] = useState("all");
  const [edit, setEdit] = useState(null);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setRows(await adminApi.patroHolidays()); }
    catch (e) { setMsg("बिदा सूची लोड हुन सकेन: " + e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggle = async (h) => {
    try {
      await adminApi.updatePatroHoliday(h.id, { is_enabled: h.is_enabled ? 0 : 1 });
      setMsg(`${h.title} ${h.is_enabled ? "बन्द" : "सक्रिय"} भयो`);
      load();
    } catch (e) { setMsg(e.message || "बदल्न सकिएन"); }
  };

  const remove = async (h) => {
    if (!window.confirm(`"${h.title}" मेट्ने हो?`)) return;
    try { await adminApi.deletePatroHoliday(h.id); setMsg("बिदा मेटियो"); load(); }
    catch (e) { setMsg(e.message || "मेट्न सकिएन"); }
  };

  const sync = async () => {
    setSyncing(true);
    // विक्रम मिति गणनाको प्राधिकृतिक तालिका frontend मै छ
    const bs = adToBs(new Date());
    if (!bs) { setSyncing(false); return setMsg("मिति गणना गर्न सकिएन"); }
    try {
      const r = await adminApi.syncPatro(bs.year, bs.month, 12);
      setMsg(
        `हाम्रो पात्रो sync पूरा — ${r.months} महिनामा ${r.found} बिदा भेटियो, ${r.created} नयाँ थपियो` +
        (r.errors && r.errors.length ? ` (${r.errors.length} महिना लोड भएन)` : "")
      );
      load();
    } catch (e) {
      setMsg(e.message || "हाम्रो पात्रोसँग जोडिन सकिएन");
    } finally { setSyncing(false); }
  };

  const filtered = rows
    .slice()
    .sort((a, b) => bsSort(a) - bsSort(b))
    .filter((h) => {
      if (only === "on" && !h.is_enabled) return false;
      if (only === "off" && h.is_enabled) return false;
      if (q && !String(h.title).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });

  const onCount = rows.filter((r) => r.is_enabled).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-800">
            <CalendarRange size={20} className="text-blue-600" /> पात्रो व्यवस्थापन
          </h2>
          <p className="mt-0.5 text-xs font-bold text-slate-500">
            बिदा/पर्व थप्नुहोस्, देखाउने–नदेखाउने नियन्त्रण गर्नुहोस्
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn kind="soft" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> रिफ्रेस
          </Btn>
          <Btn kind="ghost" onClick={sync} disabled={syncing}>
            <CloudDownload size={15} /> {syncing ? "ल्याउँदै..." : "हाम्रो पात्रो ल्याउनुहोस्"}
          </Btn>
          <Btn onClick={() => setCreating(true)}><Plus size={15} /> नयाँ बिदा</Btn>
        </div>
      </div>

      {/* सेटिङ */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-700">
          <Power size={15} className="text-blue-600" /> हप्ताका बिदा
        </h3>
        <Settings setMsg={setMsg} />
      </section>

      {/* सूची */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
            बिदा तथा पर्व
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] tabular-nums text-slate-500">
              {onCount}/{rows.length} सक्रिय
            </span>
          </h3>

          <div className="relative ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="खोज्नुहोस्..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white sm:w-48"
            />
          </div>

          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {[["all", "सबै"], ["on", "सक्रिय"], ["off", "बन्द"]].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setOnly(k)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-black transition ${
                  only === k ? "bg-white text-blue-700 shadow" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Th>#</Th><Th>नाम</Th><Th>मिति (विक्रम)</Th><Th>विवरण</Th>
                <Th>स्थिति</Th><Th>थपिएको</Th><Th className="text-right">कार्य</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} className="transition hover:bg-blue-50/40">
                  <Td className="text-xs font-black tabular-nums text-slate-300">{h.id}</Td>
                  <Td><b className="text-slate-800">{h.title}</b></Td>
                  <Td className="whitespace-nowrap">
                    <span className="font-bold text-slate-700">
                      {h.bs_month !== undefined && h.bs_month !== null && h.bs_month !== ""
                        ? `${dev(h.bs_day)} ${BS_MONTHS[Number(h.bs_month)]} ${dev(h.bs_year)}`
                        : "—"}
                    </span>
                    {adOf(h) && (
                      <small className="block text-[11px] font-bold text-slate-400">
                        ई.सं. {dev(adOf(h))}
                      </small>
                    )}
                  </Td>
                  <Td className="text-xs text-slate-500">{h.description || "—"}</Td>
                  <Td>
                    {h.is_enabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">
                        <CheckCircle2 size={11} /> देखिन्छ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">
                        <AlertCircle size={11} /> बन्द
                      </span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-[11px] text-slate-400">{when(h.created_at)}</Td>
                  <Td className="text-right">
                    <div className="inline-flex flex-wrap justify-end gap-1.5">
                      <button
                        title={h.is_enabled ? "पात्रोमा नदेखाउने" : "पात्रोमा देखाउने"}
                        onClick={() => toggle(h)}
                        className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                          h.is_enabled
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700"
                        }`}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        title="सम्पादन"
                        onClick={() => setEdit(h)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="मेट्ने"
                        onClick={() => remove(h)}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}

              {!loading && !filtered.length && (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <p className="text-sm font-bold text-slate-400">
                      {rows.length
                        ? "यो खोज/छनोटमा केही भेटिएन।"
                        : "अहिलेसम्म कुनै बिदा थपिएको छैन।"}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-300">
                      “हाम्रो पात्रो ल्याउनुहोस्” थिच्नुहोस् वा आफैं थप्नुहोस्
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {creating && <HolidayModal onClose={() => setCreating(false)} setMsg={setMsg} />}
      {edit && <HolidayModal edit={edit} onClose={() => setEdit(null)} setMsg={setMsg} />}
    </div>
  );
}
