import React, { useEffect, useState } from "react";
import { X, Save, Send, Upload, UserRound, Hash, CalendarDays, Youtube, Clock3 } from "lucide-react";
import { adminApi } from "../../services/adminApi";
import { categories } from "../../services/newsService";
import { absoluteUrl } from "../../services/api";
import { formatDateTime } from "../../utils/formatDateTime";
import RichTextEditor from "../../components/Editor/RichTextEditor";
import TagInput from "../../components/Editor/TagInput";

const catNames = categories.map((c) => ({ label: c.label || c.name, value: c.name }));

const Field = ({ label, icon: Icon, children, required }) => (
  <label className="block">
    <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-slate-600">{Icon && <Icon size={14} className="text-brand-600" />}{label}{required && <span className="text-red-500">*</span>}</span>
    {children}
  </label>
);

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white";

export default function NewsFormModal({ news, onClose, onSaved, setMsg }) {
  const [saving, setSaving] = useState(false);
  const [live, setLive] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setLive(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const nowStr = formatDateTime(live);
  const readingGuess = `${Math.max(1, Math.ceil(String(news?.content || "").split(/\s+/).filter(Boolean).length / 50))} मिनेट`;

  const [m, setM] = useState({
    id: news?.id || null,
    title: news?.title || "",
    subtitle: news?.subtitle || "",
    category: news?.category || "समाचार",
    content: news?.content || "",
    image: news?.image || "",
    file: null,
    yt_link: news?.yt_link || "",
    author: news?.author || "नागरिक जागरण",
    author_photo: news?.author_photo || "",
    author_bio: news?.author_bio || "",
    authorFile: null,
    tags: news?.tags || "",
    date: news?.date || nowStr,
    reading_time: news?.reading_time || "",
    status: news?.status || "published"
  });

  const set = (patch) => setM((p) => ({ ...p, ...patch }));

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) set({ file: f, image: URL.createObjectURL(f) });
    e.target.value = "";
  };
  const removeImage = () => set({ file: null, image: "" });
  const onAuthorFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    set({ authorFile: f, author_photo: URL.createObjectURL(f) });
    try {
      const fd = new FormData();
      fd.append("category", "author");
      fd.append("image", f);
      const up = await adminApi.upload(fd);
      set({ author_photo: up.url });
    } catch (err) {
      setMsg("लेखक फोटो अपलोड सकिएन: " + err.message);
    }
  };

  const saveNews = async (status) => {
    setSaving(true);
    const fd = new FormData();
    fd.append("title", m.title);
    fd.append("subtitle", m.subtitle || "");
    fd.append("category", m.category);
    fd.append("content", m.content);
    fd.append("author", m.author || "नागरिक जागरण");
    fd.append("author_photo", m.author_photo || "");
    fd.append("author_bio", m.author_bio || "");
    fd.append("yt_link", m.yt_link || "");
    fd.append("tags", m.tags || "");
    fd.append("date", m.date || nowStr);
    fd.append("reading_time", m.reading_time || readingGuess);
    fd.append("status", status);
    fd.append("summary", m.subtitle || "");
    if (m.file) fd.append("image", m.file);
    else fd.append("imageUrl", m.image && m.image.startsWith("http") ? m.image : m.image || "");
    try {
      if (m.id) await adminApi.updateNews(m.id, fd);
      else await adminApi.createNews(fd);
      onClose();
      setMsg(status === "draft" ? "ड्राफ्टमा बचत भयो" : "समाचार प्रकाशित भयो");
      onSaved && onSaved();
    } catch (err) {
      setMsg("बचत गर्न सकिएन: " + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6">
      <div className="relative my-4 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-blue-800 via-blue-600 to-sky-500 px-6 py-4">
          <div>
            <h3 className="text-lg font-black text-white">{m.id ? "समाचार सम्पादन" : "नयाँ समाचार सिर्जना"}</h3>
            <p className="text-xs font-bold text-blue-100">प्रकाशन मिति (स्वतः): {nowStr}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/15 p-2 text-white transition hover:rotate-90 hover:bg-white/30"><X size={20} /></button>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <Field label="शीर्षक" required><input className={inputCls} placeholder="समाचारको मुख्य शीर्षक..." value={m.title} onChange={(e) => set({ title: e.target.value })} /></Field>
            <Field label="उप-शीर्षक (Sub title)"><input className={inputCls} placeholder="छोटो उप-शीर्षक" value={m.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
            <Field label="समाचार विवरण" required><RichTextEditor value={m.content} onChange={(html) => set({ content: html })} placeholder="समाचारको पूर्ण विवरण यहाँ लेख्नुहोस्। माथिका बटनहरूबाट बोल्ड, इटालिक, रंग, पङ्क्ति र लिंक थप्न सक्नुहुन्छ..." /></Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="युट्युब भिडियो लिंक (मात्र १ वटा)" icon={Youtube}><input className={inputCls} placeholder="https://www.youtube.com/watch?v=..." value={m.yt_link} onChange={(e) => set({ yt_link: e.target.value })} /></Field>
              <Field label="पढ्न लाग्ने समय" icon={Clock3}><input className={inputCls} placeholder="जस्तै: 5 मिनेट" value={m.reading_time || readingGuess} onChange={(e) => set({ reading_time: e.target.value })} /></Field>
            </div>

            <Field label="ट्याग (मौद्रिक — मध्यम १० वटा)" icon={Hash}><TagInput value={m.tags} onChange={(tags) => set({ tags })} /></Field>
          </div>

          <div className="space-y-4">
            <Field label="श्रेणी" required>
              <select className={inputCls} value={m.category} onChange={(e) => set({ category: e.target.value })}>
                {catNames.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>

            <div>
              <span className="mb-1 block text-sm font-bold text-slate-600">मुख्य तस्वीर (थम्बनेल)</span>
              <div className="flex flex-wrap items-center gap-3">
                <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-blue-400 hover:text-blue-500">
                  <div className="text-center"><Upload size={20} className="mx-auto" /><span className="mt-1 block text-[11px] font-bold">छान्नुहोस्</span></div>
                  <input type="file" accept="image/*,.gif" className="hidden" onChange={onFile} />
                </label>
                {m.image && (
                  <div className="relative">
                    <img src={absoluteUrl(m.image)} alt="preview" className="h-24 w-24 rounded-2xl border-2 border-white bg-slate-100 object-contain shadow-md ring-1 ring-slate-200" />
                    <button type="button" onClick={removeImage} title="हटाउनुहोस्"
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"><X size={12} /></button>
                  </div>
                )}
                {m.file && <span className="text-xs font-bold text-emerald-600">नयाँ फाइल तयार छ</span>}
              </div>
            </div>

            <Field label="लेखक (नाम)" icon={UserRound}>
              <input className={inputCls} placeholder="लेखकको नाम" value={m.author} onChange={(e) => set({ author: e.target.value })} />
              <p className="mt-1 text-[11px] text-slate-400">खाली छोड्दा "नागरिक जागरण" हुनेछ</p>
            </Field>

            <Field label="लेखक परिचय (Bio)" icon={UserRound}>
              <textarea className={inputCls} rows={3} placeholder="लेखकको संक्षिप्त परिचय..." value={m.author_bio} onChange={(e) => set({ author_bio: e.target.value })} />
            </Field>

            <div>
              <span className="mb-1 block text-sm font-bold text-slate-600">लेखक फोटो (सानो)</span>
              <div className="flex items-center gap-3">
                <label className="grid h-14 w-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-blue-400">
                  {m.author_photo ? <img src={absoluteUrl(m.author_photo)} alt="लेखक" className="h-full w-full object-cover" /> : <Upload size={16} />}
                  <input type="file" accept="image/*" className="hidden" onChange={onAuthorFile} />
                </label>
                {m.author_photo && (
                  <button type="button" onClick={() => set({ author_photo: "", authorFile: null })} title="हटाउनुहोस्"
                    className="grid h-7 w-7 flex-none place-items-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"><X size={13} /></button>
                )}
                <p className="text-[11px] leading-tight text-slate-400">फोटो नराख्दा हेडरको लोगो स्वतः प्रयोग हुनेछ।</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
              <span className="mb-1 flex items-center gap-1.5 text-slate-400"><CalendarDays size={13} /> प्रकाशन मिति (नेपाली समयसहित)</span>
              {live.toLocaleString("ne-NP")}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
          <button type="button" onClick={() => saveNews("draft")} disabled={saving || !m.title.trim()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"><Save size={16} /> ड्राफ्टमा बचत</button>
          <button type="button" onClick={() => saveNews("published")} disabled={saving || !m.title.trim() || !m.content.trim()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:opacity-95 disabled:opacity-50"><Send size={16} /> प्रकाशित गर्नुहोस्</button>
        </div>
      </div>
    </div>
  );
}