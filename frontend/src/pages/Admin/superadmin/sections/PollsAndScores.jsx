import React, { useEffect, useState } from "react";
import { Panel, Btn, Field, inputCls, Alert, Loading, superApi } from "./ui";

/* =====================================================================
   ४. पोल — सुपर एडमिनले प्रश्न बनाउँछ, पाठक एकपटक मात्र मतदान गर्छ
   ===================================================================== */
const SectionPolls = () => {
  const [rows, setRows] = useState(null);
  const [question, setQuestion] = useState("");
  const [opts, setOpts] = useState(["", ""]);
  const [sidebar, setSidebar] = useState(true);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setRows(await superApi.listPolls()); } catch (e) { setMsg({ kind: "err", text: e.message }); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await superApi.createPoll({ question, options: opts, show_in_sidebar: sidebar });
      setQuestion("");
      setOpts(["", ""]);
      setMsg({ kind: "ok", text: "पोल बन्यो — अब सक्रिय छ।" });
      load();
    } catch (err) {
      setMsg({ kind: "err", text: err.message });
    } finally { setBusy(false); }
  };

  const act = async (fn, ok) => {
    setMsg(null);
    try { await fn(); setMsg({ kind: "ok", text: ok }); load(); }
    catch (e) { setMsg({ kind: "err", text: e.message }); }
  };

  if (!rows) return <Loading />;

  return (
    <div className="space-y-5">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      <Panel title="नयाँ पोल बनाउनुहोस्" desc="कम्तीमा २ विकल्प। एकजना पाठकले एकपटक मात्र मतदान गर्न पाउँछन्।">
        <form onSubmit={create} className="space-y-4">
          <Field label="प्रश्न">
            <input
              className={inputCls}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="जस्तै: अबको सबैभन्दा महत्त्वपूर्ण के हो?"
              required
            />
          </Field>

          <Field label="विकल्प">
            <div className="space-y-2">
              {opts.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={inputCls}
                    value={o}
                    onChange={(e) => setOpts((s) => s.map((x, ix) => (ix === i ? e.target.value : x)))}
                    placeholder={`विकल्प ${i + 1}`}
                  />
                  {opts.length > 2 && (
                    <Btn type="button" kind="outline" onClick={() => setOpts((s) => s.filter((_, ix) => ix !== i))}>
                      हटाउने
                    </Btn>
                  )}
                </div>
              ))}
              <Btn type="button" kind="soft" onClick={() => setOpts((s) => [...s, ""])}>
                + विकल्प थप्ने
              </Btn>
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input type="checkbox" checked={sidebar} onChange={(e) => setSidebar(e.target.checked)} />
            साइडबारमा देखाउने
          </label>

          <Btn type="submit" disabled={busy || opts.filter(Boolean).length < 2}>
            {busy ? "बन्द हुँदै…" : "पोल बनाउनुहोस्"}
          </Btn>
        </form>
      </Panel>

      <Panel title="पोलहरू" desc={`कुल ${rows.length} · सक्रिय ${rows.filter((r) => r.is_active).length}`}>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm font-bold text-slate-400">अझै कुनै पोल छैन।</p>
        ) : (
          <ul className="space-y-4">
            {rows.map((p) => (
              <li key={p.id} className="border border-slate-200 p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-slate-900">{p.question}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      कुल मत {p.total_votes} · {p.show_in_sidebar ? "साइडबारमा छ" : "साइडबारमा छैन"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Btn
                      kind={p.is_active ? "soft" : "brand"}
                      onClick={() => act(() => superApi.togglePoll(p.id, !p.is_active), p.is_active ? "पोल रोकियो।" : "पोल सक्रिय भयो।")}
                    >
                      {p.is_active ? "रोक्ने" : "सक्रिय"}
                    </Btn>
                    <Btn kind="danger" onClick={() => act(() => superApi.deletePoll(p.id), "पोल मेटियो।")}>
                      मेटाउने
                    </Btn>
                  </div>
                </div>

                <ul className="space-y-2">
                  {p.options.map((o) => (
                    <li key={o.id}>
                      <div className="mb-1 flex justify-between text-xs font-bold text-slate-600">
                        <span>{o.label}</span>
                        <span>{o.votes} मत · {o.percent}%</span>
                      </div>
                      <div className="h-2 bg-slate-100">
                        <div className="h-2 bg-brand-600 transition-all" style={{ width: `${o.percent}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

/* =====================================================================
   ५. स्कोरबोर्ड — दुवै टोलीको लाइभ स्कोर
   ===================================================================== */
const STATUS = { live: "लाइभ", scheduled: "हुनेछै", finished: "सकियो" };

const SectionScoreboard = () => {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({
    match_label: "", home_team: "", away_team: "", home_score: 0, away_score: 0, status: "live"
  });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setRows(await superApi.listScores()); } catch (e) { setMsg({ kind: "err", text: e.message }); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await superApi.createScore(form);
      setForm({ match_label: "", home_team: "", away_team: "", home_score: 0, away_score: 0, status: "live" });
      setMsg({ kind: "ok", text: "स्कोरबोर्ड थपियो।" });
      load();
    } catch (err) { setMsg({ kind: "err", text: err.message }); }
    finally { setBusy(false); }
  };

  /** स्कोर +1 / -1 — लाइभ अपडेटका लागि */
  const bump = async (row, side, delta) => {
    const key = side === "home" ? "home_score" : "away_score";
    try {
      setRows(await superApi.updateScore(row.id, { [key]: Math.max(0, Number(row[key]) + delta) }));
    } catch (e) { setMsg({ kind: "err", text: e.message }); }
  };

  const patch = async (row, data) => {
    try { setRows(await superApi.updateScore(row.id, data)); }
    catch (e) { setMsg({ kind: "err", text: e.message }); }
  };

  const act = async (fn, ok) => {
    setMsg(null);
    try { await fn(); setMsg({ kind: "ok", text: ok }); load(); }
    catch (e) { setMsg({ kind: "err", text: e.message }); }
  };

  if (!rows) return <Loading />;

  const scoreBox =
    "h-9 w-9 shrink-0 border border-slate-300 bg-white text-base font-black text-slate-900 hover:bg-slate-900 hover:text-white transition";

  return (
    <div className="space-y-5">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      <Panel title="नयाँ खेल थप्नुहोस्" desc="खेलकुद पेजको दायाँ बक्समा देखिनेछ।">
        <form onSubmit={create} className="space-y-4">
          <Field label="खेलको नाम">
            <input className={inputCls} value={form.match_label} onChange={(e) => setForm((s) => ({ ...s, match_label: e.target.value }))} placeholder="जस्तै: विश्व कप क्वार्टरफाइनल" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="होम टोली">
              <input className={inputCls} value={form.home_team} onChange={(e) => setForm((s) => ({ ...s, home_team: e.target.value }))} placeholder="नेपाल" required />
            </Field>
            <Field label="अवे टोली">
              <input className={inputCls} value={form.away_team} onChange={(e) => setForm((s) => ({ ...s, away_team: e.target.value }))} placeholder="भारत" required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="होम स्कोर">
              <input type="number" className={inputCls} value={form.home_score} onChange={(e) => setForm((s) => ({ ...s, home_score: e.target.value }))} />
            </Field>
            <Field label="अवे स्कोर">
              <input type="number" className={inputCls} value={form.away_score} onChange={(e) => setForm((s) => ({ ...s, away_score: e.target.value }))} />
            </Field>
            <Field label="स्थिति">
              <select className={inputCls} value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="live">लाइभ</option>
                <option value="scheduled">हुनेछै</option>
                <option value="finished">सकियो</option>
              </select>
            </Field>
          </div>
          <Btn type="submit" disabled={busy}>{busy ? "थप्दै…" : "खेल थप्नुहोस्"}</Btn>
        </form>
      </Panel>

      <Panel title="खेलहरू" desc="स्कोर नाप्न तल माथि ▲▼ थिच्नुहोस् — साइटमा तुरुन्त देखिनेछ।">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm font-bold text-slate-400">अझै कुनै खेल थपिएको छैन।</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="border border-slate-200 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">{r.match_label}</p>
                  <div className="flex flex-wrap gap-2">
                    <Btn kind={r.status === "live" ? "brand" : "soft"} onClick={() => patch(r, { status: r.status === "live" ? "finished" : "live" })}>
                      {STATUS[r.status] || r.status}
                    </Btn>
                    <Btn kind={r.show_float ? "soft" : "outline"} onClick={() => patch(r, { show_float: !r.show_float })}>
                      {r.show_float ? "फ्लोट देखिनेछ" : "फ्लोट लुकाएको"}
                    </Btn>
                    <Btn kind="danger" onClick={() => act(() => superApi.deleteScore(r.id), "खेल मेटियो।")}>मेटाउने</Btn>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <span className="truncate text-sm font-black text-slate-800">{r.home_team}</span>
                    <button className={scoreBox} onClick={() => bump(r, "home", 1)} title="+1">▲</button>
                    <span className="min-w-[3.5rem] border border-slate-300 bg-slate-900 px-3 py-2 text-center text-lg font-black text-white">
                      {r.home_score}
                    </span>
                    <button className={scoreBox} onClick={() => bump(r, "home", -1)} title="-1">▼</button>
                  </div>

                  <span className="shrink-0 px-2 text-xs font-black text-slate-300">–</span>

                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <button className={scoreBox} onClick={() => bump(r, "away", 1)} title="+1">▲</button>
                    <span className="min-w-[3.5rem] border border-slate-300 bg-slate-900 px-3 py-2 text-center text-lg font-black text-white">
                      {r.away_score}
                    </span>
                    <button className={scoreBox} onClick={() => bump(r, "away", -1)} title="-1">▼</button>
                    <span className="truncate text-sm font-black text-slate-800">{r.away_team}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export { SectionPolls, SectionScoreboard };
