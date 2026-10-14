import React, { useEffect, useState } from "react";
import { Panel, Btn, Field, inputCls, Alert, Loading, superApi, adminApi } from "./ui";

/* =====================================================================
   ६. विज्ञापन स्थान — कुन पेजमा कहाँ विज्ञापन देखिने, सुपर एडमिनले निर्धारण
   ===================================================================== */
const SectionAdPositions = () => {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ key_name: "", label: "", page_hint: "", sort_order: "" });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { setRows(await superApi.listAdPositions()); } catch (e) { setMsg({ kind: "err", text: e.message }); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await superApi.createAdPosition(form);
      setForm({ key_name: "", label: "", page_hint: "", sort_order: "" });
      setMsg({ kind: "ok", text: "नयाँ विज्ञापन स्थान थपियो।" });
      load();
    } catch (err) { setMsg({ kind: "err", text: err.message }); }
    finally { setBusy(false); }
  };

  const patch = async (row, data) => {
    try { setRows(await superApi.updateAdPosition(row.id, data)); }
    catch (e) { setMsg({ kind: "err", text: e.message }); }
  };

  const remove = async (row) => {
    setMsg(null);
    try {
      await superApi.deleteAdPosition(row.id);
      setMsg({ kind: "ok", text: "स्थान मेटियो।" });
      load();
    } catch (e) { setMsg({ kind: "err", text: e.message }); }
  };

  if (!rows) return <Loading />;

  return (
    <div className="space-y-5">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      <Panel title="नयाँ विज्ञापन स्थान थप्नुहोस्" desc="key अङ्रेजीमा मात्र हुनुपर्छ (जस्तै: home-sidebar)।">
        <form onSubmit={create} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="key" hint="अङ्रेजी, छोटो र आफ्नै ठाउँमा मिल्ने।">
              <input className={inputCls} value={form.key_name} onChange={(e) => setForm((s) => ({ ...s, key_name: e.target.value }))} placeholder="home-sidebar" required />
            </Field>
            <Field label="क्रम">
              <input type="number" className={inputCls} value={form.sort_order} onChange={(e) => setForm((s) => ({ ...s, sort_order: e.target.value }))} placeholder="15" />
            </Field>
          </div>
          <Field label="नाम (पाठकलाई नदेखिने, तर तपाईंलाई थाहा हुने)">
            <input className={inputCls} value={form.label} onChange={(e) => setForm((s) => ({ ...s, label: e.target.value }))} placeholder="गृहपृष्ठ साइडबार" />
          </Field>
          <Field label="कहाँ देखिने (विवरण)">
            <input className={inputCls} value={form.page_hint} onChange={(e) => setForm((s) => ({ ...s, page_hint: e.target.value }))} placeholder="गृहपृष्ठ — दायाँ साइडबार" />
          </Field>
          <Btn type="submit" disabled={busy}>{busy ? "थप्दै…" : "स्थान थप्नुहोस्"}</Btn>
        </form>
      </Panel>

      <Panel title="विज्ञापन स्थानहरू" desc={`कुल ${rows.length} · सक्रिय ${rows.filter((r) => r.is_enabled).length}`}>
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 border border-slate-200 p-3">
              <span className="shrink-0 border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] font-bold text-slate-500">
                {r.key_name}
              </span>

              <input
                className={`${inputCls} min-w-[160px] flex-1`}
                defaultValue={r.label}
                onBlur={(e) => e.target.value !== r.label && patch(r, { label: e.target.value })}
              />
              <input
                className={`${inputCls} min-w-[180px] flex-1`}
                defaultValue={r.page_hint}
                onBlur={(e) => e.target.value !== r.page_hint && patch(r, { page_hint: e.target.value })}
              />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => patch(r, { sort_order: Number(r.sort_order || 0) - 1 })}
                  className="border border-slate-200 px-2 py-1 text-xs font-black hover:bg-slate-50"
                >▲</button>
                <button
                  onClick={() => patch(r, { sort_order: Number(r.sort_order || 0) + 1 })}
                  className="border border-slate-200 px-2 py-1 text-xs font-black hover:bg-slate-50"
                >▼</button>
                <button
                  onClick={() => patch(r, { is_enabled: !r.is_enabled })}
                  className={`px-3 py-1 text-xs font-black ${r.is_enabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  {r.is_enabled ? "सक्रिय" : "बन्द"}
                </button>
                <Btn kind="danger" onClick={() => remove(r)}>मेटाउने</Btn>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
};

/* =====================================================================
   ७. लग + IP — कसले के गर्यो, कहाबाट आयो
   ===================================================================== */
const SectionLogs = () => {
  const [logs, setLogs] = useState(null);
  const [visitors, setVisitors] = useState(null);
  const [tab, setTab] = useState("logs");
  const [msg, setMsg] = useState(null);

  const load = async () => {
    try {
      const [l, v] = await Promise.all([adminApi.activityLogs(), adminApi.visitorStats("week")]);
      setLogs(l.logs || l || []);
      setVisitors(v.recentVisitors || []);
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    }
  };

  useEffect(() => { load(); }, []);

  if (!logs) return <Loading text="लग लोड हुँदैछ…" />;

  const th = "border-b border-slate-200 px-3 py-2 text-left text-[11px] font-black uppercase tracking-wider text-slate-400";
  const td = "border-b border-slate-100 px-3 py-2.5 text-xs font-bold text-slate-600";

  return (
    <div className="space-y-5">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      <div className="flex gap-2">
        <Btn kind={tab === "logs" ? "dark" : "outline"} onClick={() => setTab("logs")}>एडमिन लग</Btn>
        <Btn kind={tab === "visitors" ? "dark" : "outline"} onClick={() => setTab("visitors")}>पाठकको IP</Btn>
      </div>

      {tab === "logs" && (
        <Panel title="एडमिन लग" desc={`पछिल्ला ${logs.length} कार्य`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className={th}>कहिले</th>
                  <th className={th}>कसले</th>
                  <th className={th}>कार्य</th>
                  <th className={th}>विवरण</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className={td}>{new Date(l.created_at).toLocaleString("ne-NP")}</td>
                    <td className={td}>
                      <span className="text-slate-900">{l.admin_name || "—"}</span>
                      <span className="ml-1 text-[10px] font-bold text-slate-400">{l.admin_email || ""}</span>
                    </td>
                    <td className={td}><span className="bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">{l.action}</span></td>
                    <td className={td}>{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "visitors" && (
        <Panel title="पाठकको IP" desc={`पछिल्ला ${visitors.length} आगमन`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <th className={th}>कहिले</th>
                  <th className={th}>IP</th>
                  <th className={th}>पेज</th>
                  <th className={th}>उपकरण</th>
                  <th className={th}>कहाबाट</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <tr key={`${v.visitor_key}-${i}`} className="hover:bg-slate-50">
                    <td className={td}>{new Date(v.created_at).toLocaleString("ne-NP")}</td>
                    <td className={`${td} font-mono text-slate-900`}>{v.ip || "—"}</td>
                    <td className={td}>{v.path}</td>
                    <td className={td}>{v.device}</td>
                    <td className={td}><span className="block max-w-[220px] truncate">{v.referrer || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[11px] font-bold text-slate-400">
            IP नयाँ आगमनमा मात्र रेकर्ड हुन्छ (दोहोर्‍याएमा पनि)। पुराना आगमनमा IP नहुन सक्छ।
          </p>
        </Panel>
      )}
    </div>
  );
};

export { SectionAdPositions, SectionLogs };
