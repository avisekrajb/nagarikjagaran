import React from "react";

export const Btn = ({ kind = "primary", children, disabled, ...p }) => {
  const styles = {
    primary: "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-600/25 hover:opacity-95",
    soft: "bg-blue-50 text-brand-700 hover:bg-blue-100",
    danger: "bg-blue-50 text-brand-600 hover:bg-blue-100",
    ghost: "border border-slate-200 text-slate-600 hover:bg-slate-50"
  };
  return <button {...p} disabled={disabled} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${styles[kind]}`}>{children}</button>;
};

export const Th = ({ children, className = "" }) => (
  <th className={`whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500 ${className}`}>
    {children}
  </th>
);
export const Td = ({ children, className = "" }) => (
  <td className={`border-t border-slate-100 px-4 py-3 ${className}`}>{children}</td>
);

export const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
    <div className="relative my-6 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-6 py-4">
        <h3 className="flex items-center gap-2.5 text-lg font-black text-white">{title}</h3>
        <button onClick={onClose} className="rounded-full bg-white/15 p-1.5 text-white transition hover:rotate-90 hover:bg-white/30"><X size={20}/></button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto p-6">{children}</div>
    </div>
  </div>
);

export const Input = ({ label, ...p }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-bold text-slate-600">{label}</span>
    <input {...p} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"/>
  </label>
);

export const TextArea = ({ label, ...p }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-bold text-slate-600">{label}</span>
    <textarea {...p} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white"/>
  </label>
);

export const ImagePicker = ({ file, setFile, preview, setPreview, hint, disabled }) => {
  const inputRef = React.useRef(null);
  const accept = (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type) && !/\.gif$/i.test(f.name)) {
      alert("कृपया फोटो वा GIF फाइल मात्र छान्नुहोस्");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const onFile = (e) => { accept(e.target.files && e.target.files[0]); e.target.value = ""; };
  const clear = () => { setFile(null); setPreview(""); };
  const src = preview || file;
  const isGif = src && (file ? file.type === "image/gif" : String(src).toLowerCase().includes(".gif"));

  return (
    <div
      className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); if (!disabled) accept(e.dataTransfer.files && e.dataTransfer.files[0]); }}
      onPaste={(e) => { if (!disabled) accept(e.clipboardData && e.clipboardData.files && e.clipboardData.files[0]); }}
    >
      <span className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-600"><ImagePlus size={15} className="text-brand-600"/> फोटो / GIF {file && <em className="not-italic text-xs font-bold text-emerald-600">• नयाँ फाइल तयार छ</em>}</span>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current && inputRef.current.click()}
          className="grid h-24 w-24 flex-none cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-400 transition hover:border-blue-400 hover:text-blue-500 disabled:opacity-50"
        >
          <div className="text-center">
            <ImagePlus size={22} className="mx-auto"/>
            <span className="mt-1 block text-[11px] font-bold">छान्नुहोस्</span>
          </div>
        </button>
        <input ref={inputRef} type="file" accept="image/*,.gif" className="hidden" onChange={onFile} disabled={disabled}/>
        {src ? (
          <div className="relative flex-none">
            {isGif && <span className="absolute left-1 top-1 z-10 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-white">GIF</span>}
            <img
              src={src.startsWith("http") ? src : absoluteUrl(src)}
              alt="preview"
              className="h-24 w-24 rounded-2xl border-2 border-white bg-white object-contain shadow-md ring-1 ring-slate-200"
            />
            {file && (
              <button type="button" onClick={clear} title="हटाउनुहोस्"
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600">
                <X size={12}/>
              </button>
            )}
          </div>
        ) : (
          <p className="max-w-[220px] text-[11px] font-bold leading-snug text-slate-400">{hint || "क्लिक गरी छान्नुहोस्, कि फाइल तानेर राख्नुहोस्, कि Ctrl+V गरी टाँस्नुहोस्"}</p>
        )}
        {file && (
          <div className="min-w-0 flex-1 text-[11px] font-bold leading-snug text-slate-400">
            <p className="truncate text-slate-700">{file.name}</p>
            <p>{(file.size / 1048576).toFixed(2)} MB • {isGif ? "चलचित्र (GIF)" : "स्थिर फोटो"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { X, ImagePlus } from "lucide-react";
import { absoluteUrl } from "../../../services/api";