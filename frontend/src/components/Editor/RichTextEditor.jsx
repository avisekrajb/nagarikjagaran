import React, { useRef, useEffect, useState } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link2, Pen, RemoveFormatting, ImagePlus, Megaphone
} from "lucide-react";
import { adminApi } from "../../services/adminApi";
import { absoluteUrl } from "../../services/api";
import { cleanPastedHtml, cleanIfNeeded } from "../../utils/cleanHtml";
import { AD_POSITIONS } from "../Ads/AdSlot";

let activeEditor = null;
const focusEditor = () => { if (activeEditor) activeEditor.focus(); };

const cmd = (name, value = null) => {
  document.execCommand(name, false, value);
  focusEditor();
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sanitizeHtml = (s) => cleanPastedHtml(s);

const T = ({ icon: Icon, title, onClick, active = false }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); }}
    onClick={() => { onClick(); }}
    className={`grid h-8 w-8 place-items-center rounded-lg transition ${active ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-blue-50 hover:text-brand-600"}`}
  >
    <Icon size={15} />
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const focused = useRef(false);
  const adsRef = useRef(null);
  const [states, setStates] = useState({ bold: false, italic: false, underline: false });
  const [adOpen, setAdOpen] = useState(false);

  useEffect(() => {
    const close = (e) => {
      if (!adOpen) return;
      const host = adsRef.current;
      if (host && !host.contains(e.target)) setAdOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [adOpen]);

  useEffect(() => {
    activeEditor = ref.current;
    decorateImages();
    return () => { if (activeEditor === ref.current) activeEditor = null; };
  }, []);

  useEffect(() => {
    const sync = () => {
      setStates({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline")
      });
    };
    document.addEventListener("selectionchange", sync);
    return () => document.removeEventListener("selectionchange", sync);
  }, []);

  useEffect(() => {
    const removeImg = (e) => {
      const btn = e.target && e.target.closest && e.target.closest(".mini-del");
      if (!btn) return;
      const wrap = btn.closest(".mini-wrap");
      if (wrap) { wrap.remove(); emit(); focusEditor(); }
    };
    document.addEventListener("click", removeImg);
    return () => document.removeEventListener("click", removeImg);
  }, []);

  // बचत हुँदा पनि सफा पठाउने — पुरानो डाटामा रहेका टिप्पणी पनि हट्छन्
  const emit = () => {
    const el = ref.current;
    if (!el) return;
    const cleaned = cleanIfNeeded(el.innerHTML);
    if (cleaned !== el.innerHTML) el.innerHTML = cleaned;
    onChange(cleaned);
  };

  const decorateImages = () => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll("img.editor-img").forEach((img) => {
      if (img.closest(".mini-wrap")) return;
      const wrap = document.createElement("span");
      wrap.className = "mini-wrap";
      wrap.contentEditable = false;
      const clone = img.cloneNode(false);
      img.replaceWith(wrap);
      wrap.appendChild(clone);
      const del = document.createElement("button");
      del.type = "button";
      del.className = "mini-del";
      del.title = "फोटो मेट्नुहोस्";
      del.innerHTML = "&#10005;";
      wrap.appendChild(del);
    });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (focused.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
      decorateImages();
    }
  }, [value]);

  const hasSel = () => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || !sel.rangeCount || sel.isCollapsed) return false;
    const r = sel.getRangeAt(0);
    return el.contains(r.commonAncestorContainer);
  };

  const run = (name, value = null) => () => {
    if (!hasSel()) { focusEditor(); return; }
    cmd(name, value);
    syncStates();
  };

  const syncStates = () => setTimeout(() => {
    setStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline")
    });
  }, 0);

  const pickColor = (e) => { e.preventDefault(); if (hasSel()) cmd("foreColor", e.target.value); };

  const insertLink = () => {
    if (!hasSel()) { focusEditor(); return; }
    const url = window.prompt("लिंक URL लेख्नुहोस् (जस्तै: https://...)");
    if (url) { cmd("createLink", /^https?:\/\//i.test(url) ? url : "https://" + url); syncStates(); }
  };

  const insertAd = (pos, label) => {
    setAdOpen(false);
    const el = ref.current;
    if (!el) return;
    el.focus();
    const wrap = document.createElement("span");
    wrap.className = "mini-wrap ad-marker-wrap";
    wrap.contentEditable = false;
    const chip = document.createElement("span");
    chip.className = "ad-marker";
    chip.setAttribute("data-ad", pos);
    const del = document.createElement("button");
    del.type = "button";
    del.className = "mini-del";
    del.title = "विज्ञापन स्लट मेट्नुहोस्";
    del.innerHTML = "&#10005;";
    wrap.appendChild(chip);
    wrap.appendChild(del);
    chip.textContent = `${label}`;
    const sel = window.getSelection();
    let inserted = false;
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(wrap);
        range.setStartAfter(wrap);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        inserted = true;
      }
    }
    if (!inserted) el.appendChild(wrap);
    emit();
  };

  const buildImgWrap = (src) => {
    const wrap = document.createElement("span");
    wrap.className = "mini-wrap";
    wrap.contentEditable = false;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.className = "editor-img";
    const del = document.createElement("button");
    del.type = "button";
    del.className = "mini-del";
    del.title = "फोटो मेट्नुहोस्";
    del.innerHTML = "&#10005;";
    wrap.appendChild(img);
    wrap.appendChild(del);
    return { wrap, img };
  };

  const insertFile = (file) => {
    const el = ref.current;
    if (!el || !file) return;
    const { wrap, img } = buildImgWrap(URL.createObjectURL(file));
    el.focus();
    const sel = window.getSelection();
    let inserted = false;
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(wrap);
        range.setStartAfter(wrap);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        inserted = true;
      }
    }
    if (!inserted) el.appendChild(wrap);
    emit();
    const fd = new FormData();
    fd.append("category", "description");
    fd.append("image", file);
    adminApi.upload(fd)
      .then((res) => {
        if (res && res.url) {
          img.setAttribute("src", absoluteUrl(res.url));
          emit();
        }
      })
      .catch(() => {});
  };

  const insertImage = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (f) insertFile(f);
  };

  const onPaste = (e) => {
    const cd = e.clipboardData || {};
    if (cd.files && cd.files.length) {
      e.preventDefault();
      insertFile(cd.files[0]);
      return;
    }
    const html = cd.getData ? cd.getData("text/html") : "";
    const text = cd.getData ? cd.getData("text/plain") : "";
    if (html && /<[a-z][\s\S]*>/i.test(html)) {
      e.preventDefault();
      document.execCommand("insertHTML", false, sanitizeHtml(html));
    } else if (text) {
      e.preventDefault();
      const withLines = text.split(/\r?\n/).map((l) => l.trim() ? `<p>${escapeHtml(l)}</p>` : "<p><br></p>").join("");
      document.execCommand("insertHTML", false, withLines);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-blue-500">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-100 px-2 py-1.5">
        <T icon={Bold} title="मोटो" active={states.bold} onClick={run("bold")} />
        <T icon={Italic} title="इटालिक" active={states.italic} onClick={run("italic")} />
        <T icon={Underline} title="रेखाङ्कन" active={states.underline} onClick={run("underline")} />
        <span className="mx-1 h-5 w-px bg-slate-200"></span>
        <label className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-brand-600" title="रङ">
          <Pen size={15} />
          <input type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={pickColor} />
        </label>
        <span className="mx-1 h-5 w-px bg-slate-200"></span>
        <T icon={AlignLeft} title="बायाँ" onClick={run("justifyLeft")} />
        <T icon={AlignCenter} title="केन्द्र" onClick={run("justifyCenter")} />
        <T icon={AlignRight} title="दायाँ" onClick={run("justifyRight")} />
        <span className="mx-1 h-5 w-px bg-slate-200"></span>
        <T icon={Link2} title="लिंक" onClick={insertLink} />
        <T icon={List} title="बुलेट सूची" onClick={run("insertUnorderedList")} />
        <T icon={ListOrdered} title="क्रम सूची" onClick={run("insertOrderedList")} />
        <span className="mx-1 h-5 w-px bg-slate-200"></span>
        <T icon={RemoveFormatting} title="ढाँचा हटाउने (सादा पाठ)" onClick={run("removeFormat")} />
        <label onMouseDown={(e) => e.preventDefault()} title="फोटो थप्नुहोस्" className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-brand-600">
          <ImagePlus size={15} />
          <input type="file" accept="image/*,.gif" className="hidden" onChange={insertImage} />
        </label>
        <span className="mx-1 h-5 w-px bg-slate-200"></span>
        <div className="relative" ref={adsRef}>
          <T icon={Megaphone} title="विज्ञापन स्लट" active={adOpen} onClick={() => setAdOpen((o) => !o)} />
          {adOpen && (
            <div className="absolute left-0 top-9 z-30 max-h-72 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl">
              <p className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-400">विज्ञापनको ठाउँ छान्नुहोस्</p>
              {AD_POSITIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => insertAd(p.value, p.label)}
                  className="block w-full px-3 py-2 text-left text-sm transition hover:bg-blue-50"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || "समाचारको पूर्ण विवरण यहाँ लेख्नुहोस्। माथिका बटनहरूबाट बोल्ड, इटालिक, रंग, पङ्क्ति र लिंक थप्न सक्नुहुन्छ। फोटो पनि थप्न सक्नुहुन्छ..."}
        onInput={emit}
        onPaste={onPaste}
        onFocus={() => { focused.current = true; activeEditor = ref.current; }}
        onBlur={() => { focused.current = false; }}
        className="rich-editor min-h-[240px] max-h-[360px] overflow-y-auto bg-white p-4 text-[16px] leading-relaxed outline-none"
      />
    </div>
  );
}