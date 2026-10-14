import React, { useEffect, useState } from "react";
import { X, Mail, Phone, MapPin, Search, CalendarDays, Type } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { categories } from "../../services/newsService";
import ContactModal from "../Common/ContactModal";

export default function MobileDrawer({ open, onClose }) {
  const [contact, setContact] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const go = (path) => { onClose(); nav(path); };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/50" onClick={onClose}>
      <aside onClick={(e) => e.stopPropagation()} className="drawer-panel">
        <div className="flex items-center justify-between border-b p-5">
          <b className="text-lg">नागरिक मेनु</b>
          <button onClick={onClose} aria-label="बन्द गर्नुहोस्"><X /></button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          {[{ name: "गृहपृष्ठ", path: "/" }, ...categories].map((i) => (
            <Link onClick={onClose} className="block border-b py-4 font-semibold" key={i.path} to={i.path}>
              {i.label || i.name}
            </Link>
          ))}

          <button
            onClick={() => go("/patro")}
            className="flex w-full items-center gap-2.5 border-b py-4 text-left font-semibold"
          >
            <CalendarDays size={17} className="text-slate-400" /> पात्रो
          </button>
          <button
            onClick={() => go("/unicodeconverter")}
            className="flex w-full items-center gap-2.5 border-b py-4 text-left font-semibold"
          >
            <Type size={17} className="text-slate-400" /> युनिकोड
          </button>
          <button
            onClick={() => go("/search")}
            className="flex w-full items-center gap-2.5 border-b py-4 text-left font-semibold"
          >
            <Search size={17} className="text-slate-400" /> समाचार खोज्नुहोस्
          </button>
        </div>

        {/* सम्पर्क — पपअप मोडलमा खुल्छ */}
        <div className="border-t bg-slate-50 p-4">
          <button
            onClick={() => { onClose(); setContact(true); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-black text-white transition hover:bg-blue-700"
          >
            <Mail size={16} /> सम्पर्क गर्नुहोस्
          </button>
          <div className="mt-3 space-y-1.5 text-xs font-bold text-slate-500">
            <p className="flex items-center gap-2"><Phone size={13} className="flex-none" /> +९७७ १ ४१२३४५६</p>
            <p className="flex items-center gap-2"><MapPin size={13} className="flex-none" /> काठमाडौं, नेपाल</p>
          </div>
        </div>
      </aside>

      <ContactModal open={contact} onClose={() => setContact(false)} />
    </div>
  );
}
