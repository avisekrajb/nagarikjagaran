import React, { useEffect, useState } from "react";
import { Plus, GripVertical, RotateCcw, ExternalLink, Trash2, LayoutGrid } from "lucide-react";
import { Panel, Btn, inputCls, Alert, Loading, superApi } from "./ui";

/* मुख्य न्युबारको वास्तविक मेनु — MainNavigation.jsx सँग मिल्दो */
const DEFAULTS = [
  { path: "/",                 label: "गृहपृष्ठ" },
  { path: "/news",             label: "समाचार" },
  { path: "/world",            label: "विश्व" },
  { path: "/local-level",      label: "स्थानीय तह" },
  { path: "/art",              label: "कला/मनोरञ्जन" },
  { path: "/politics",         label: "राजनीति" },
  { path: "/opinion",          label: "विचार" },
  { path: "/sports",           label: "खेलकुद" },
  { path: "/miscellaneous",    label: "विविध" },
  { path: "/videos",           label: "भिडियो" },
  { path: "/patro",            label: "पात्रो" },
  { path: "/unicodeconverter", label: "युनिकोड" }
].map((d) => ({ ...d, enabled: 1 }));

/** नयाँ बटनको खाली ढाँचा */
const blank = () => ({ path: "/", label: "", enabled: 1, isNew: true });

const SectionNavbar = () => {
  const [items, setItems] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const saved = await superApi.getNav();
      setItems(saved?.length ? saved : DEFAULTS);
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
      setItems(DEFAULTS);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await superApi.saveNav(
        items
          .filter((i) => i.label.trim() && i.path.trim())
          .map((i) => ({ path: i.path.trim(), label: i.label.trim(), enabled: Number(i.enabled) ? 1 : 0 }))
      );
      setMsg({ kind: "ok", text: "न्युबार सुरक्षित भयो — साइट र होम ड्रपडाउनमा देखिनेछ।" });
      load();
    } catch (e) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const patch = (i, k, v) =>
    setItems((s) => s.map((it, ix) => (ix === i ? { ...it, [k]: v } : it)));

  const move = (i, dir) =>
    setItems((s) => {
      const n = [...s];
      const j = i + dir;
      if (j < 0 || j >= n.length) return s;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const removeAt = (i) =>
    setItems((s) => s.filter((_, ix) => ix !== i));

  const addNew = () =>
    setItems((s) => [...s, blank()]);

  if (!items) return <Loading />;

  const live = items.filter((i) => i.label.trim() && i.path.trim());
  const on = live.filter((i) => Number(i.enabled) === 1);

  return (
    <div className="space-y-5">
      <Alert kind={msg?.kind}>{msg?.text}</Alert>

      {/* सारांश */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "कुल बटन", v: live.length },
          { l: "सक्रिय", v: on.length },
          { l: "लुकाइएको", v: live.length - on.length },
          { l: "नयाँ थपिएका", v: items.filter((i) => i.isNew).length }
        ].map((x) => (
          <div key={x.l} className="border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{x.l}</p>
            <p className="mt-1 text-xl font-black text-slate-900">{x.v}</p>
          </div>
        ))}
      </div>

      <Panel
        title="न्युबार बटन"
        desc="नाम बदल्नुहोस्, नयाँ बटन थप्नुहोस्, क्रम मिलाउनुहोस् वा लुकाउनुहोस्।"
        right={
          <div className="flex flex-wrap gap-2">
            <Btn kind="soft" onClick={addNew}><Plus size={15} /> नयाँ बटन</Btn>
            <Btn kind="soft" onClick={() => setItems(DEFAULTS)}>
              <RotateCcw size={15} /> मूल
            </Btn>
            <Btn onClick={save} disabled={busy}>{busy ? "सुरक्षित हुँदै…" : "सुरक्षित गर्नुहोस्"}</Btn>
          </div>
        }
      >
        <ul className="space-y-2">
          {items.map((it, i) => {
            const empty = !it.label.trim() || !it.path.trim();
            return (
              <li
                key={i}
                className={`flex flex-wrap items-center gap-2 border p-3 transition ${
                  it.isNew ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-white"
                } ${Number(it.enabled) === 0 ? "opacity-60" : ""}`}
              >
                <span className="hidden w-4 flex-none cursor-grab text-slate-300 sm:block"><GripVertical size={14} /></span>

                <input
                  className={`${inputCls} w-32 flex-none text-center font-mono text-xs`}
                  value={it.path}
                  onChange={(e) => patch(i, "path", e.target.value)}
                  placeholder="/path"
                />
                <input
                  className={`${inputCls} min-w-[130px] flex-1`}
                  value={it.label}
                  onChange={(e) => patch(i, "label", e.target.value)}
                  placeholder="बटनको नाम"
                />

                {empty && (
                  <span className="bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700">खाली</span>
                )}
                {it.isNew && (
                  <span className="bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">नयाँ</span>
                )}

                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} title="माथि"
                    className="border border-slate-200 px-2 py-1 text-xs font-black hover:bg-slate-50">▲</button>
                  <button onClick={() => move(i, 1)} title="तल"
                    className="border border-slate-200 px-2 py-1 text-xs font-black hover:bg-slate-50">▼</button>
                  <button onClick={() => patch(i, "enabled", Number(it.enabled) ? 0 : 1)}
                    className={`px-3 py-1 text-xs font-black ${Number(it.enabled) ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {Number(it.enabled) ? "सक्रिय" : "लुकाएको"}
                  </button>
                  <button onClick={() => removeAt(i)} title="हटाउने"
                    className="border border-slate-200 px-2 py-1 text-rose-600 hover:bg-rose-50">
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {items.length === 0 && (
          <p className="py-6 text-center text-sm font-bold text-slate-400">
            कुनै बटन छैन — "नयाँ बटन" थिच्नुहोस्।
          </p>
        )}
      </Panel>

      {/* होम ड्रपडाउन पूर्वावलोकन */}
      <Panel
        title="होम ड्रपडाउनमा देखिनेछ"
        desc="गृहपृष्ठको मेनु-मा यी बटन देखिन्छन्।"
        right={<LayoutGrid size={16} className="text-slate-300" />}
      >
        {on.length ? (
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {on.map((i) => (
              <a key={i.path} href={i.path} target="_blank" rel="noreferrer"
                className="group flex items-center gap-2 border border-slate-200 px-3 py-2.5 text-sm font-black text-slate-700 transition hover:border-slate-900 hover:bg-slate-50">
                <ExternalLink size={12} className="flex-none text-slate-300 group-hover:text-slate-900" />
                <span className="truncate">{i.label}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm font-bold text-slate-400">कुनै बटन सक्रिय छैन।</p>
        )}
      </Panel>
    </div>
  );
};

export { SectionNavbar };
