import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Check, AlertCircle } from "lucide-react";
import { sendContact } from "../../services/newsService";

const info = [
  { icon: Mail, title: "इमेल", value: "hello@nagariknews.example" },
  { icon: Phone, title: "फोन", value: "+९७७ १ ४१२३४५६" },
  { icon: MapPin, title: "ठेगाना", value: "नागरिक मिडिया प्रा.लि., काठमाडौं, नेपाल" }
];

const inputCls = (bad) =>
  `w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition duration-200 hover:border-brand-300 focus:border-brand-500 focus:ring-2 ${
    bad ? "border-red-400 focus:ring-red-200" : "border-slate-200 bg-white focus:ring-brand-200"
  }`;

/**
 * सम्पर्क फाराम — पेज र मोडल दुवैमा प्रयोग हुन्छ।
 * `compact` भए साइडबार जस्तो सानो लेआउटमा देखिन्छ।
 */
export default function ContactPanel({ compact = false, onSent }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErr, setFieldErr] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const fe = {};
    if (!form.name.trim()) fe.name = "नाम लेख्नुहोस्";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fe.email = "सही इमेल ठेगाना लेख्नुहोस्";
    if (form.message.trim().length < 5) fe.message = "सन्देश लेख्नुहोस्";
    setFieldErr(fe);
    if (Object.keys(fe).length) return;

    setBusy(true);
    try {
      await sendContact(form);
      setDone(true);
      setForm({ name: "", email: "", message: "" });
      if (onSent) onSent();
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      setError(err.message || "सन्देश पठाउन सकिएन");
    } finally {
      setBusy(false);
    }
  };

  const label = "mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500";
  const errLine = (k) => (
    <small className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
      <AlertCircle size={12} /> {fieldErr[k]}
    </small>
  );

  const Form = (
    <form onSubmit={submit} className="rounded-[22px] bg-white p-5 sm:p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>नाम</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="तपाईंको पूरा नाम"
            className={inputCls(fieldErr.name)}
          />
          {fieldErr.name && errLine("name")}
        </div>
        <div>
          <label className={label}>इमेल</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="तपाईंको इमेल"
            className={inputCls(fieldErr.email)}
          />
          {fieldErr.email && errLine("email")}
        </div>
      </div>

      <div className="mt-4">
        <label className={label}>सन्देश</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={compact ? 4 : 6}
          placeholder="यहाँ आफ्नो सन्देश लेख्नुहोस्..."
          className={`${inputCls(fieldErr.message)} resize-none`}
        />
        {fieldErr.message && errLine("message")}
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-1.5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <AlertCircle size={15} /> {error}
        </p>
      )}
      {done && (
        <p className="mt-4 flex items-center gap-1.5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
          <Check size={15} /> धन्यवाद! तपाईंको सन्देश प्राप्त भयो।
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3 font-black text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:opacity-60"
      >
        <Send size={16} /> {busy ? "पठाउँदै..." : "सन्देश पठाउनुहोस्"}
      </button>
    </form>
  );

  if (compact) return Form;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="snake-card">{Form}</div>
      <div className="space-y-5">
        {info.map(({ icon: Icon, title, value }) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-800">
              <Icon className="text-brand-600" size={18} /> {title}
            </h3>
            <p className="mt-2 break-all text-sm font-bold text-slate-500">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
