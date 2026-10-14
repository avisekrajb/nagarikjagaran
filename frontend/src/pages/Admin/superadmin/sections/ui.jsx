import React from "react";
import { superApi, publicApi, adminApi } from "../../../../services/adminApi";

/* साझा UI टुक्रा — सुपर एडमिनका सबै सेक्सनमा काम लाग्छ */
export const Panel = ({ title, desc, right, children }) => (
  <section className="border border-slate-200 bg-white p-5 sm:p-6">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-black text-slate-900">{title}</h3>
        {desc && <p className="mt-1 text-xs font-bold text-slate-400">{desc}</p>}
      </div>
      {right}
    </div>
    {children}
  </section>
);

const KIND = {
  dark: "bg-slate-900 text-white hover:bg-slate-700",
  brand: "bg-brand-600 text-white hover:bg-brand-700",
  soft: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  outline: "border border-slate-300 text-slate-600 hover:bg-slate-50"
};

export const Btn = ({ children, kind = "dark", className = "", ...p }) => (
  <button
    {...p}
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${KIND[kind]} ${className}`}
  >
    {children}
  </button>
);

export const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-bold text-slate-600">{label}</span>
    {children}
    {hint && <span className="mt-1.5 block text-[11px] font-bold text-slate-400">{hint}</span>}
  </label>
);

export const inputCls =
  "w-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none transition focus:border-slate-900 focus:bg-white";

/** ON/OFF टगल */
export const Toggle = ({ on, onChange, label, hint }) => (
  <div className="flex items-start justify-between gap-4 border border-slate-200 bg-slate-50 p-4">
    <div className="min-w-0">
      <p className="text-sm font-black text-slate-800">{label}</p>
      {hint && <p className="mt-1 text-xs font-bold leading-relaxed text-slate-400">{hint}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={!!on}
      className={`relative h-7 w-12 shrink-0 transition ${on ? "bg-emerald-600" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 bg-white transition-all ${on ? "left-6" : "left-1"}`}
      />
    </button>
  </div>
);

/** टुक्रो डेटा टाइल */
export const Stat = ({ label, value }) => (
  <div className="border border-slate-200 bg-slate-50 px-4 py-3">
    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
  </div>
);

export const Alert = ({ kind = "info", children }) => {
  if (!children) return null;
  const k = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    err: "border-rose-200 bg-rose-50 text-rose-800"
  }[kind];
  return <div className={`mb-4 border px-4 py-3 text-sm font-bold ${k}`}>{children}</div>;
};

export const Loading = ({ text = "लोड हुँदैछ…" }) => (
  <p className="py-8 text-center text-sm font-bold text-slate-400">{text}</p>
);

export { superApi, publicApi, adminApi };
