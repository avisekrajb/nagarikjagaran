import React, { useState } from "react";
import { X, Plus } from "lucide-react";

const toTags = (v) => String(v || "").split(",").map((t) => t.replace(/^#/, "").trim()).filter(Boolean);

export default function TagInput({ value, onChange }) {
  const [text, setText] = useState("");
  const tags = toTags(value);

  const add = () => {
    const t = text.replace(/^#/, "").trim();
    if (!t) return;
    if (tags.length >= 10) return;
    if (tags.map((x) => x.toLowerCase()).includes(t.toLowerCase())) return;
    onChange([...tags, t].join(", "));
    setText("");
  };

  const keyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !text && tags.length) {
      onChange(tags.slice(0, -1).join(", "));
    }
  };

  const remove = (t) => onChange(tags.filter((x) => x !== t).join(", "));

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-500">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
            #{t}
            <button type="button" onClick={() => remove(t)} className="text-white/70 hover:text-white"><X size={11} /></button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={keyDown}
          placeholder={tags.length ? "" : "# ट्याग लेखेर Enter थिच्नुहोस्"}
          className="min-w-[140px] flex-1 bg-transparent px-1 text-sm outline-none"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400">{tags.length}/१० ट्याग — Enter वा कमाले ट्याग थपिन्छ</p>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-brand-600 hover:bg-blue-100"><Plus size={11} /> थप्नुहोस्</button>
      </div>
    </div>
  );
}